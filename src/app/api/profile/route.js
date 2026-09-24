import { NextResponse } from "next/server";
import { getUserProfile, saveUserProfile } from "../../../lib/controllers/profile_controller";
import { authorize } from "../../../lib/middlewares/auth";

export const GET = async () => {
  try {
    const user = await authorize();
    const profile = await getUserProfile(user);
    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};

export const POST = async (request) => {
  try {
    const user = await authorize();
    const body = await request.json();
    const profile = await saveUserProfile(user, body);
    return NextResponse.json(profile, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 400 });
  }
};