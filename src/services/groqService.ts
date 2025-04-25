import { Groq } from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

// Default model if none is specified
const DEFAULT_MODEL = 'llama3-8b-8192';
// Default reasoning model - always use this specific model for reasoning
const REASONING_MODEL = 'deepseek-r1-distill-llama-70b';

export const getChatCompletion = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  model: string = DEFAULT_MODEL,
  options?: { useReasoning?: boolean }
) => {
  try {
    // Always use the reasoning model when reasoning mode is enabled
    const modelToUse = options?.useReasoning ? REASONING_MODEL : model;
    
    const requestOptions: any = {
      messages,
      model: modelToUse,
      temperature: 0.7,
      max_tokens: 1000,
    };
    
    // Add reasoning_format if using reasoning
    if (options?.useReasoning) {
      requestOptions.reasoning_format = 'parsed';
    }
    
    const response = await groq.chat.completions.create(requestOptions);
    return response;
  } catch (error) {
    console.error('Error with Groq API:', error);
    throw error;
  }
};

export const streamChatCompletion = async (
  messages: { role: 'user' | 'assistant'; content: string }[],
  onChunk: (chunk: string, reasoningChunk?: string) => void,
  onComplete: () => void,
  model: string = DEFAULT_MODEL,
  options?: { useReasoning?: boolean }
) => {
  try {
    // Always use the reasoning model when reasoning mode is enabled
    const modelToUse = options?.useReasoning ? REASONING_MODEL : model;
    
    const requestOptions: any = {
      messages,
      model: modelToUse,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    };
    
    // Add reasoning_format if using reasoning
    if (options?.useReasoning) {
      requestOptions.reasoning_format = 'parsed';
    }
    
    const stream = await groq.chat.completions.create(requestOptions);
    
    let reasoning = '';
    let content = '';
    
    for await (const chunk of stream) {
      if (options?.useReasoning) {
        // Handle parsed reasoning format
        const reasoningDelta = chunk.choices[0]?.delta?.reasoning;
        if (reasoningDelta) {
          reasoning += reasoningDelta;
        }
        
        const contentDelta = chunk.choices[0]?.delta?.content;
        if (contentDelta) {
          content += contentDelta;
        }
        
        // Always send both content and reasoning on each update
        if (reasoningDelta || contentDelta) {
          onChunk(content, reasoning);
        }
      } else {
        // Standard streaming without reasoning
        const contentDelta = chunk.choices[0]?.delta?.content || '';
        if (contentDelta) {
          onChunk(contentDelta);
        }
      }
    }
    
    onComplete();
    return true;
  } catch (error) {
    console.error('Error with Groq streaming API:', error);
    throw error;
  }
};