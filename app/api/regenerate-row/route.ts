import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: Request) {
  const openai = getOpenAI();
  try {
    const { rowIndex, productName, brandName, colors, currentRow } = await request.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You regenerate single ad concepts. Create something COMPLETELY DIFFERENT from what's provided.`,
        },
        {
          role: 'user',
          content: `Regenerate this ad concept with something totally fresh and different:

Current (DO NOT repeat this):
- Ad copy: ${currentRow.ad_copy}
- Character: ${currentRow.character}
- Visual guide: ${currentRow.visual_guide}

Product: ${productName}
Brand: ${brandName || 'Generic'}
Colors: ${colors?.join(', ') || 'Modern palette'}

Return JSON with keys: ad_copy, character, visual_guide
Make it COMPLETELY different - new character type, new setting, new mood.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 1.0,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response');

    const newConcept = JSON.parse(content);

    return NextResponse.json({
      row: {
        ad_copy: newConcept.ad_copy || newConcept.adCopy,
        character: newConcept.character,
        visual_guide: newConcept.visual_guide || newConcept.visualGuide,
      },
    });
  } catch (error: any) {
    console.error('Regenerate row error:', error);
    return NextResponse.json({ error: error.message || 'Regeneration failed' }, { status: 500 });
  }
}
