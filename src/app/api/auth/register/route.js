import { NextResponse } from "next/server";
import { registerUser } from "../../../../lib/controllers/auth_controller";

export const POST = async (request) => {
 try {
  let body;
  try {
   body = await requeXst.json();
  } catch (jsonError) {
   return NextResponse.json({ error: "Invalid JSON or empty body" }, { status: 400 });
  }
  const result = await registerUser(body);
  return NextResponse.json(result, { status: 201 });
 }catch (err) {
  return NextResponse.json({ error: err.message }, {status: err.status || 500 });
 }
};