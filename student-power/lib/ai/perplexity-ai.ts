/**
 * Perplexity AI Service
 * Integrates with Perplexity AI API for PDF summarization and Q&A
 * Uses the "Airtel Free Premium" plan with the provided API key
 */

const PERPLEXITY_API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Model optimized for the free premium plan - "sonar" is the main model
const MODEL = 'sonar';

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class PerplexityAI {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = PERPLEXITY_API_KEY;
    this.apiUrl = PERPLEXITY_API_URL;
    this.model = MODEL;
  }

  /**
   * Make a request to Perplexity AI API
   */
  private async makeRequest(messages: PerplexityMessage[], options: Partial<PerplexityRequest> = {}): Promise<string> {
    const requestBody: PerplexityRequest = {
      model: this.model,
      messages,
      max_tokens: options.max_tokens || 1024,
      temperature: options.temperature || 0.2,
      top_p: options.top_p || 0.9,
      stream: false,
      ...options,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorText}`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`API error (${response.status}): ${response.statusText}`);
        }
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response received from AI');
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('Perplexity API request failed:', error);
      throw error;
    }
  }

  /**
   * Summarize PDF text content
   */
  async summarize(pdfText: string): Promise<string> {
    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text provided for summarization');
    }

    // Truncate text if too long (keep first 10000 characters for context)
    const truncatedText = pdfText.length > 10000 
      ? pdfText.substring(0, 10000) + '...' 
      : pdfText;

    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that creates concise, informative summaries of academic documents. Focus on key points, main ideas, and important concepts.',
      },
      {
        role: 'user',
        content: `Please provide a comprehensive summary of the following document. Focus on the main topics, key concepts, and important information:\n\n${truncatedText}`,
      },
    ];

    try {
      const summary = await this.makeRequest(messages, {
        max_tokens: 512,
        temperature: 0.3,
      });
      return summary;
    } catch (error: any) {
      console.error('Summarization error:', error);
      throw new Error(error.message || 'Failed to generate summary. Please try again.');
    }
  }

  /**
   * Answer questions about PDF content
   */
  async answerQuestion(question: string, pdfText: string): Promise<string> {
    if (!question || question.trim().length === 0) {
      throw new Error('No question provided');
    }

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No PDF content available for answering questions');
    }

    // Truncate text if too long
    const truncatedText = pdfText.length > 10000 
      ? pdfText.substring(0, 10000) + '...' 
      : pdfText;

    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant that answers questions based on the provided document content. Provide accurate, concise answers based only on the information in the document. If the answer is not in the document, say so clearly.',
      },
      {
        role: 'user',
        content: `Document content:\n${truncatedText}\n\nQuestion: ${question}\n\nPlease answer the question based on the document content above.`,
      },
    ];

    try {
      const answer = await this.makeRequest(messages, {
        max_tokens: 512,
        temperature: 0.2,
      });
      return answer;
    } catch (error: any) {
      console.error('Question answering error:', error);
      throw new Error(error.message || 'Failed to answer question. Please try again.');
    }
  }

  /**
   * Chat with AI about the PDF content
   */
  async chat(userMessage: string, pdfText: string, conversationHistory: PerplexityMessage[] = []): Promise<string> {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('No message provided');
    }

    // Truncate text if too long
    const truncatedText = pdfText.length > 8000 
      ? pdfText.substring(0, 8000) + '...' 
      : pdfText;

    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: `You are a helpful AI assistant discussing the content of a document. Here is the document content:\n\n${truncatedText}\n\nAnswer questions and discuss topics based on this document.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    try {
      const response = await this.makeRequest(messages, {
        max_tokens: 512,
        temperature: 0.5,
      });
      return response;
    } catch (error: any) {
      console.error('Chat error:', error);
      throw new Error(error.message || 'Failed to process chat message. Please try again.');
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Say "OK" if you can read this.',
        },
      ];

      await this.makeRequest(messages, {
        max_tokens: 10,
      });
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const perplexityAI = new PerplexityAI();
