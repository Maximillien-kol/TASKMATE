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
    const { todos } = await request.json();

    if (!todos || todos.length === 0) {
      return NextResponse.json({ summary: "Your list is empty.", advice: "Add a task to get started!" });
    }

    const taskList = todos.map((t: any) => `- [${t.completed ? 'x' : ' '}] ${t.title} (${t.priority} priority, due: ${t.dueDate || 'N/A'})`).join('\n');

    const prompt = `Analyze this todo list and provide a motivational summary and 1 piece of actionable advice for productivity. Consider due dates if present:
${taskList}

Return a JSON object with this structure:
{
  "summary": "motivational summary",
  "advice": "actionable advice"
}`;

    const data = await callGroqAPI(prompt);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ summary: "Keep pushing forward!", advice: "Focus on your highest priority task first." });
  }
}
