import { Context } from "hono";
import TextContent from "../models/TextContentModel";
import MediaContent from "../models/MediaContentModel";
import CardContent from "../models/CardContentModel";
import mongoose from "mongoose";
import supabaseMediaUpload from "../lib/supabaseMediaUpload";

const contentTypes = ["text", "media", "card"];
const pages = ["home", "about", "solutions", "services", "industries", "contact"];

const contentModels: Record<string, mongoose.Model<any>> = {
  text: TextContent,
  media: MediaContent,
  card: CardContent,
};

export const getContent = async (c: Context) => {
  const query = c.req.query();
  const { page, contentType } = query;

  if (!contentType)
    return c.json({ message: "please provide a content type to fetch" }, 401);
  if (!page)
    return c.json({ message: "please provide page to fetch data from" }, 401);
  if (!contentTypes.includes(contentType))
    return c.json({ message: `invalid content type ${contentType}` }, 401);
  if (!pages.includes(page))
    return c.json({ message: `could not find page ${page}` }, 401);

  const Model = contentModels[contentType];
  try {
    const data = await Model.findOne({ page });
    if (!data) return c.json({ message: "could not fetch data" }, 400);

    return c.json({ data }, 200);
  } catch (err) {
    return c.json({ message: "error fetching content", error: `${err}` }, 500);
  }
};

export const postContent = async (c: Context) => {
  const query = c.req.query();
  const { contentType, page, blockType } = query;

  if (!contentType) return c.json({ message: "please provide a content type" }, 400);
  if (!page) return c.json({ message: "please provide page" }, 400);
  if (!blockType) return c.json({ message: "please provide block type" }, 400);

  if (!contentTypes.includes(contentType))
    return c.json({ message: `invalid content type ${contentType}` }, 400);
  if (!pages.includes(page))
    return c.json({ message: `could not find page ${page}` }, 400);

  // TEXT
  if (contentType === "text") {
    const { title, subtitle, text } = await c.req.json();

    try {
      const data = await TextContent.findOneAndUpdate(
        { page },
        {
          $set: {
            "content.$[item].title": title || "",
            "content.$[item].subtitle": subtitle || "",
            "content.$[item].text": text || "",
          },
        },
        { arrayFilters: [{ "item.block_type": blockType }] }
      );

      if (!data)
        return c.json({ message: "could not post data" }, 401);

      return c.json({ message: "successfully updated data", data }, 201);
    } catch (err: any) {
      return c.json({ message: "error updating text", error: err.message }, 500);
    }
  }

  // MEDIA
  if (contentType === "media") {
    const form = await c.req.parseBody();
    const file = form["media"] as File;

    if (!file) return c.json({ message: "no file uploaded" }, 400);

    try {
      const media_path = await supabaseMediaUpload(file);
      if (!media_path)
        return c.json({ message: "could not upload to supabase" }, 401);

      const data = await MediaContent.findOneAndUpdate(
        { page, "content.block_type": blockType },
        {
          $set: { "content.$[item].media_path": media_path },
        },
        { arrayFilters: [{ "item.block_type": blockType }] }
      );

      if (!data) return c.json({ message: "could not post data" }, 400);

      return c.json({ message: "success", data }, 200);
    } catch (err: any) {
      return c.json({ message: "error", error: err.message }, 500);
    }
  }

  // CARD
  if (contentType === "card") {
    const { cards } = await c.req.json();

    if (!cards || !Array.isArray(cards))
      return c.json({ message: "cards array is required" }, 401);

    const newCards = cards.map((c: any) => ({
      ...c,
      _id: new mongoose.Types.ObjectId(c._id),
    }));

    try {
      const data = await CardContent.findOneAndUpdate(
        { page },
        { $set: { "content.$[item].cards": newCards } },
        {
          arrayFilters: [{ "item.block_type": blockType }],
          new: true,
          strict: false,
        }
      );

      if (!data)
        return c.json({ message: "could not update card data" }, 400);

      return c.json({ message: "success", data }, 201);
    } catch (err: any) {
      return c.json({ message: "error updating cards", error: err.message }, 500);
    }
  }
};
