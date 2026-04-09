import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// ── Model Configuration ──
const MODELS = {
  structured: "deepseek/deepseek-r1:free",
  creative: "qwen/qwen-2.5:free",
  fallback: "openrouter/free"
};

/**
 * Internal helper: Safely calls OpenRouter with the given model,
 * attempts 1 retry, and uses fallback model if it completely fails.
 */
async function safeAICall(modelId, messages, temperature = 0.7) {
  const tryCall = async (modelToTry) => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelToTry,
            messages,
            temperature,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Status HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error(`Call failed for model ${modelToTry}:`, err.message);
      return null;
    }
  };

  // Try primary
  let result = await tryCall(modelId);
  
  // Retry once if failed
  if (!result) {
    console.log(`Retrying primary model ${modelId}...`);
    result = await tryCall(modelId);
  }

  // Use fallback if still failed
  if (!result) {
    console.log(`Primary failed, using fallback model ${MODELS.fallback}...`);
    result = await tryCall(MODELS.fallback);
  }

  return result;
}

// ── Public Actions ──

/**
 * Runs a structured AI call (DeepSeek).
 * Returns parsed JSON or null on failure.
 */
export const runStructuredAI = action({
  args: { prompt: v.string() },
  handler: async (_ctx, args) => {
    const content = await safeAICall(MODELS.structured, [
      {
        role: "system",
        content:
          "You are a precise data extraction assistant. Always respond ONLY with valid JSON. No markdown, no explanation, just the JSON object.",
      },
      { role: "user", content: args.prompt },
    ], 0.2);

    if (!content) return {};

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return {};
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("Failed to parse structured AI response:", err, content);
      return {};
    }
  },
});

/**
 * Runs a creative AI call (Qwen).
 * Returns the text response or a fallback message.
 */
export const runCreativeAI = action({
  args: { prompt: v.string() },
  handler: async (_ctx, args) => {
    const content = await safeAICall(MODELS.creative, [
      {
        role: "system",
        content:
          "You are a stylish fashion advisor. Be descriptive, engaging, and helpful. Format your responses clearly with numbered points when listing items.",
      },
      { role: "user", content: args.prompt },
    ], 0.8);

    return content || "Here is a basic suggestion: A comfortable casual outfit with matching accessories.";
  },
});

const CATEGORY_MAP = {
  'shirt': 'Tops', 'blouse': 'Tops', 't-shirt': 'Tops', 'tshirt': 'Tops',
  'top': 'Tops', 'polo': 'Tops', 'tank': 'Tops', 'sweater': 'Tops',
  'hoodie': 'Tops', 'sweatshirt': 'Tops', 'cardigan': 'Tops', 'vest': 'Tops',
  'crop top': 'Tops', 'henley': 'Tops', 'tunic': 'Tops',
  'pants': 'Bottoms', 'jeans': 'Bottoms', 'trousers': 'Bottoms',
  'shorts': 'Bottoms', 'skirt': 'Bottoms', 'leggings': 'Bottoms',
  'joggers': 'Bottoms', 'chinos': 'Bottoms', 'culottes': 'Bottoms',
  'shoes': 'Footwear', 'sneakers': 'Footwear', 'boots': 'Footwear',
  'sandals': 'Footwear', 'heels': 'Footwear', 'loafers': 'Footwear',
  'flats': 'Footwear', 'slippers': 'Footwear', 'mules': 'Footwear',
  'jacket': 'Outerwear', 'coat': 'Outerwear', 'blazer': 'Outerwear',
  'parka': 'Outerwear', 'windbreaker': 'Outerwear', 'denim jacket': 'Outerwear',
  'hat': 'Accessories', 'cap': 'Accessories', 'scarf': 'Accessories',
  'belt': 'Accessories', 'watch': 'Accessories', 'sunglasses': 'Accessories',
  'bag': 'Accessories', 'necklace': 'Accessories', 'bracelet': 'Accessories',
  'earrings': 'Accessories', 'gloves': 'Accessories', 'tie': 'Accessories',
};

function normalizeCategory(raw) {
  if (!raw) return 'Tops';
  const lower = raw.toLowerCase().trim();
  return CATEGORY_MAP[lower] || 'Tops';
}

/**
 * Analyzes a clothing image using DeepSeek vision via OpenRouter.
 * Securely uses the backend OPENROUTER_API_KEY.
 */
export const analyzeClothingImage = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // 1. Get the accessible signed URL for the image
    const imageUrl = await ctx.runQuery(internal.wardrobe.getUrlForAction, {
      storageId: args.storageId,
    });

    if (!imageUrl) return null;

    const prompt = `Analyze this clothing item image and return:
- category (one word, e.g. shirt, pants, jacket, shoes, hat)
- color (one word, the dominant color)
- tags (array of 3-5 style descriptors like casual, formal, sporty, streetwear, summer, minimal, vintage)
- name (a short 2-4 word descriptive name for the item, e.g. "Blue Denim Jacket")

Respond ONLY in valid JSON format like:
{"category": "shirt", "color": "blue", "tags": ["casual", "summer", "minimal"], "name": "Blue Cotton Shirt"}`;

    const content = await safeAICall(MODELS.structured, [
      {
        role: "system",
        content:
          "You are a precise fashion item classifier. Respond ONLY with valid JSON. No markdown, no explanation.",
      },
      {
        role: "user",
        // Pass the image URL to vision model
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ], 0.2);

    if (!content) return null;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        category: normalizeCategory(parsed.category),
        color: parsed.color?.toLowerCase()?.trim() || '',
        tags: Array.isArray(parsed.tags)
          ? parsed.tags.map(t => t.toLowerCase().trim()).slice(0, 5)
          : [],
        name: parsed.name?.trim() || '',
      };
    } catch (err) {
      console.error("Failed to parse clothing analysis:", err);
      return null;
    }
  },
});
