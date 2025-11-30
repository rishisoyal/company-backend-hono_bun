import { Hono } from "hono";
import { getAnalytics } from "../controllers/analyticsController";

const analyticsRouter = new Hono()

analyticsRouter.get("/", getAnalytics);

export default analyticsRouter