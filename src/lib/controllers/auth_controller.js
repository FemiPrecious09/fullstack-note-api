import { cookies } from "next/headers";
import { createUserDB, loginUserDB } from "@/lib/models/auth_model";
import jwt from "jsonwebtoken";
import crypt from "bcryptjs";

// 1. REGISTER USER
export const registerUser = async (body) => {
  try {
    const { username, password } = body;
    if (!username || !password) {
      const err = new Error("Username and Password are required");
      err.status = 400; // Attach status to the error!
      throw err;
    }
    
    const results = await createUserDB(username, password);
    if (!results) throw new Error("Invalid Username");
    
    return { message: "Account Created Successfully", data: results };
    
  } catch (err) {
    // Handle Postgres unique constraint violation
    if (err.code === "23505") {
      const error = new Error("That username is already taken. Please choose another one.");
      error.status = 409; // 409 Conflict
      throw error;
    }
    throw err;
  }
};

// 2. LOGIN USER
export const loginUser = async (body) => {
  const { username, password } = body;
  if (!username || !password) {
    const err = new Error("Username and Password are required");
    err.status = 400;
    throw err;
  }
  
  const results = await loginUserDB(username);
  if (!results) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  
  const isMatch = crypt.compareSync(password, results.password);
  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }
  
  const { password: mypassword, ...userdata } = results;
  const token = jwt.sign(userdata, process.env.MY_SECRET_KEY, { expiresIn: "1h" });
  
  // Set cookie using Next.js helper
  const cookieStore = await cookies(); // Note: awaited in Next.js 15
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Best practice
    sameSite: "strict",
    maxAge: 60 * 60, // ⚠️ Next.js uses SECONDS, not milliseconds! (1 hour)
    path: "/",
  });

  return { message: "Logged In Successfully", data: userdata };
};

// 3. LOGOUT USER
export const logoutUser = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return { message: "Logged Out Successfully" };
};

