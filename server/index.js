import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GENAI_API_KEY;
const MODEL = process.env.GENAI_MODEL || 'gemini-1.5-flash'; // Byrja með modelið gemini-1.5-flash (free tier)
const PORT = process.env.PORT || 4000;

if (!API_KEY) {
  console.warn('gemini api lykill ekki rett, faum mock data');
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function askForMacros(text) {
  const prompt = `
You are a nutrition assistant. The user gives a single line description of what they just ate.
Return a JSON object with the TOTAL estimated macros for the whole entry.

Schema:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number
}

Only output valid JSON. User entry:
"""${text}"""
`;

  if (!API_KEY) {
    return {
      calories: 250,
      protein_g: 8,
      carbs_g: 30,
      fat_g: 12,
    };
  }

  try {
    //er að profa 2.5flash model nuna
    const model = genAI.getGenerativeModel({ model: MODEL });
    //senda a gemini og bíða
    const result = await model.generateContent(prompt);
    const response = await result.response;
    //extract
    const textOut = response.text();

    //regular expression til að finna fyrsta json string
    const match = textOut.match(/\{[\s\S]*\}/);
    if (!match) {
      return { error: 'no-json', raw: textOut };
    }

    //yfir i javascript obj
    try {
      return JSON.parse(match[0]);
    } catch (parseError) {
      return { error: 'parse error', raw: match[0] };
    }
  } catch (error) {
    console.error('API Error:', error.message);
    throw new Error(`Failed to fetch: ${error.message}`);
  }
}

app.post('/api/macros', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'missing text' });

  try {
    const macros = await askForMacros(text);
    res.json(macros);
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'server_error', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server á http://localhost:${PORT}`);
});