import knowledgeBase from '../data/chatbot-knowledge.json';

class ChatBotService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    this.provider = import.meta.env.VITE_OPENAI_API_KEY ? 'openai' : 'gemini';
    this.messageHistory = [];
    this.maxHistoryLength = 10; // Keep last 10 messages for context
  }

  /**
   * Build system prompt with knowledge base
   */
  buildSystemPrompt(context) {
    let contextInfo = '';
    let specificGuidance = '';
    
    if (context.currentView === 'landing') {
      contextInfo = 'The user is on the HOME PAGE (landing page).';
      specificGuidance = `
IMPORTANT CONTEXT-SPECIFIC GUIDANCE:
- The user is on the HOME PAGE - there is NO sidebar here
- Navigation: Tell them to click "Browse Modules" or "Learning Paths" buttons
- DO NOT mention the sidebar/hamburger menu - it doesn't exist on the home page
- The sidebar only appears AFTER they enter modules or learning paths`;
    } else if (context.currentView === 'modules') {
      contextInfo = 'The user is browsing the modules list.';
      specificGuidance = `
IMPORTANT CONTEXT-SPECIFIC GUIDANCE:
- The user is viewing the MODULES LIST
- The sidebar (hamburger menu) IS available here in the top-left
- They can use the sidebar to navigate or check progress`;
    } else if (context.currentView === 'module' && context.currentModule) {
      contextInfo = `The user is currently viewing the "${context.currentModule}" module.`;
      specificGuidance = `
IMPORTANT CONTEXT-SPECIFIC GUIDANCE:
- The user is INSIDE a module
- The sidebar (hamburger menu) IS available here
- They can switch between tabs: Documentation, Videos, Quizzes, Problems, Walkthroughs`;
    } else if (context.currentView === 'paths') {
      contextInfo = 'The user is viewing Learning Paths.';
      specificGuidance = `
IMPORTANT CONTEXT-SPECIFIC GUIDANCE:
- The user is viewing LEARNING PATHS
- The sidebar (hamburger menu) IS available here
- They can choose from 7 different learning paths`;
    }

    return `You are Fluxy, a friendly and conversational AI assistant for CodeFlux, a DSA learning platform. Your role is to help users navigate the platform, understand features, and learn DSA concepts.

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}

CURRENT CONTEXT:
${contextInfo}
${specificGuidance}

CRITICAL INSTRUCTIONS:
- Be FRIENDLY, CASUAL, and CONVERSATIONAL - not robotic or overly formal
- RESPOND NATURALLY to greetings - "hi", "hey", "hello" are perfectly valid conversation starters
- Use personality! Make jokes, be encouraging, show enthusiasm
- Use emojis occasionally to be engaging (but not overdone)
- ONLY mention modules/learning paths when relevant to the user's question - don't push them unnecessarily
- Consider the current page context when giving navigation advice
- For DSA questions, provide clear explanations with examples when asked
- Don't ALWAYS redirect users to learn more - sometimes just chat naturally
- If you don't know something, admit it honestly and offer to help another way
- Keep responses under 200 words unless detailed explanation is needed
- Remember: You're here to make learning DSA fun, not to be a marketing bot
- Always be patient and encouraging - learning can be frustrating!

Remember: You're Fluxy, here to make DSA learning fun and accessible! Be yourself - casual conversations are welcome!`;
  }

  /**
   * Send message to AI and get response
   */
  async sendMessage(userMessage, conversationHistory, context = {}) {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please add VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY to your .env file.');
    }

    try {
      if (this.provider === 'openai') {
        return await this.sendToOpenAI(userMessage, conversationHistory, context);
      } else {
        return await this.sendToGemini(userMessage, conversationHistory, context);
      }
    } catch (error) {
      console.error('ChatBot API error:', error);
      throw error;
    }
  }

  /**
   * Send message to OpenAI
   */
  async sendToOpenAI(userMessage, conversationHistory, context) {
    const systemPrompt = this.buildSystemPrompt(context);

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-this.maxHistoryLength).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Send message to Google Gemini
   */
  async sendToGemini(userMessage, conversationHistory, context) {
    const systemPrompt = this.buildSystemPrompt(context);

    // For Gemini, we'll include system prompt as the first user message
    const messages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm Fluxy, ready to help with CodeFlux!" }]
      }
    ];

    // Add conversation history
    conversationHistory.slice(-this.maxHistoryLength).forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    console.log('Sending to Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      
      let errorMessage = `Gemini API error: ${response.status}`;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Invalid response from Gemini API - no candidates found');
    }
    
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Get quick suggestions based on context
   */
  getQuickSuggestions(context) {
    const suggestions = [];

    if (context.currentView === 'landing') {
      suggestions.push(
        "How do I start learning?",
        "What are Learning Paths?",
        "Tell me about the modules"
      );
    } else if (context.currentView === 'modules') {
      suggestions.push(
        "Which module should I start with?",
        "How do I track my progress?",
        "What are walkthroughs?"
      );
    } else if (context.currentView === 'module') {
      suggestions.push(
        `Explain ${context.currentModule}`,
        "How do I solve practice problems?",
        "What's in the quiz section?"
      );
    } else if (context.currentView === 'paths') {
      suggestions.push(
        "Which learning path should I choose?",
        "What's the difference between paths?",
        "How long does each path take?"
      );
    }

    return suggestions;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.messageHistory = [];
  }
}

export default new ChatBotService();
