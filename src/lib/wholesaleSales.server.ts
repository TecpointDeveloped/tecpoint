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

  return { ranking, processedRows, worksheets, quantityColumnDetected };
}
