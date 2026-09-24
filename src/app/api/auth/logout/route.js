// src/app/api/auth/logout/route.js

import { NextResponse } from "next/server";
import { logoutUser } from "../../../../lib/controllers/auth_controller";

export const POST = async () => {
  try {
    const result = await logoutUser();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};