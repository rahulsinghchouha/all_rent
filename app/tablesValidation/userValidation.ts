import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "../tables/usersTable";
import { z } from "zod";

export const signUpSchema = z.object({
  userName: z.string().min(3, "Name must be at least 3 characters").max(255),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  terms: z.boolean().refine(val => val === true, "Must agree to terms")
});

export const insertUserSchema = createInsertSchema(users);

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;