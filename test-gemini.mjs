import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Read .env locally (do NOT log the key)
const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/^VITE_GEMINI_API_KEY=(.*)$/m);
const key = m ? m[1].trim() : undefined;

// Log only presence
console.info(Boolean(key));

if (!key) {
  console.error('NO_KEY');
  process.exit(2);
}

try {
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent('Say hello from Gemini');
  console.info('Gemini response object:', result?.response);
  console.info('Gemini response text:', result?.response?.text?.() ?? 'NO_TEXT');
} catch (err) {
  console.error('ERROR_CALLING_GEMINI:', err?.message || err);
  process.exit(1);
}
