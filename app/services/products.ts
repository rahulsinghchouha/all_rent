import { db } from "@/app/utils/dbConnect";
import { products } from "@/app/tables/productsTable";
import { insertProductSchema, InsertProduct } from "@/app/tablesValidation/productsValidation";
import { users } from "@/app/tables/usersTable";

export async function getDefaultOwnerId() {
  const [owner] = await db.select({ id: users.id }).from(users).limit(1);
  return owner?.id;
}

export async function createProductService(
  productData: Omit<InsertProduct, "id" | "createdAt" | "updatedAt" | "deletedAt"> & {
    ownerId?: string;
  }
) {
  const ownerId =
    productData.ownerId ||
    process.env.DEFAULT_OWNER_ID ||
    (await getDefaultOwnerId());

  if (!ownerId) {
    throw new Error("No product owner configured. Set DEFAULT_OWNER_ID or create a user first.");
  }

  const payload = {
    ...productData,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishDate: productData.publishDate ? new Date(productData.publishDate as any) : undefined,
  };

  const parsed = insertProductSchema.safeParse(payload);
  if (!parsed.success) {
    const formatted = parsed.error.format();
    const messages = Object.entries(formatted)
      .map(([key, value]) => {
        if (typeof value === "object" && value && "_errors" in value) {
          return `${key}: ${(value as any)._errors.join(", ")}`;
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
      imageUrl: products.imageUrl,
      status: products.status,
      publishDate: products.publishDate,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    });

  return newProduct;
}
