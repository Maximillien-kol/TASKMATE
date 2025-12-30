import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(prompt: string): Promise<any> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that returns only valid JSON.' },
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
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(content);
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    const prompt = `Break down this task into 3-5 actionable sub-steps: "${title}" - ${description || ''}

Return a JSON object with this structure:
{
  "steps": ["step 1", "step 2", "step 3"]
}`;

    const data = await callGroqAPI(prompt);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Breakdown Error:", error);
    return NextResponse.json({ error: 'Failed to breakdown task' }, { status: 500 });
  }
}
