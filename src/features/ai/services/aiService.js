import { useAction } from "convex/react";
import { api } from '@convex/_generated/api';

const aiCache = new Map();
let lastCallTime = 0;
let isCallActive = false;

// Helpers for rate limiting and debounce
const RATE_LIMIT_MS = 2000;

function canCallAI() {
  const now = Date.now();
  if (isCallActive || now - lastCallTime < RATE_LIMIT_MS) {
    return false;
  }
  return true;
}

function updateCallTime() {
  lastCallTime = Date.now();
  isCallActive = false;
}

/**
 * AI Service Layer
 *
 * Centralized frontend interface to the dual-model AI system utilizing free-tier AI.
 * Includes rate limiting, caching, and debouncing UX protections.
 */
export function useAIService() {
  const structuredAI = useAction(api.ai.runStructuredAI);
  const creativeAI = useAction(api.ai.runCreativeAI);
  const analyzeImage = useAction(api.ai.analyzeClothingImage);

  return {
    generateStructuredOutput: async (prompt) => {
      if (aiCache.has(prompt)) return aiCache.get(prompt);
      if (!canCallAI()) return {}; // Graceful fallback
      
      isCallActive = true;
      try {
        const result = await structuredAI({ prompt });
        if (result && Object.keys(result).length > 0) aiCache.set(prompt, result);
        return result || {};
      } catch (err) {
        console.error("Structured AI Error:", err);
        return {};
      } finally {
        updateCallTime();
      }
    },

    generateCreativeOutput: async (prompt, bypassCache = false) => {
      if (!bypassCache && aiCache.has(prompt)) return aiCache.get(prompt);
      if (!canCallAI()) throw new Error("Please wait before generating again.");
      
      isCallActive = true;
      try {
        const result = await creativeAI({ prompt });
        
        // Strict Validation: If it's the backend fallback or not properly formatted
        if (!result || result.includes("Here is a basic suggestion") || !result.match(/\d+\./)) {
          throw new Error("AI service returned an invalid format. Please try again.");
        }

        aiCache.set(prompt, result);
        return result;
      } catch (err) {
        console.error("Creative AI Error:", err);
        throw new Error(err.message || "AI service is busy. Please try again.");
      } finally {
        updateCallTime();
      }
    },

    analyzeClothingImage: async (storageId) => {
      if (!canCallAI()) return null; // Modal will handle null as failure gracefully and auto defaults.
      
      isCallActive = true;
      try {
        const result = await analyzeImage({ storageId });
        return result || null;
      } catch (err) {
        console.error("Vision AI Error:", err);
        return null;
      } finally {
        updateCallTime();
      }
    },
  };
}
