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
  banner?: {
    color?: string;
    image_banner?: string
  };
  secciones?: {
    ficha_descriptiva: {
      ficha_description: string;
      ficha_image: string;
      ficha_title: string;
    }
    seccion_01: {
      imagenUrl: string;
      title: string;
    }
    seccion_02: {
      imagenUrl: string;
      title: string;
    }
  }
  extradata?: {
    stock?: boolean;
    discount?: number;
    upc?: string;
    modelId?: string;
    especificaciones?: Record<string, string>;
  }
}