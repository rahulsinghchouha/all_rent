import { pgTable, uuid, pgEnum, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./usersTable";
import { conversationsTable } from "./conversationTable";

export const callTypeEnum = pgEnum("call_type", [
    "audio",
    "video",
]);

export const callStatusEnum = pgEnum("call_status", [
    "MISSED",
    "REJECTED",
    "ENDED",
]);

export const callsTable = pgTable("calls", {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").references(() => conversationsTable.id),
    callerId: uuid("caller_id").references(() => users.id),
    receiverId: uuid("receiver_id").references(() => users.id),
    callType: callTypeEnum("call_type").notNull(),
    callStatus: callStatusEnum("call_status").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    answeredAt: timestamp("answered_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at").defaultNow().notNull(),
    duration: integer("duration").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
