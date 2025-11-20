#!/usr/bin/env node

/**
 * Test script for Perplexity AI API
 * Tests the API key and connection to ensure proper authentication
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

async function testPerplexityAPI() {
  console.log('🧪 Testing Perplexity AI API...\n');
  console.log('API URL:', PERPLEXITY_API_URL);
  console.log('API Key:', PERPLEXITY_API_KEY.substring(0, 20) + '...\n');

  // Test 1: Simple completion request
  console.log('📝 Test 1: Simple completion request...');
  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: 'Say "Hello! API is working correctly." if you can read this.',
          },
        ],
        max_tokens: 50,
        temperature: 0.2,
        stream: false,
      }),
    });

    const responseText = await response.text();
    
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', responseText.substring(0, 500));

    if (!response.ok) {
      console.error('❌ Test 1 FAILED');
      console.error('Error details:', responseText);
      return false;
    }

    const data = JSON.parse(responseText);
    
    if (data.choices && data.choices.length > 0) {
      console.log('✅ Test 1 PASSED');
      console.log('AI Response:', data.choices[0].message.content);
      console.log('Tokens used:', data.usage);
    } else {
      console.error('❌ Test 1 FAILED: No response from AI');
      return false;
    }

  } catch (error) {
    console.error('❌ Test 1 FAILED with exception:', error.message);
    return false;
  }

  console.log('\n');

  // Test 2: Summarization request
  console.log('📝 Test 2: Summarization request...');
  try {
    const testText = 'This is a test document about artificial intelligence and machine learning. AI is transforming various industries by enabling computers to learn from data and make intelligent decisions. Machine learning is a subset of AI that focuses on algorithms that can learn patterns from data.';
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that creates concise summaries.',
          },
          {
            role: 'user',
            content: `Please provide a brief summary of the following text:\n\n${testText}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Test 2 FAILED');
      console.error('Error details:', errorText);
      return false;
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      console.log('✅ Test 2 PASSED');
      console.log('Summary:', data.choices[0].message.content);
    } else {
      console.error('❌ Test 2 FAILED: No response from AI');
      return false;
    }

  } catch (error) {
    console.error('❌ Test 2 FAILED with exception:', error.message);
    return false;
  }

  console.log('\n');
  console.log('🎉 All tests passed! Perplexity AI API is working correctly.');
  return true;
}

// Run the tests
testPerplexityAPI()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
