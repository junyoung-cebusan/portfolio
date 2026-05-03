import { createClient } from "@supabase/supabase-js";

import { getTextLanguage, type PromptLanguage } from "@/lib/analysis/prompts";

type CVRow = {
  content: string | null;
};

const cvContentCache = new Map<PromptLanguage, string>();

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or publishable key.");
  }

  return { url, key };
}

function createSupabaseReadClient() {
  const { url, key } = getSupabaseConfig();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function getCVContent(language: PromptLanguage) {
  const cached = cvContentCache.get(language);

  if (cached) {
    return cached;
  }

  const supabase = createSupabaseReadClient();
  const { data, error } = await supabase
    .from("cv")
    .select("content")
    .eq("language", language)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CVRow>();

  if (error) {
    throw new Error(`Failed to read ${language} CV content: ${error.message}`);
  }

  const content = data?.content?.trim();

  if (!content) {
    throw new Error(`Missing ${language} CV content in Supabase.`);
  }

  cvContentCache.set(language, content);
  return content;
}

export async function getCandidateEvidenceForText(text: string) {
  const language = getTextLanguage(text);
  return getCandidateEvidenceForLanguage(language);
}

export async function getCandidateEvidenceForLanguage(language: PromptLanguage) {
  const candidateEvidence = await getCVContent(language);

  return [
    "Use this CV evidence only. The candidate is not claiming anything outside this block.",
    `Evidence language: ${language === "ja" ? "Japanese" : "English"}.`,
    "",
    candidateEvidence,
  ].join("\n");
}
