import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(prompt: string, systemPrompt: string = "You are a helpful assistant that returns only valid JSON."): Promise<any> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || '{}';

  // Remove markdown code blocks if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(content);
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    const now = new Date().toISOString();
    const prompt = `Parse this natural language task into a structured todo item. Make the title clear, concise, and properly formatted.

Current reference time: ${now}
Input: "${input}"

Rules for title:
- Make it action-oriented and clear
- Use proper capitalization (Title Case for main words)
- Remove unnecessary words
- Keep it under 60 characters
- Example: "call dentist tomorrow" → "Call Dentist Appointment"
- Example: "finish the project report by friday" → "Complete Project Report"
- Example: "buy groceries milk eggs bread" → "Buy Groceries"

Return a JSON object with this structure:
{
  "title": "Clear, Action-Oriented Title",
  "description": "optional detailed description",
  "priority": "low" | "medium" | "high",
  "category": "category name",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:mm or null (24-hour format)",
  "subTasks": [{"title": "subtask 1"}, {"title": "subtask 2"}]
}

Rules for Time Parsing:
- Extract specific times if mentioned (e.g., "at 3pm", "at 14:00", "at 9", "at 5am")
- Convert ALL times to 24-hour format (HH:mm)
- Handle "am" and "pm" case-insensitively
- If "am/pm" is missing but context implies business hours (9-5), assume user intent or default to 24h if > 12.
- Examples:
  - "at 2pm" -> "14:00"
  - "at 2am" -> "02:00"
  - "at 14" -> "14:00"
  - "at 9" -> "09:00" (assume morning if ambiguous)
  - "at 13pm" -> "13:00" (handle common user typo of 13pm meaning 1pm/13:00)
  - "at 12am" -> "00:00"
  - "at 12pm" -> "12:00"`;

    const data = await callGroqAPI(prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ error: 'Failed to parse task' }, { status: 500 });
  }
}
