import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "../tables/productsTable";
import { z } from "zod";

export const insertProductSchema = createInsertSchema(products, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters").max(255),
  category: (schema) => schema.min(3, "Category must be at least 3 characters").max(100),
  pricePerDay: (schema) => schema.positive("Price must be a positive number"),
  description: (schema) => schema.max(2000, "Description must be 2000 characters or fewer").optional(),
  address: (schema) => schema.max(255, "Address must be 255 characters or fewer").optional(),
  city: (schema) => schema.max(100, "City must be 100 characters or fewer").optional(),
});

export const selectProductSchema = createSelectSchema(products);

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;

