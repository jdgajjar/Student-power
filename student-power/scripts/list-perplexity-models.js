#!/usr/bin/env node

/**
 * List available Perplexity AI models
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

async function listModels() {
  console.log('🔍 Fetching available Perplexity AI models...\n');
  
  try {
    const response = await fetch('https://api.perplexity.ai/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
    });

    console.log('Status:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('Response:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('\n📋 Available models:');
      if (data.data) {
        data.data.forEach((model) => {
          console.log(`  - ${model.id || model.name || JSON.stringify(model)}`);
        });
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
