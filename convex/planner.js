import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addPlannedOutfit = mutation({
  args: {
    userId: v.string(),
    outfitId: v.id("outfits"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("plannedOutfits", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getUserPlannedOutfits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    const plans = await ctx.db
      .query("plannedOutfits")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // Resolve each outfitId to its full outfit object with item image URLs
    return Promise.all(
      plans.map(async (plan) => {
        const outfit = await ctx.db.get(plan.outfitId);
        if (!outfit) return { ...plan, outfit: null };

        // Resolve item images if itemIds exist
        let resolvedItems = [];
        if (outfit.itemIds) {
          resolvedItems = await Promise.all(
            outfit.itemIds.map(async (id) => {
              const item = await ctx.db.get(id);
              if (!item) return null;
              return {
                ...item,
                imageUrl: await ctx.storage.getUrl(item.imageId),
              };
            })
          );
          resolvedItems = resolvedItems.filter((i) => i !== null);
        }

        return {
          ...plan,
          outfit: { ...outfit, items: resolvedItems },
        };
      })
    );
  },
});

export const deletePlannedOutfit = mutation({
  args: { planId: v.id("plannedOutfits") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.planId);
  },
});
