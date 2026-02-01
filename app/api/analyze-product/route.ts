import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this product/logo image and extract:
1. Brand name (if visible or inferable)
2. Main colors (up to 3, with hex codes and names)
3. Visual description (what the product/logo looks like)
4. Suggested character types for ads (3-5 suggestions)
5. Product type/category

Return as JSON with keys: brandName, colors (array of {hex, name}), visualDescription, suggestedCharacters (array of strings), productType`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response');

    const analysis = JSON.parse(content);

    return NextResponse.json({
      brandName: analysis.brandName || '',
      colors: analysis.colors || [],
      visualDescription: analysis.visualDescription || '',
      suggestedCharacters: analysis.suggestedCharacters || [],
      productType: analysis.productType || '',
    });
  } catch (error: any) {
    console.error('Analyze product error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
