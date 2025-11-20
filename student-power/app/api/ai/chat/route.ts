import { NextRequest, NextResponse } from 'next/server';

/**
 * Perplexity AI Chat API Route
 * Handles AI-powered PDF summarization, question answering, and chat
 * 
 * Fixed Issues:
 * - Proper API key validation with detailed error messages
 * - Support for both PERPLEXITY_API_KEY and NEXT_PUBLIC_PERPLEXITY_API_KEY
 * - Enhanced error handling with user-friendly messages
 * - Better request validation
 */

// Get API key from environment variables (try both naming conventions)
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar';

export async function POST(request: NextRequest) {
  try {
    // Validate API key first before processing request
    if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY.trim() === '') {
      console.error('❌ Perplexity API key is not configured');
      return NextResponse.json(
        { 
          error: 'API configuration error. Perplexity API key is missing.',
          details: 'Please set PERPLEXITY_API_KEY or NEXT_PUBLIC_PERPLEXITY_API_KEY environment variable.'
        },
        { status: 500 }
      );
    }

    console.log('✅ API key configured, processing request...');
    
    const body = await request.json();
    const { action, question, pdfText, message, conversationHistory } = body;

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No PDF content provided' },
        { status: 400 }
      );
    }

    // Truncate text if too long
    const truncatedText = pdfText.length > 10000 
      ? pdfText.substring(0, 10000) + '...' 
      : pdfText;

    let messages: any[] = [];

    // Build messages based on action
    if (action === 'summarize') {
      // Extract topic from first part of text
      const topicMatch = truncatedText.substring(0, 500).match(/(?:Chapter|Unit|Section|Topic|Subject)?\s*:?\s*([A-Z][^\n]{10,100})/);
      const topic = topicMatch ? topicMatch[1].trim() : 'Document Content';
      
      messages = [
        {
          role: 'system',
          content: 'You are an expert academic assistant specialized in creating well-structured, hierarchical summaries of educational documents. Your summaries must be clear, academically precise, and easy to understand. Use markdown formatting with proper heading levels (# for main title, ## for major sections, ### for subsections). Focus on extracting key concepts, definitions, explanations, and relationships between ideas.',
        },
        {
          role: 'user',
          content: `Please create a comprehensive academic summary of the following document content. Format your response as follows:

# Summary of ${topic}

Then organize the content into 2-3 major sections using ## headings, with subsections using ### headings where appropriate. Each section should:
- Provide clear, academically precise explanations
- Include key concepts and definitions
- Explain relationships between ideas
- Use bullet points for clarity where helpful
- Maintain an easy-to-read but academic tone

Document Content:
${truncatedText}`,
        },
      ];
    } else if (action === 'generate_questions') {
      // Extract topic from first part of text
      const topicMatch = truncatedText.substring(0, 500).match(/(?:Chapter|Unit|Section|Topic|Subject)?\s*:?\s*([A-Z][^\n]{10,100})/);
      const topic = topicMatch ? topicMatch[1].trim() : 'this topic';
      
      messages = [
        {
          role: 'system',
          content: 'You are an expert academic assistant specialized in generating important conceptual and applied questions from educational documents. Your questions should test understanding, application, and critical thinking. Generate questions that cover the main concepts, theories, definitions, applications, and relationships presented in the document.',
        },
        {
          role: 'user',
          content: `Based on the provided document content, generate 10-12 important questions related to "${topic}". 

Format your response EXACTLY as follows:

Based on the provided document content, important questions (imp questions) related to '${topic}' could include:

1. [First question - conceptual or definition-based]
2. [Second question - application-based]
3. [Third question - analytical]
... continue through 10-12 questions

Make questions diverse: include conceptual questions, application questions, comparison questions, and analytical questions. Ensure all questions are directly relevant to the document content.

Document Content:
${truncatedText}`,
        },
      ];
    } else if (action === 'answer') {
      if (!question || question.trim().length === 0) {
        return NextResponse.json(
          { error: 'No question provided' },
          { status: 400 }
        );
      }

      messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that answers questions based on the provided document content. Provide accurate, detailed answers based primarily on the information in the document. Use clear academic language and structure your answers well. If the answer requires information beyond the document, clearly indicate this.',
        },
        {
          role: 'user',
          content: `Document content:\n${truncatedText}\n\nQuestion: ${question}\n\nPlease provide a comprehensive answer based on the document content above. Structure your answer clearly and use academic language.`,
        },
      ];
    } else if (action === 'chat') {
      if (!message || message.trim().length === 0) {
        return NextResponse.json(
          { error: 'No message provided' },
          { status: 400 }
        );
      }

      messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant discussing the content of a document. Here is the document content:\n\n${truncatedText}\n\nAnswer questions and discuss topics based on this document.`,
        },
        ...(conversationHistory || []),
        {
          role: 'user',
          content: message,
        },
      ];
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "summarize", "generate_questions", "answer", or "chat"' },
        { status: 400 }
      );
    }

    // Make request to Perplexity AI with detailed logging
    console.log(`📤 Sending ${action} request to Perplexity AI...`);
    
    const requestBody = {
      model: MODEL,
      messages,
      max_tokens: action === 'summarize' ? 800 : (action === 'generate_questions' ? 1000 : 600),
      temperature: action === 'summarize' ? 0.3 : (action === 'generate_questions' ? 0.4 : (action === 'answer' ? 0.2 : 0.5)),
      top_p: 0.9,
      stream: false,
    };
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Perplexity API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        apiKey: PERPLEXITY_API_KEY ? `${PERPLEXITY_API_KEY.substring(0, 10)}...` : 'NOT SET',
      });
      
      let errorMessage = 'Failed to process request';
      let userFriendlyMessage = '';
      
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Invalid API key.';
        userFriendlyMessage = 'The Perplexity API key is invalid or expired. Please verify your API key.';
        console.error('🔑 API Key format:', PERPLEXITY_API_KEY ? `Starts with: ${PERPLEXITY_API_KEY.substring(0, 5)}...` : 'MISSING');
      } else if (response.status === 400) {
        errorMessage = `Bad request`;
        userFriendlyMessage = `Invalid request format. ${errorText}`;
        console.error('📝 Request body that caused error:', JSON.stringify(requestBody, null, 2));
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded';
        userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden';
        userFriendlyMessage = 'API access denied. Check your subscription and permissions.';
      } else {
        userFriendlyMessage = `API error: ${response.statusText}`;
      }

      return NextResponse.json(
        { 
          error: errorMessage, 
          message: userFriendlyMessage,
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ Response received from Perplexity AI');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ Invalid response structure:', data);
      return NextResponse.json(
        { error: 'No response received from AI', details: 'API returned empty choices' },
        { status: 500 }
      );
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log(`✅ ${action} completed successfully. Response length: ${aiResponse.length} chars`);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      usage: data.usage,
      action: action,
    });

  } catch (error: any) {
    console.error('❌ AI Chat API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.stack || 'No stack trace available',
        type: error.name || 'UnknownError'
      },
      { status: 500 }
    );
  }
}

/**
 * Test endpoint to verify API configuration
 * GET /api/ai/chat
 */
export async function GET() {
  const hasApiKey = !!PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.trim() !== '';
  
  return NextResponse.json({
    status: hasApiKey ? 'ok' : 'error',
    message: hasApiKey 
      ? 'Perplexity AI Chat API is running and configured' 
      : 'API key is not configured',
    model: MODEL,
    apiKeyConfigured: hasApiKey,
    apiKeyPreview: hasApiKey ? `${PERPLEXITY_API_KEY.substring(0, 10)}...` : 'NOT SET',
    timestamp: new Date().toISOString(),
  });
}
