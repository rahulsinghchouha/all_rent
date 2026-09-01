/**
 * Messages Table
 * 
 * Stores individual messages within conversations
 * Each message belongs to a conversation and has a sender
 * 
 * Fields:
 * - conversationId: Links to the conversation
 * - senderId: User who sent the message (owner or renter)
 * - content: Message text
 * - messageType: Type of message (TEXT, IMAGE, etc.)
 * - created/updatedAt: Message timestamps
 */

import { pgTable, uuid, timestamp, text,varchar} from "drizzle-orm/pg-core";
import {conversationsTable} from "./conversationTable";
import { users } from "./usersTable";

export const message = pgTable("message", {
id: uuid("id").primaryKey().defaultRandom(),
conversationId : uuid("conversation_id").references(()=> conversationsTable.id).notNull(),
senderId : uuid("sender_id").references(()=> users.id).notNull(),
content : text("content").notNull(),
messageType : varchar("message_type",{length:20}).notNull().default("TEXT"), 
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull()
})