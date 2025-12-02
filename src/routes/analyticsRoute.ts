import { Hono } from "hono";
import { getGeneralStas, getRealTimeAnalytics, getMetrics } from "../controllers/analyticsController";

const analyticsRouter = new Hono()

analyticsRouter.get("/realtime", getRealTimeAnalytics);
analyticsRouter.get("/stats", getGeneralStas);
analyticsRouter.get("/metrics", getMetrics);

export default analyticsRouter