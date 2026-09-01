/**
 * Conversations Table
 * 
 * Stores chat conversations between two users
 * Used to track inquiries: product owner ↔ interested renter
 * 
 * Fields:
 * - userOneId, userTwoId: The two participants in the conversation
 * - created/updatedAt: Timestamps for tracking conversation history
 * 
 * Unique constraint ensures only one conversation per user pair
 */

import { pgTable, uuid, timestamp,unique} from "drizzle-orm/pg-core";
import {users} from "./usersTable";

export const conversationsTable = pgTable("conversations",{
id: uuid("id").primaryKey().defaultRandom(),
userOneId: uuid("user_one_id").references(()=>users.id).notNull(), 
userTwoId: uuid("user_two_id").references(()=>users.id).notNull(),
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
    unique("conversation_users_unique").on(
      table.userOneId,
      table.userTwoId
    ),
])