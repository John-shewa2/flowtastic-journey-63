import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { message, groceryPlan } = await req.json();

    // Create nutrition-focused system prompt
    const systemPrompt = `You are Nutri-AI, a specialized nutrition assistant for Nutricart. You help users with:

1. Nutritional analysis of foods and grocery lists
2. Dietary recommendations based on health goals
3. Meal planning and balanced nutrition advice
4. Food substitutions for healthier alternatives
5. Answers to nutrition-related questions

Guidelines:
- Always provide practical, actionable advice
- Consider nutritional balance, variety, and sustainability
- Suggest healthier alternatives when appropriate
- Be encouraging and supportive
- Include specific nutritional benefits when recommending foods
- Keep responses concise but informative

Current context: ${groceryPlan ? `User's grocery plan: ${JSON.stringify(groceryPlan)}` : 'General nutrition inquiry'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
        // Note: temperature not supported for GPT-4.1+ models
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nutrition-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});