import { NextResponse } from "next/server";
import { authorize } from "../../../../lib/middlewares/auth";

export const GET = async () => {
  try {
    const user = await authorize();
    const { iat, exp, ...userData } = user;
    return NextResponse.json(userData);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 401 });
  }
};