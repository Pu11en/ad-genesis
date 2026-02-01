import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_API_BASE = 'https://api.kie.ai/api/v1';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for image prompt generation (from the n8n workflow)
const IMAGE_PROMPT_SYSTEM = `## SYSTEM PROMPT: 🍳 Image Ad Prompt Generator Agent

You create detailed image generation prompts for AI ad creatives.

The final prompt should be written like this:

"""
Make an image ad for this product with the following elements.

product: [product name]
character: [character description]
ad_copy: [text to display on the ad]
visual_guide: [detailed visual description]
text_watermark: [watermark text]
text_watermark_location: [location]
Primary color of ad: [color]
Secondary color of ad: [color]
Tertiary color of ad: [color]
"""

Rules:
- Always include all required fields
- If ad copy is empty/null, do not include text in the image
- If text_watermark is empty/null, do not include watermark
- NEVER include any extra text apart from the ad copy and watermark unless specified
- NEVER alter the product appearance
- Make the visual guide extremely detailed and specific for AI image generation
- Include lighting, camera angle, composition, mood, style
- Keep colors consistent with the brand palette`;

export async function POST(request: Request) {
  try {
    const { row, model, productImageUrl } = await request.json();

    if (!KIE_API_KEY) {
      throw new Error('KIE_API_KEY not configured');
    }

    // Step 1: Generate the detailed image prompt using GPT-4
    const promptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: IMAGE_PROMPT_SYSTEM },
        {
          role: 'user',
          content: `Create 1 image prompt for this ad:

product: ${row.product}
character: ${row.character}
ad_copy: ${row.ad_copy}
visual_guide: ${row.visual_guide}
text_watermark: ${row.text_watermark}
Primary color: ${row.color_1}
Secondary color: ${row.color_2}
Tertiary color: ${row.color_3}

Return ONLY the prompt text, no JSON wrapping.`,
        },
      ],
      temperature: 0.7,
    });

    const imagePrompt = promptResponse.choices[0].message.content || '';

    // Step 2: Call Kie.ai Nano Banana API
    const kieModel = model === 'nano-banana-pro' ? 'nano-banana-pro' : 'google/nano-banana';
    
    const kiePayload: any = {
      model: kieModel,
      input: {
        prompt: imagePrompt,
        aspect_ratio: '1:1',
        output_format: 'png',
      },
    };

    // Add reference image if provided
    if (productImageUrl) {
      kiePayload.input.image_input = [productImageUrl];
    }

    // For pro model, add resolution
    if (model === 'nano-banana-pro') {
      kiePayload.input.resolution = '1K';
    }

    const kieResponse = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kiePayload),
    });

    if (!kieResponse.ok) {
      const errorData = await kieResponse.json();
      console.error('Kie.ai error:', errorData);
      throw new Error(`Kie.ai API error: ${errorData.msg || 'Unknown error'}`);
    }

    const kieData = await kieResponse.json();

    if (kieData.code !== 200) {
      throw new Error(`Kie.ai error: ${kieData.msg}`);
    }

    return NextResponse.json({
      taskId: kieData.data.taskId,
      prompt: imagePrompt,
    });
  } catch (error: any) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
