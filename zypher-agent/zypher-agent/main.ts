/// <reference lib="deno.ns" />
import "jsr:@std/dotenv/load";

import {
  OpenAIModelProvider,
  createZypherContext,
  ZypherAgent,
} from "jsr:@corespeed/zypher@^0.5.1";
import { eachValueFrom } from "npm:rxjs-for-await@^1.0.0";

// Configure Zypher home directory (same as before)
const zypherHome = Deno.env.get("ZYPHER_HOME")
  ?? Deno.env.get("HOME")
  ?? Deno.env.get("USERPROFILE")
  ?? Deno.cwd();

Deno.env.set("HOME", zypherHome);
console.log(`Zypher home set to: ${zypherHome}`);

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Query Groq's models endpoint and choose a usable model id.
 * Returns a model id string.
 */


async function pickGroqModel(baseUrl: string, apiKey: string): Promise<string> {
  const envOverride = Deno.env.get("GROQ_MODEL");
  if (envOverride) {
    console.log(`Using GROQ_MODEL override from env: ${envOverride}`);
    return envOverride;
  }

  console.log("Fetching available models from Groq to auto-select a valid model...");
  try {
    const res = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      // Provide actionable message
      const text = await res.text().catch(() => "");
      throw new Error(`Failed to fetch models: (${res.status}) ${res.statusText} ${text}`);
    }

    const j = await res.json().catch(() => null);
    if (!j) throw new Error("Models endpoint returned invalid JSON.");

    // Attempt to find model list in common shapes:
    // - { data: [ { id, decommissioned, recommended } ] }
    // - { models: [ { id, decommissioned } ] }
    // - [ { id, ... } ]
    let candidates: Array<any> = [];
    if (Array.isArray(j)) {
      candidates = j;
    } else if (Array.isArray(j.data)) {
      candidates = j.data;
    } else if (Array.isArray(j.models)) {
      candidates = j.models;
    } else if (Array.isArray(j.result)) {
      candidates = j.result;
    }

    // Normalize items to objects with id and flags
    const normalized = candidates
      .map((m: any) => ({
        id: m?.id || m?.model_id || m?.name || String(m),
        decommissioned: Boolean(m?.decommissioned),
        recommended: Boolean(m?.recommended),
        // heuristics: include common token fields if present
        tags: m?.tags ?? m?.capabilities ?? [],
      }))
      .filter((m: any) => m.id && !m.decommissioned);

    if (normalized.length === 0) {
      console.warn("No non-decommissioned models found in API response — falling back to safe defaults.");
    } else {
      // Prefer recommended ones, then heuristic picks (llama/mixtral/gemma)
      const recommended = normalized.find((m: any) => m.recommended);
      if (recommended) {
        console.log(`Selected recommended model: ${recommended.id}`);
        return recommended.id;
      }

      // Heuristic order for Groq-hosted models
      const preferredOrder = [
        /llama-3/i,
        /mixtral/i,
        /gemma/i,
        /llama/i,
        /mix/i,
      ];

      for (const re of preferredOrder) {
        const found = normalized.find((m: any) => re.test(m.id));
        if (found) {
          console.log(`Selected model by heuristic (${re}): ${found.id}`);
          return found.id;
        }
      }

      // Otherwise pick the first available model id
      console.log(`No heuristic match; selecting first available model: ${normalized[0].id}`);
      return normalized[0].id;
    }
  } catch (err) {
    console.warn("Error while fetching models:", err);
    // fall through to fallback list
  }

  // Fallback hardcoded list (safe choices likely to exist)
  const fallbackCandidates = [
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile", // may be decommissioned in some accounts
    "mixtral-8x7b",
    "gemma2-9b-it",
    "llama3-70b",
    "llama-3.1-8b",
  ];

  console.log("Trying fallback candidates: ", fallbackCandidates.join(", "));
  // Return the first fallback — user can override via GROQ_MODEL env var.
  return fallbackCandidates[0];
}

async function main() {
  const zypherContext = await createZypherContext(Deno.cwd());

  // get Groq key
  const groqApiKey = getRequiredEnv("GROQ_API_KEY");

  // baseUrl for Groq's OpenAI-compat endpoint
  const groqBase = "https://api.groq.com/openai/v1";

  // auto-select model (or use GROQ_MODEL env override)
  const selectedModel = await pickGroqModel(groqBase, groqApiKey);
  console.log("Using model:", selectedModel);

  // Build OpenAIModelProvider but point to Groq base URL and Groq key
  const openaiProvider = new OpenAIModelProvider({
    apiKey: groqApiKey,
    baseUrl: groqBase,
    openaiClientOptions: {
      baseUrl: groqBase,
    },
    // optionally set other provider configs like max_tokens
    max_tokens: 200,
  });

  const agent = new ZypherAgent(zypherContext, openaiProvider);

  console.log("Running agent task (Groq via OpenAI-compatible endpoint)...");
  const prompt = "Find latest AI news in 5 concise bullet points";

  // run; this will stream events
  const event$ = agent.runTask(prompt, selectedModel);

  try {
    for await (const event of eachValueFrom(event$)) {
      console.log(event);
    }
  } catch (err) {
    console.error("Agent run error:", err);
    // Helpful suggestions when things go wrong:
    console.error("\nTroubleshooting suggestions:");
    console.error("- If you see auth errors, ensure GROQ_API_KEY is correct and not expired.");
    console.error("- If you see quota errors, check Groq console usage/billing.");
    console.error("- To force a model, set GROQ_MODEL in .env to an available model id.");
    Deno.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  Deno.exit(1);
});







/*
/// <reference lib="deno.ns" />
import "jsr:@std/dotenv/load";

import {
  OpenAIModelProvider,
  createZypherContext,
  ZypherAgent,
} from "jsr:@corespeed/zypher@^0.5.1";
import { eachValueFrom } from "npm:rxjs-for-await@^1.0.0";

// Pick model (same as before)
async function pickGroqModel(baseUrl: string, apiKey: string): Promise<string> {
  return "llama-3.1-8b-instant"; // simplified stable fallback
}

// EXPORTED → Used by server.ts
export async function runAgent(prompt: string): Promise<string> {
  const zypherContext = await createZypherContext(Deno.cwd());
  const groqApiKey = Deno.env.get("GROQ_API_KEY");

  if (!groqApiKey) throw new Error("Missing GROQ_API_KEY");

  const groqBase = "https://api.groq.com/openai/v1";
  const selectedModel = await pickGroqModel(groqBase, groqApiKey);

  const openaiProvider = new OpenAIModelProvider({
    apiKey: groqApiKey,
    baseUrl: groqBase,
    max_tokens: 200,
  });

  const agent = new ZypherAgent(zypherContext, openaiProvider);
  const event$ = agent.runTask(prompt, selectedModel);

  let finalText = "";

  for await (const event of eachValueFrom(event$)) {
    if (event?.message?.content) {
      for (const chunk of event.message.content) {
        if (typeof chunk.text === "string") {
          finalText += chunk.text;
        }
      }
    }
  }

  return finalText;
}

// Optional manual run
if (import.meta.main) {
  const out = await runAgent("Find latest AI news in 5 concise bullet points");
  console.log(out);
}
*/