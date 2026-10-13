import { SupportedProviderId } from '@api-healthlab/core';
import { ProviderManifest } from '@api-healthlab/provider-kit';
import { openaiManifest } from './openai.js';
import { geminiManifest } from './gemini.js';
import { githubManifest } from './github.js';
import { anthropicManifest } from './anthropic.js';
import { mistralManifest } from './mistral.js';
import { groqManifest } from './groq.js';
import { openrouterManifest } from './openrouter.js';
import { xaiManifest } from './xai.js';
import { deepseekManifest } from './deepseek.js';
import { cohereManifest } from './cohere.js';
import { perplexityManifest } from './perplexity.js';
import { togetherManifest } from './together.js';
import { fireworksManifest } from './fireworks.js';
import { cerebrasManifest } from './cerebras.js';
import { huggingfaceManifest } from './huggingface.js';
import { stabilityManifest } from './stability.js';
import { elevenlabsManifest } from './elevenlabs.js';
import { gitlabManifest } from './gitlab.js';
import { slackManifest } from './slack.js';
import { supabaseManifest } from './supabase.js';
import { pineconeManifest } from './pinecone.js';
import { stripeManifest } from './stripe.js';
import { clerkManifest } from './clerk.js';

export * from './openai.js';
export * from './gemini.js';
export * from './github.js';
export * from './anthropic.js';
export * from './mistral.js';
export * from './groq.js';
export * from './openrouter.js';
export * from './xai.js';
export * from './deepseek.js';
export * from './cohere.js';
export * from './perplexity.js';
export * from './together.js';
export * from './fireworks.js';
export * from './cerebras.js';
export * from './huggingface.js';
export * from './stability.js';
export * from './elevenlabs.js';
export * from './gitlab.js';
export * from './slack.js';
export * from './supabase.js';
export * from './pinecone.js';
export * from './stripe.js';
export * from './clerk.js';

export const ALL_MANIFESTS: Record<SupportedProviderId, ProviderManifest> = {
  openai: openaiManifest,
  gemini: geminiManifest,
  github: githubManifest,
  anthropic: anthropicManifest,
  mistral: mistralManifest,
  groq: groqManifest,
  openrouter: openrouterManifest,
  xai: xaiManifest,
  deepseek: deepseekManifest,
  cohere: cohereManifest,
  perplexity: perplexityManifest,
  together: togetherManifest,
  fireworks: fireworksManifest,
  cerebras: cerebrasManifest,
  huggingface: huggingfaceManifest,
  stability: stabilityManifest,
  elevenlabs: elevenlabsManifest,
  gitlab: gitlabManifest,
  slack: slackManifest,
  supabase: supabaseManifest,
  pinecone: pineconeManifest,
  stripe: stripeManifest,
  clerk: clerkManifest,
};
