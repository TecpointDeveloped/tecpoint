import ExcelJS from "exceljs";

export type SalesRankingItem = {
  sku: string;
  unitsSold: number;
  rank: number;
};

export type SalesWorkbookResult = {
  ranking: SalesRankingItem[];
  processedRows: number;
  worksheets: string[];
  quantityColumnDetected: boolean;
  sourceType: "excel" | "html";
};

const SKU_HEADERS = new Set([
  "sku",
  "codigo",
  "codigo de producto",
  "codigo producto",
  "codigo del producto",
  "codigo item",
  "codigo de item",
  "item",
  "item code",
  "cod",
]);

const QUANTITY_HEADERS = new Set([
  "cantidad",
  "unidades",
  "qty",
  "quantity",
  "cantidad vendida",
  "unidades vendidas",
  "unidades venta",
  "cantidad de venta",
]);

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cellText(cell: ExcelJS.Cell) {
  return String(cell.text || "").replace(/\s+/g, " ").trim();
}

function safeQuantity(value: unknown, fallbackText: string) {
  const direct = typeof value === "number" ? value : Number(String(value ?? "").replace(/,/g, ""));
  if (Number.isFinite(direct) && direct > 0) return direct;
  const parsed = Number(fallbackText.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export async function parseWholesaleSalesWorkbook(buffer: Buffer): Promise<SalesWorkbookResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const totals = new Map<string, number>();
  const worksheets: string[] = [];
  let processedRows = 0;
  let quantityColumnDetected = false;

  workbook.eachSheet((worksheet) => {
    let headerRowNumber = 0;
    let skuColumn = 0;
    let quantityColumn = 0;

    for (let rowNumber = 1; rowNumber <= Math.min(20, worksheet.rowCount); rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
        const header = normalizeHeader(cellText(cell));
        if (!skuColumn && SKU_HEADERS.has(header)) skuColumn = columnNumber;
        if (!quantityColumn && QUANTITY_HEADERS.has(header)) quantityColumn = columnNumber;
      });
      if (skuColumn) {
        headerRowNumber = rowNumber;
        break;
      }
      quantityColumn = 0;
    }

    if (!headerRowNumber || !skuColumn) return;
    worksheets.push(worksheet.name);
    quantityColumnDetected ||= quantityColumn > 0;

    for (let rowNumber = headerRowNumber + 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const sku = cellText(row.getCell(skuColumn)).toUpperCase();
      if (!sku) continue;

      const quantity = quantityColumn
        ? safeQuantity(row.getCell(quantityColumn).value, cellText(row.getCell(quantityColumn)))
        : 1;
      if (quantity <= 0) continue;

      totals.set(sku, (totals.get(sku) || 0) + quantity);
      processedRows += 1;
    }
  });

  if (!worksheets.length) {
    throw new Error("No se encontró una columna SKU o Código en las primeras 20 filas del Excel.");
  }
  if (!processedRows) {
    throw new Error("El Excel no contiene ventas válidas para procesar.");
  }

  const ranking = Array.from(totals, ([sku, unitsSold]) => ({ sku, unitsSold, rank: 0 }))
    .sort((left, right) => right.unitsSold - left.unitsSold || left.sku.localeCompare(right.sku))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { ranking, processedRows, worksheets, quantityColumnDetected, sourceType: "excel" };
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (_match, entity: string) => {
      if (entity[0] === "#") { const hex = entity[1]?.toLowerCase() === "x"; const point = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10); return Number.isFinite(point) ? String.fromCodePoint(point) : " "; }
      return entities[entity.toLowerCase()] || " ";
    }).replace(/\s+/g, " ").trim();
}

export function parseWholesaleSalesHtml(buffer: Buffer): SalesWorkbookResult {
  const html = buffer[0] === 0xff && buffer[1] === 0xfe ? buffer.subarray(2).toString("utf16le") : buffer.toString("utf8");
  if (!/<(?:html|table|tr)\b/i.test(html)) throw new Error("El archivo no contiene una tabla HTML válida.");
  const totals = new Map<string, number>();
  let processedRows = 0, quantityColumnDetected = false, recognizedTables = 0;
  for (const tableMatch of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    const rows = Array.from(tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi), match => Array.from(match[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi), cell => decodeHtml(cell[1]))).filter(row => row.length);
    let headerIndex = -1, skuColumn = -1, quantityColumn = -1;
    for (let index = 0; index < Math.min(20, rows.length); index += 1) {
      skuColumn = rows[index].findIndex(cell => SKU_HEADERS.has(normalizeHeader(cell)));
      quantityColumn = rows[index].findIndex(cell => QUANTITY_HEADERS.has(normalizeHeader(cell)));
      if (skuColumn >= 0) { headerIndex = index; break; }
    }
    if (headerIndex < 0) continue;
    recognizedTables += 1; quantityColumnDetected ||= quantityColumn >= 0;
    for (const row of rows.slice(headerIndex + 1)) {
      const sku = String(row[skuColumn] || "").trim().toUpperCase(); if (!sku) continue;
      const quantity = quantityColumn >= 0 ? safeQuantity(row[quantityColumn], row[quantityColumn] || "") : 1; if (quantity <= 0) continue;
      totals.set(sku, (totals.get(sku) || 0) + quantity); processedRows += 1;
    }
  }
  if (!recognizedTables) throw new Error("No se encontró una tabla con columna SKU o Código en el HTML.");
  if (!processedRows) throw new Error("El HTML no contiene ventas válidas para procesar.");
  const ranking = Array.from(totals, ([sku, unitsSold]) => ({ sku, unitsSold, rank: 0 })).sort((a, b) => b.unitsSold - a.unitsSold || a.sku.localeCompare(b.sku)).map((item, index) => ({ ...item, rank: index + 1 }));
  return { ranking, processedRows, worksheets: [`HTML · ${recognizedTables} tabla${recognizedTables === 1 ? "" : "s"}`], quantityColumnDetected, sourceType: "html" };
}

export async function parseWholesaleSalesFile(buffer: Buffer, fileName: string) {
  const start = buffer[0] === 0xff && buffer[1] === 0xfe ? buffer.subarray(2, 8194).toString("utf16le") : buffer.subarray(0, 4096).toString("utf8");
  if (/<(?:!doctype\s+html|html|table)\b/i.test(start)) return parseWholesaleSalesHtml(buffer);
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) return parseWholesaleSalesWorkbook(buffer);
  if (/\.(?:html?|xls)$/i.test(fileName)) return parseWholesaleSalesHtml(buffer);
  if (/\.xlsx$/i.test(fileName)) return parseWholesaleSalesWorkbook(buffer);
  throw new Error("Formato no reconocido. Suba Excel .xlsx o HTML .html/.htm.");
}
