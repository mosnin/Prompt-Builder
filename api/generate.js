import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, tone, format, context } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return res.status(400).json({ error: "Topic is required" });
  }

  if (topic.length > 2000) {
    return res.status(400).json({ error: "Topic must be under 2000 characters" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "OpenAI API key not configured. Set OPENAI_API_KEY in your Vercel environment variables.",
    });
  }

  const toneDescriptions = {
    professional: "professional and polished",
    casual: "casual, friendly, and conversational",
    academic: "formal and academic with citations where appropriate",
    creative: "creative, imaginative, and engaging",
    persuasive: "persuasive and compelling",
    technical: "precise and technical with accurate terminology",
    humorous: "witty and humorous while remaining informative",
  };

  const formatDescriptions = {
    detailed: "a comprehensive, detailed response",
    listicle: "a well-organized bullet-point list",
    "step-by-step": "a numbered step-by-step guide",
    essay: "a well-structured essay or article",
    code: "a technical response with code examples",
    email: "a professionally formatted email",
    social: "engaging social media content",
  };

  const toneDesc = toneDescriptions[tone] || "professional and polished";
  const formatDesc = formatDescriptions[format] || "a comprehensive, detailed response";

  const systemPrompt = `You are an expert prompt engineer. Your job is to take a user's topic or idea and create an optimized, well-structured prompt that they can use with ChatGPT, GPT-5, or any AI model.

The generated prompt should:
- Assign a clear role or persona to the AI
- Provide specific, detailed instructions
- Include relevant context and constraints
- Define the desired output format
- Use best practices from prompt engineering
- Be immediately usable (copy-paste ready)

Do NOT explain the prompt or add commentary. Output ONLY the generated prompt text itself.`;

  const userMessage = `Create an optimized AI prompt for the following:

Topic/Task: ${topic.trim()}
Desired Tone: ${toneDesc}
Output Format: ${formatDesc}${context ? `\nAdditional Context: ${context.trim()}` : ""}

Generate a detailed, well-structured prompt that will produce the best possible output from an AI model.`;

  try {
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const generatedPrompt = completion.choices[0]?.message?.content?.trim();

    if (!generatedPrompt) {
      return res.status(500).json({ error: "No response received from AI model" });
    }

    return res.status(200).json({ prompt: generatedPrompt });
  } catch (err) {
    console.error("OpenAI API error:", err.message);

    if (err.status === 401) {
      return res.status(401).json({ error: "Invalid OpenAI API key" });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
    }

    return res.status(500).json({ error: "Failed to generate prompt. Please try again." });
  }
}
