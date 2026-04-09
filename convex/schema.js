import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clothes: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    imageId: v.id("_storage"),
    seasons: v.array(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }),
  outfits: defineTable({
    userId: v.string(),
    title: v.string(),
    occasion: v.string(),
    season: v.string(),
    weather: v.string(),
    styleVibe: v.optional(v.string()),
    itemIds: v.optional(v.array(v.id("clothes"))), // For generator outfits
    isFavorite: v.boolean(),
    createdAt: v.number(),
    // Legacy/GetAI fields
    baseItem: v.optional(v.object({
      type: v.string(),
      color: v.string(),
      colorName: v.string(),
    })),
    suggestion: v.optional(v.array(v.string())),
  }),
  plannedOutfits: defineTable({
    userId: v.string(),
    outfitId: v.id("outfits"),
    date: v.string(), // YYYY-MM-DD format
    createdAt: v.number(),
  }),
});
