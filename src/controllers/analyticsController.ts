import axios from "axios";
import { Context } from "hono";
import { config } from "dotenv";

config();
const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
const UMAMI_BASE_URL = process.env.UMAMI_BASE_URL;
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

export async function getAnalytics(c: Context) {
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

    // getch general stats
    // const now = Date.now();
    // const oneDayAgo = now - 24 * 60 * 60 * 1000;
    // res = await axios.get(
    //   `${UMAMI_BASE_URL}/websites/${UMAMI_WEBSITE_ID}/stats`,
    //   {
    //     headers: {
    //       "x-umami-api-key": UMAMI_API_KEY,
    //     },
    //     params: {
    //       startAt: oneDayAgo,
    //       endAt: now,
    //     },
    //   }
    // );
    // const generalStats = res.data;

    return c.json({ realTimeData });
  } catch (error: any) {
    return c.json({ error }, 500);
  }
}
