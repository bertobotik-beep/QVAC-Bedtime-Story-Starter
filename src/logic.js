// QVAC Bedtime Story Starter — core logic.
// completion() writes ONLY a short opening paragraph (3-5 sentences) for a
// bedtime story using the given character + setting — a "starter", not a
// complete story with an ending.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  if (text.length > 700) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i do not have", "please provide"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "named", "name", "who", "that", "this", "it", "at", "as", "is", "are", "was",
  "were", "little", "young", "old", "big", "small",
]);

function keywords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function mentionsBoth(text, character, setting) {
  const lower = text.toLowerCase();
  const charWords = keywords(character);
  const settingWords = keywords(setting);
  const charOk = charWords.length === 0 || charWords.some((w) => lower.includes(w));
  const settingOk = settingWords.length === 0 || settingWords.some((w) => lower.includes(w));
  return charOk && settingOk;
}

const FALLBACK = (character, setting) =>
  `Once upon a time, in ${setting}, there lived a gentle soul named ${character}. Every evening, ` +
  `${character} would watch the light fade and wonder what quiet magic the night might hold. Tonight ` +
  `felt different somehow, as if ${setting} itself were holding its breath, waiting for something ` +
  `wonderful to begin.`;

export async function generate(modelId, character, setting) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "Write ONLY the opening paragraph (3-5 sentences) of a gentle, cozy bedtime story, using the " +
          "given character and setting. This is just the STARTER/opening of the story — do not resolve " +
          "any plot, do not write an ending, just set the scene and end on a sense of gentle anticipation. " +
          "Reply with ONLY the paragraph text, no title, no preamble, no explanation.",
      },
      { role: "user", content: "Character: a shy young fox named Wisp\nSetting: a moonlit meadow full of fireflies" },
      {
        role: "assistant",
        content:
          "In a moonlit meadow where fireflies drifted like slow-blinking stars, a shy young fox named " +
          "Wisp peeked out from behind a tall stalk of grass. The meadow hummed with the soft chirp of " +
          "crickets, and every blade of grass glittered with dew. Wisp had never wandered this far from " +
          "home before, but tonight the fireflies seemed to be leading somewhere, blinking a slow, patient " +
          "path deeper into the silver light.",
      },
      { role: "user", content: `Character: ${character}\nSetting: ${setting}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.85, maxTokens: 220 },
  });

  let text = "";
  for await (const token of run.tokenStream) text += token;
  text = text
    .trim()
    .replace(/^here'?s[^:\n]*:\s*/i, "")
    .trim()
    .replace(/^["'“]|["'”]$/g, "")
    .trim();

  // Fall back to a deterministic starter built from the user's exact inputs
  // whenever the model refused, rambled past a sane length, or drifted away
  // from the requested character/setting — this guarantees the story
  // starter always stays on-topic even if the on-device model misbehaves.
  const story = looksUnusable(text) || !mentionsBoth(text, character, setting)
    ? FALLBACK(character, setting)
    : text;
  return { story };
}
