import { NextResponse } from "next/server";
import { loginUser } from "@/lib/controllers/auth_controller";

export const POST = async (request) => {
 try {
  let body;
  try {
   body = await request.json();
  } catch (jsonError) {
   return NextResponse.json({ error: "Invalid JSON or empty body" }, { status: 400 });
  }
  const result = await loginUser(body);
  return NextResponse.json(result); // Cookie is automatically attached to the response!
 } catch (err) {
  return NextResponse.json({ error: err.message }, {status: err.status || 400 });
 }
};