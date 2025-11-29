import { Hono } from "hono";
import { userLogIn, userLogOut } from "../controllers/userControllers";

const userRouter = new Hono();

userRouter.post("/login", userLogIn);
userRouter.delete("/logout", userLogOut);

export default userRouter;
