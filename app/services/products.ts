import { db } from "@/app/utils/dbConnect";
import { products } from "@/app/tables/productsTable";
import { insertProductSchema, InsertProduct } from "@/app/tablesValidation/productsValidation";
import { and, eq } from "drizzle-orm";

export async function createProductService(
  productData: Omit<InsertProduct, "id" | "createdAt" | "updatedAt" | "deletedAt"> & {
    ownerId: string;
  }
) {
  console.log("Creating product with data:", productData);
  const ownerId = productData.ownerId;

  if (!ownerId) {
    throw new Error("Product ownerId is required.");
  }

  const payload = {
    ...productData,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishDate: productData.publishDate ? new Date(String(productData.publishDate)) : undefined,
  };

  const parsed = insertProductSchema.safeParse(payload);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    const messages = Object.entries(formatted)
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null && "_errors" in value) {
          const typedValue = value as { _errors?: string[] };
          return `${key}: ${typedValue._errors?.join(", ") ?? "Invalid value"}`;
        }
        return `${key}: ${String(value)}`;
      })
      .filter(Boolean)
      .join("; ");
    throw new Error(`Validation failed: ${messages}`);
  }

  const [newProduct] = await db
    .insert(products)
    .values(parsed.data)
    .returning({
      id: products.id,
      title: products.title,
      ownerId: products.ownerId,
      category: products.category,
      pricePerDay: products.pricePerDay,
      badge: products.badge,
      imageUrls: products.imageUrls,
      status: products.status,
      publishDate: products.publishDate,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    });

  return newProduct;
}

export type ProductFilters = {
  status?: string;
  ownerId?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export async function getProductsService(filters: ProductFilters = {}) {
  const conditions = [
    filters.status ? eq(products.status, filters.status) : undefined,
    filters.ownerId ? eq(products.ownerId, filters.ownerId) : undefined,
    filters.category ? eq(products.category, filters.category) : undefined,
  ];

  return await db
    .select({
      id: products.id,
      title: products.title,
      ownerId: products.ownerId,
      category: products.category,
      pricePerDay: products.pricePerDay,
      badge: products.badge,
      imageUrls: products.imageUrls,
      status: products.status,
      publishDate: products.publishDate,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(and(...conditions))
    .limit(filters.limit ?? 50)
    .offset(filters.offset ?? 0);
}

export async function getProductByIdService(id: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product ?? null;
}
