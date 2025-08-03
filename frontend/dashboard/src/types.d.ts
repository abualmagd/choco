interface Product {
  id: number | undefined;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number;
  costPrice: number;
  sku: string;
  brand: string;
  trackInventory: boolean | undefined;
  inventoryQuantity: number;
  allowBackorder: boolean | undefined;
  weight: number | undefined;
  height: number | undefined;
  width: number | undefined;
  length: number | undefined;
  isActive: boolean | undefined;
  isFeatured: boolean | undefined;
  isDigital: boolean | undefined;
  downloadUrl: string | undefined;
  seoTitle: string | undefined;
  seoDescription: string | undefined;
  categories: Array<Category>;
  images: Array<ProductImage>;
}

interface Category {
  id: number | undefined;
  name: string;
  slug: string;
  description: string | undefined;
  image: string | undefined;
  isActive: boolean | undefined;
  parentId: number | undefined;
  children: Array<Category>;
}

interface ProductImage {
  id: number | undefined;
  src: string;
  altText: string;
}
