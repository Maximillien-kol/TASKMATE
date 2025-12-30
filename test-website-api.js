async function testWebsiteAPI() {
    console.log('🧪 Testing website API endpoint...\n');

    try {
        const response = await fetch('http://localhost:3000/api/parse-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: 'buy groceries tomorrow at 3pm'
            })
        });

        console.log('📡 Status:', response.status, response.statusText);

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ Website API is working!\n');
            console.log('📦 Parsed Task:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ API returned error:', data);
        }

    } catch (error) {
        console.error('❌ Failed to connect:', error.message);
    }
}

testWebsiteAPI();
