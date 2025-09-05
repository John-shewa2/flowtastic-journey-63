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
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      const errMsg = errorData?.error?.message || 'Unknown error';

      // Graceful fallback when OpenAI is unavailable (quota, config, etc.)
      const lowerMsg = (message || '').toLowerCase();
      const tips: string[] = [];
      if (lowerMsg.includes('protein')) tips.push('Prioritize lean proteins like chicken breast, tofu, eggs, beans, or Greek yogurt across meals.');
      if (lowerMsg.includes('fiber') || lowerMsg.includes('vegetable')) tips.push('Aim for 2–3 cups of vegetables daily and include high‑fiber carbs like oats, quinoa, lentils, and berries.');
      if (lowerMsg.includes('weight') || lowerMsg.includes('fat')) tips.push('Create a small calorie deficit, focus on whole foods, and include resistance training 2–3x/week.');
      if (lowerMsg.includes('meal') || lowerMsg.includes('plan')) tips.push('Build plates using the 3-2-1 method: 3 parts veggies, 2 parts protein, 1 part whole‑grain carbs + healthy fats.');
      if (tips.length === 0) {
        tips.push(
          'Base meals around vegetables + lean protein + whole‑grain carbs + healthy fats.',
          'Hydrate well (2–3L/day) and limit ultra‑processed foods and added sugars.',
          'Batch‑prep simple meals (grain + protein + veg) to make healthy choices easy.'
        );
      }

      const planHint = groceryPlan
        ? 'Based on your grocery plan, add color variety (dark greens, orange/red veg), a lean protein per meal, and swap refined grains for whole grains where possible.'
        : 'Tell me your goal (e.g., weight loss, muscle gain, heart health) or paste a grocery list for tailored advice.';

      const fallbackResponse = `Nutri-AI temporary tip (service unavailable):\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n${planHint}`;

      return new Response(JSON.stringify({
        response: fallbackResponse,
        success: true,
        fallback: true,
        note: `Returned fallback due to AI error: ${errMsg}`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
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

    // Final safety net: generic fallback when anything goes wrong (e.g., missing key)
    const tips = [
      'Build meals with veggies + lean protein + whole‑grain carbs + healthy fats.',
      'Aim for 25–35g fiber/day from beans, whole grains, fruits, and veggies.',
      'Plan 3–4 balanced meals/snacks to keep energy steady and prevent overeating.'
    ];

    const fallbackResponse = `Nutri-AI temporary tip (service unavailable):\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nShare your grocery list or goals for more tailored guidance.`;

    return new Response(JSON.stringify({
      response: fallbackResponse,
      success: true,
      fallback: true,
      note: `Returned generic fallback due to error: ${error?.message || 'Unknown error'}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});