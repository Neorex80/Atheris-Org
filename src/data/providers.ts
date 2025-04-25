// Define provider information
export const PROVIDERS = {
  'atheris': {
    name: 'Atheris AI',
    models: [
      { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B' },
      { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B' },
      { id: 'mistral-saba-24b', name: 'Mistral Saba 24B' }
    ],
    description: 'Atheris is an AI assistant powered by Groq and various Llama models',
    logo: 'atheris', // Reference to a logo asset if needed
    apiEndpoint: '/api/chat',
    isDefault: true
  },
  'groq': {
    name: 'Groq',
    models: [
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B 32k' },
      { id: 'gemma-7b-it', name: 'Gemma 7B' }
    ],
    description: 'Groq API providing fast inference for large language models',
    logo: 'groq',
    apiEndpoint: 'https://api.groq.com/openai/v1',
    isDefault: false
  }
};

export const DEFAULT_PROVIDER = 'atheris';