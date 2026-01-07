import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Read .env locally (do NOT log the key)
const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/^VITE_GEMINI_API_KEY=(.*)$/m);
const key = m ? m[1].trim() : undefined;

// Log only presence
console.info('key-present:', Boolean(key));

if (!key) {
  console.error('NO_KEY');
  process.exit(2);
}

try {
  const client = new GoogleGenerativeAI(key);
  const models = await client.listModels();
  // Log only model ids/names
  const names = (models?.models || []).map(m => m.name || m.id || m.model || JSON.stringify(m));
  console.info('models:', names);
} catch (err) {
  console.error('ERROR_LIST_MODELS:', err?.message || err);
  process.exit(1);
}
