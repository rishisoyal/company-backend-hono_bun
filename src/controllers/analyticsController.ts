import axios from "axios";
import { Context } from "hono";
import { config } from "dotenv";

config();
const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
const UMAMI_BASE_URL = process.env.UMAMI_BASE_URL;
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

export async function getRealTimeAnalytics(c: Context) {
  try {
    // fetch real time data
    let res = await axios.get(
      `${UMAMI_BASE_URL}/realtime/${UMAMI_WEBSITE_ID}`,
      {
        headers: {
          "x-umami-api-key": UMAMI_API_KEY,
        },
      }
    );
    const realTimeData = res.data;

    return c.json({ realTimeData });
  } catch (error: any) {
    return c.json({ error }, 500);
  }
}

export async function getGeneralStas(c: Context) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  try {
    // fetch real time data
    let res = await axios.get(
      `${UMAMI_BASE_URL}/websites/${UMAMI_WEBSITE_ID}/stats`,
      {
        headers: {
          "x-umami-api-key": UMAMI_API_KEY,
        },
        params: {
          startAt: oneDayAgo,
          endAt: now,
        },
      }
    );

    const generalStats = res.data;

    return c.json({ generalStats });
  } catch (error: any) {
    return c.json({ error }, 500);
  }
}

export async function getMetrics(c: Context) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const type = c.req.query("type");
  if (!type)
    return c.json(
      {
        message: "please provide metrics type",
      },
      400
    );

  try {
    // fetch real time data
    let res = await axios.get(
      `${UMAMI_BASE_URL}/websites/${UMAMI_WEBSITE_ID}/metrics`,
      {
        headers: {
          "x-umami-api-key": UMAMI_API_KEY,
        },
        params: {
          startAt: oneDayAgo,
          endAt: now,
          type: type,
        },
      }
    );

    const metrics = res.data;

    return c.json({ metrics }, 200);
  } catch (error: any) {
    return c.json({ error }, 500);
  }
}
