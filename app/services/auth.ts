import { db } from "@/app/utils/dbConnect";
import { users } from "@/app/tables/usersTable";
import { InsertUser } from "@/app/tablesValidation/userValidation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function createUserService(userData: Pick<InsertUser, "userName" | "email"> & { password: string }) {
    try {
        if (!userData.password) {
            throw new Error("Password is required");
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);

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
        if (error.code === '23505') {
            throw new Error("Email already exists");
        }
        throw error;
    }
}

export async function loginUserService(email: string, password: string) {
    // Find user by email
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (!user.password) {
        throw new Error("Invalid email or password");
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    // Return safe user (no password)
    return {
        id: user.id,
        userName: user.userName,
        email: user.email,
        createdAt: user.createdAt,
    };
}
