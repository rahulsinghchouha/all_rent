import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    userName: varchar("user_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    phoneVerified: boolean("phone_verified").default(false),
    password: varchar("password_hash"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
});