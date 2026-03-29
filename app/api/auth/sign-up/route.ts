import { NextResponse } from "next/server";
import { signUpSchema } from "@/app/tablesValidation/userValidation";

export async function POST(req: Request) {
  const body = await req.json();

  const parsedBody = signUpSchema.safeParse(body);

  if (!parsedBody.success) {
    console.error("Validation errors:", parsedBody.error.format());
    return NextResponse.json({ error: "Validation failed", details: parsedBody.error }, { status: 400 });
  }

  console.log("getting the parse body data", parsedBody.data);

  //make the call to this 

  return NextResponse.json({
    message: "User created",
    data: parsedBody.data,
  });
}