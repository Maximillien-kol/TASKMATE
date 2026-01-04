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

Rules for time extraction (dueTime):
- Extract specific times mentioned (e.g., "at 5pm", "at 14:00", "in the morning")
- Convert 12-hour format to 24-hour format (HH:mm) strings
- Default to likely business hours if ambiguous (e.g. "at 9" -> "09:00", "at 5" -> "17:00" for meetings)
- Example: "Meeting at 3pm" -> "15:00"
- Example: "Lunch at 12:30" -> "12:30"
- Example: "Morning standup" -> "09:00" (or null if vague)
- If no time is specified, return null

Return a JSON object with this structure:
{
  "title": "Clear, Action-Oriented Title",
  "description": "optional detailed description",
  "priority": "low" | "medium" | "high",
  "category": "category name",
  "dueDate": "YYYY-MM-DD or null",
  "dueTime": "HH:mm or null",
  "subTasks": [{"title": "subtask 1"}, {"title": "subtask 2"}]
}`;

    const data = await callGroqAPI(prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return NextResponse.json({ error: 'Failed to parse task' }, { status: 500 });
  }
}
