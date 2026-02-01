import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Ideator GPT, a specialized assistant that generates structured visual concept tables for creative, marketing, and advertising ideation.

Your job is to generate ad concepts in JSON format. For each ad, create:
1. ad_copy: Short, energetic slogan (20-35 characters, punchy and action-oriented)
2. product: Product name/type (use the provided product name)
3. character: Person, mascot, animal, or figure relevant to the concept - be creative and varied
4. visual_guide: 200-300 characters describing camera angle, background, action, mood, style. Keep consistent visual quality across rows. Be specific about composition, lighting, and mood.
5. text_watermark: Brand watermark if provided

Rules:
- Make each ad concept UNIQUE and VARIED - different characters, different scenarios, different moods
- Ad copy should be catchy, memorable slogans (not descriptions)
- Visual guides should be detailed enough for AI image generation
- Characters can be: real people (diverse demographics), animals, mascots, celebrities (generic references), cartoon characters
- Include a mix of: lifestyle shots, product-focused shots, action shots, emotional moments
- Consider different settings: outdoor, indoor, studio, abstract backgrounds
- Vary the camera angles: close-up, wide shot, bird's eye, low angle, etc.

Output as a JSON array of objects.`;

export async function POST(request: Request) {
  try {
    const { adCount, productName, brandName, watermark, colors, productAnalysis, style } = await request.json();

    const colorString = colors && colors.length > 0 
      ? `Primary: ${colors[0]}, Secondary: ${colors[1] || colors[0]}, Accent: ${colors[2] || '#ffffff'}`
      : 'Use modern, appealing colors';

    const styleGuide: Record<string, string> = {
      modern: 'Clean, minimalist aesthetic with lots of white space and geometric shapes',
      playful: 'Vibrant, energetic with dynamic poses and bright saturated colors',
      luxury: 'Elegant, sophisticated with dark backgrounds and gold accents',
      bold: 'High contrast, dramatic lighting, powerful imagery',
      minimal: 'Simple compositions, muted colors, focus on the product',
    };

    const userPrompt = `Generate ${adCount} unique ad concepts for:

Product: ${productName}
Brand: ${brandName || 'Generic brand'}
Watermark: ${watermark || 'none'}
Colors: ${colorString}
Style Direction: ${styleGuide[style] || 'Modern and professional'}
${productAnalysis ? `Product Details: ${productAnalysis.visualDescription}` : ''}

Create ${adCount} DIVERSE ad concepts. Each should feel fresh and different. Mix up:
- Characters (different types, ages, demographics)
- Settings (indoor, outdoor, abstract, lifestyle)
- Moods (exciting, peaceful, luxurious, fun, professional)
- Camera angles and compositions

Return as JSON object with key "ads" containing an array with keys: ad_copy, product, character, visual_guide, text_watermark`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(content);
    const adsArray = parsed.ads || parsed.concepts || parsed.rows || (Array.isArray(parsed) ? parsed : []);

    const rows = adsArray.slice(0, adCount).map((ad: any, index: number) => ({
      index: `'${String(index + 1).padStart(2, '0')}`,
      ad_copy: ad.ad_copy || ad.adCopy || `${productName} Ad`,
      product: ad.product || productName,
      character: ad.character || 'Product showcase',
      visual_guide: ad.visual_guide || ad.visualGuide || 'Professional product photography',
      text_watermark: ad.text_watermark || ad.textWatermark || watermark || '',
      color_1: colors?.[0] || '#6366f1',
      color_2: colors?.[1] || '#8b5cf6',
      color_3: colors?.[2] || '#ffffff',
      status: 'pending',
    }));

    return NextResponse.json({ rows });
  } catch (error: any) {
    console.error('Generate table error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate table' }, { status: 500 });
  }
}
