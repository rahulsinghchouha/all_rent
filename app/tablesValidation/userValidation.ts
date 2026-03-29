import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "../tables/usersTable";
import { z } from "zod";

export const insertUserSchema = createInsertSchema(users, {
  userName: (s) => s.min(3).max(255),
  email: (s) => s.email(),
  countryCode: (s) => s.regex(/^\+\d{1,3}$/).optional(),
  phoneNumber: (s) => s.regex(/^\+[1-9]\d{1,14}$/, "Phone must be in E.164 format")
                       .optional(),
  passwordHash: (s)=>s
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

export const selectUserSchema = createSelectSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;