import { pgTable, uuid, timestamp,unique} from "drizzle-orm/pg-core";
import {users} from "./usersTable";

export const conversations = pgTable("conversations",{
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