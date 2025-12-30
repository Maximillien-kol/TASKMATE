const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroqAPI() {
  console.log('🧪 Testing Groq API...\n');

  try {
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
          { role: 'user', content: 'Parse this task: "call dentist tomorrow at 2pm". Return JSON with title, priority, dueDate, dueTime' }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    console.log('📡 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Groq API is working!\n');
    console.log('📦 Response:', JSON.stringify(data, null, 2));
    console.log('\n💬 AI Message:', data.choices[0]?.message?.content);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGroqAPI();
