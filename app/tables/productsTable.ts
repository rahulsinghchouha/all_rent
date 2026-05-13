import { pgTable, uuid, varchar, timestamp, integer, numeric } from "drizzle-orm/pg-core"
import { users } from "./usersTable"

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    ownerId: uuid("owner_id").references(() => users.id).notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).default('0'),
    reviewsCount: integer("reviews_count").default(0),
    pricePerDay: integer("price_per_day").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    badge: varchar("badge", { length: 50 }),
    imageUrl: varchar("image_url", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});
