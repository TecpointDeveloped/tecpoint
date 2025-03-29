import { ReactNode } from "react";

export interface Product {
  id: string;
  categorias: string[];
  Subcategorias: string;
  descripcion: string;
  fecha_agregado: string | null;
  imagenes: { [key: string]: { id: string; img: string } };
  marca_producto: {
    logo: string;
    marca: string;
  };
  precio: {
    detalle: number | string;
    mayoreo: number | string;
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
      ficha_description: string | ReactNode;
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
    color?: string;
    modelId?: string;
    especificaciones?: Record<string, string>;
    tags?: string[];
    liquidacion?: boolean;
  },
  objectID?: string;
}

export interface GiftCode {
  benefit: {
    type: string;
    value: number | string | null;
  }
  code: string;
  created_at: string;
  expiration_date: string;
  is_active: boolean;
}

export type Logo = {
  key: string;
  logo: string;
  color?: string;
};

export interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: { imagen_01?: { id?: string, img?: string } } | string;
  precio?: number;
  producto?: string;
}

export interface BannerInterface {
  BannerID: string;
  marca: string;
  ImageBanner?: string;
  color?: string;
}