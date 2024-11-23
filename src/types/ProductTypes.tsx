export interface Product {
  id: string;
  categorias: string[];
  descripcion: string;
  fecha_agregado: string | null;
  imagenes: { [key: string]: { id: string; img: string } };
  marca_producto: {
    logo: string;
    marca: string;
  };
  precio: {
    detalle: number;
    mayoreo: number;
  };
  producto: string;
  sku: string;
  slug: string;
  upc?: string;
  stock?: string;
}