import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "../tables/usersTable";
import { z } from "zod";

export const signUpSchema = z.object({
  userName: z.string().min(3, "Name must be at least 3 characters").max(255),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine(val => val === true, "Must agree to terms")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password is required"),
});

export const insertUserSchema = createInsertSchema(users);

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;