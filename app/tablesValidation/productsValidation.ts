import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "../tables/productsTable";
import { z } from "zod";

export const insertProductSchema = createInsertSchema(products, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters").max(255),
  pricePerDay: (schema) => schema.positive("Price must be a positive number"),
});

export const selectProductSchema = createSelectSchema(products);

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;
