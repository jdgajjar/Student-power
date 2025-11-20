/**
 * PDF Analyzer using Perplexity AI API
 * This uses Perplexity's powerful AI models with priority on PDF content
 */

class PDFAnalyzer {
  private isInitialized = false;
  private currentPDFText: string = '';
  private apiKey: string = '';

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Perplexity AI...');
      
      // Get API key from environment variable
      this.apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';
      
      if (!this.apiKey) {
        throw new Error('Perplexity API key not found. Please set NEXT_PUBLIC_PERPLEXITY_API_KEY environment variable.');
      }
      
      this.isInitialized = true;
      console.log('Perplexity AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Perplexity AI:', error);
      throw new Error('Failed to initialize AI. Please check your API key configuration.');
    }
  }

  setPDFText(text: string) {
    this.currentPDFText = text;
  }

  async summarize(text?: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const textToSummarize = text || this.currentPDFText;
    
    if (!textToSummarize || textToSummarize.trim().length === 0) {
      throw new Error('No text available to summarize');
    }

    try {
      // Truncate text if too long (Perplexity has token limits)
      const maxChars = 8000; // Roughly 2000 tokens
      const truncatedText = textToSummarize.substring(0, maxChars);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes academic documents. Focus on extracting key concepts, main ideas, and important details from the provided PDF content. Provide a concise yet comprehensive summary.'
            },
            {
              role: 'user',
              content: `Please summarize the following PDF content:\n\n${truncatedText}`
            }
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Perplexity API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Perplexity API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Summarization error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate summary: ${error.message}`);
      }
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  async answerQuestion(question: string, context?: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const contextText = context || this.currentPDFText;
    
    if (!contextText || contextText.trim().length === 0) {
      throw new Error('No PDF content loaded to answer questions');
    }

    if (!question || question.trim().length === 0) {
      throw new Error('Please provide a question');
    }

    try {
      // Truncate context if too long
      const maxChars = 8000; // Roughly 2000 tokens
      const truncatedContext = contextText.substring(0, maxChars);
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that answers questions based on PDF documents. PRIORITIZE information from the PDF content provided. If the answer is in the PDF, use that information first. You may supplement with general knowledge only if needed, but always indicate when you do so. Be precise and cite relevant parts of the document.'
            },
            {
              role: 'user',
              content: `PDF Content:\n${truncatedContext}\n\nQuestion: ${question}\n\nPlease answer based primarily on the PDF content above. If you use information beyond the PDF, clearly indicate it.`
            }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Perplexity API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from Perplexity API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Question answering error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to answer question: ${error.message}`);
      }
      throw new Error('Failed to answer question. Please try again.');
    }
  }

  getStatus(): { initialized: boolean; hasContent: boolean } {
    return {
      initialized: this.isInitialized,
      hasContent: this.currentPDFText.length > 0,
    };
  }
}

// Export singleton instance
export const pdfAnalyzer = new PDFAnalyzer();
