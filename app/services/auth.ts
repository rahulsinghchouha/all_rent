import { db } from "@/app/utils/dbConnect";
import { users } from "@/app/tables/usersTable";
import { InsertUser } from "@/app/tablesValidation/userValidation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "default_access_token_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? "default_refresh_token_secret";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export interface AuthPayload {
    id: string;
    userName: string;
    email: string;
}

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
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user || !user.password) {
        throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    return {
        id: user.id,
        userName: user.userName,
        email: user.email,
        createdAt: user.createdAt,
    };
}

export function createAccessToken(payload: AuthPayload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
}

export function createRefreshToken(payload: AuthPayload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthPayload;
}
