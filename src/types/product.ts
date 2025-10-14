export type Product = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  price: string;
  compareAtPrice?: number;
  isDiscounted?: boolean;
  stock?: number;
  categorySlug?: string;
  tagSlugs?: string[];
  status: "ACTIVE" | "DRAFT" | "HIDDEN";
  createdAt?: string;
  updatedAt?: string;
};

export type CreateProductDTO = {
  title: string;
  slug: string;
  price: number;
  stock?: number;
  image?: string;
  compareAtPrice?: number;
  isDiscounted?: boolean;
  status?: "ACTIVE" | "DRAFT" | "HIDDEN";
  categorySlug?: string;
  tagSlugs?: string[];
};

export type ProductListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  tag?: string;
  discounted?: "true" | "false";
}