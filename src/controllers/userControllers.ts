import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { Context } from "hono";
import User from "../models/UserModel";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";

export async function userLogIn(c: Context) {
  const body = await c.req.json();
  const { name, password } = body;

  if (!name || !password) {
    return c.json({ error: "Missing credentials" }, 400);
  }

  const user = await User.findOne({ name });
  if (!user) return c.json({ error: "User not found" }, 401);

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = await new SignJWT({
    uid: user._id.toString(),
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2d")
    .sign(new TextEncoder().encode(process.env.TOKEN_SECRET));

  const isProd = process.env.BUN_ENV === "production";

  setCookie(c, "auth_token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
    maxAge: 2 * 24 * 60 * 60,
  });

  return c.json({ message: "success" }, 200);
}

export async function userLogOut(c: Context) {
  const token = getCookie(c, "auth_token");

  if (!token) return c.json({ error: "Token not found" }, 401);

  deleteCookie(c, "auth_token", { path: "/" });

  return c.json({ message: "logged out" }, 200);
}
