import { db } from "@/app/utils/dbConnect";
import { users } from "@/app/tables/usersTable";
import { InsertUser } from "@/app/tablesValidation/userValidation";
import argon2 from "argon2";
export async function createUserService(userData: Pick<InsertUser, "userName" | "email"> & { password: string }) {
    try {
        if (!userData.password) {
            throw new Error("Password is required");
        }

        const hashedPassword = await argon2.hash(userData.password, {
            type: argon2.argon2id,  // recommended variant
            memoryCost: 65536,       // 64MB in KB
            timeCost: 3,             // iterations
            parallelism: 4,          // threads
        });


        const [newUser] = await db.insert(users).values({
            userName: userData.userName,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date(),
        }).returning({
            id: users.id,
            userName: users.userName,
            email: users.email,
            createdAt: users.createdAt,
        });

        return newUser;
    } catch (error: any) {
        if (error.code === '23505') { // Postgres error code for unique violation
            throw new Error("Email already exists");
        }
        throw error;
    }
}
