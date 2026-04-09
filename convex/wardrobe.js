import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getUrlForAction = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const addClothingItem = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    imageId: v.id("_storage"),
    seasons: v.array(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clothes", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getUserClothes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Return empty if userId not provided
    if (!args.userId) return [];
    
    const clothes = await ctx.db
      .query("clothes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc") // Order newest first
      .collect();

    // Map over clothes and add the generated storage URL
    return Promise.all(
      clothes.map(async (item) => ({
        ...item,
        imageUrl: await ctx.storage.getUrl(item.imageId),
      }))
    );
  },
});

export const deleteClothingItem = mutation({
  args: { itemId: v.id("clothes") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return;

    // Delete image from storage to clean up
    if (item.imageId) {
      await ctx.storage.delete(item.imageId);
    }
    // Delete item from db
    return await ctx.db.delete(args.itemId);
  },
});

export const updateClothingItem = mutation({
  args: {
    itemId: v.id("clothes"),
    name: v.string(),
    category: v.string(),
    seasons: v.array(v.string()),
    color: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { itemId, imageId, ...updates } = args;
    const existing = await ctx.db.get(itemId);
    if (!existing) return;

    // If a new image was provided, delete the old one
    if (imageId && imageId !== existing.imageId) {
      await ctx.storage.delete(existing.imageId);
      updates.imageId = imageId;
    }

    return await ctx.db.patch(itemId, updates);
  },
});

export const addOutfit = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    occasion: v.string(),
    season: v.string(),
    weather: v.string(),
    styleVibe: v.optional(v.string()),
    itemIds: v.optional(v.array(v.id("clothes"))),
    isFavorite: v.boolean(),
    baseItem: v.optional(v.object({
      type: v.string(),
      color: v.string(),
      colorName: v.string(),
    })),
    suggestion: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outfits", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getOutfitHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const history = await ctx.db
      .query("outfits")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    // Resolve item IDs to full objects with image URLs for the frontend
    return Promise.all(
      history.map(async (outfit) => {
        if (outfit.itemIds) {
          const resolvedItems = await Promise.all(
            outfit.itemIds.map(async (id) => {
              const item = await ctx.db.get(id);
              if (!item) return null;
              return {
                ...item,
                imageUrl: await ctx.storage.getUrl(item.imageId),
              };
            })
          );
          return { ...outfit, items: resolvedItems.filter(i => i !== null) };
        }
        return outfit;
      })
    );
  },
});

export const toggleFavoriteOutfit = mutation({
  args: { outfitId: v.id("outfits") },
  handler: async (ctx, args) => {
    const outfit = await ctx.db.get(args.outfitId);
    if (!outfit) return;
    return await ctx.db.patch(args.outfitId, { isFavorite: !outfit.isFavorite });
  },
});

export const deleteOutfit = mutation({
  args: { outfitId: v.id("outfits") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.outfitId);
  },
});

export const clearHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("outfits")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    for (const outfit of history) {
      await ctx.db.delete(outfit._id);
    }
  },
});
