import { NextRequest, NextResponse } from 'next/server';

import { enhancementStyles, getPromptDescription } from '@/lib/styles';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.OPENROUTER_SITE_NAME || 'ToneTwist';

function constructPrompt(text: string, styleKey: string): string {

    const styleDescription = getPromptDescription(styleKey);

 
    return `
You are a text transformation engine specializing in preparing text for high-quality Text-to-Speech (TTS) synthesis using ElevenLabs.
Your task is to rewrite the following text while maintaining its core meaning, but adopting the persona and speaking style of ${styleDescription}.
Crucially, the output must be formatted for optimal TTS results:
- Use natural-sounding phrasing consistent with the persona.
- Employ punctuation (commas, periods, exclamation marks, question marks) effectively to guide the TTS engine's intonation, rhythm, and pauses, mimicking natural speech patterns for the persona.
- Break down very long sentences into shorter, more manageable ones where appropriate for better TTS delivery.
- Ensure the vocabulary and sentence structure perfectly match the chosen persona.
- Avoid adding any conversational filler unless it's explicitly part of the target persona (like "like" for Valley Girl).
Do NOT add any introductory phrases ("Here's the text:"), concluding remarks, explanations, apologies, or markdown formatting (like quotes or asterisks). Output ONLY the raw, transformed text suitable for direct TTS input.

Original Text:
"${text}"

Rewrite the text in the style of ${styleDescription}, optimized for ElevenLabs TTS:
    `.trim();
}

export async function POST(request: NextRequest) {
    if (!OPENROUTER_API_KEY) {
        return NextResponse.json({ error: 'OpenRouter API key not configured.' }, { status: 500 });
    }

    try {
        const { text, style } = await request.json();

        if (!text || !style) {
            return NextResponse.json({ error: 'Missing text or style in request body.' }, { status: 400 });
        }

        if (!enhancementStyles.some(s => s.value === style)) {
             return NextResponse.json({ error: 'Invalid enhancement style selected.' }, { status: 400 });
        }

        const prompt = constructPrompt(text, style);

        console.log(`Enhancing text with style: ${style}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": YOUR_SITE_URL, 
                "X-Title": YOUR_SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ],
                "temperature": 0.7, 
            
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API Error Response:', errorData);
            try {
                const jsonData = JSON.parse(errorData);
              
                 const message = jsonData.error?.message || errorData || 'Unknown error';
                 return NextResponse.json({ error: `OpenRouter API Error: ${message}` }, { status: response.status });
            } catch (_parseError) { 
                 return NextResponse.json({ error: `OpenRouter API Error: ${errorData}` }, { status: response.status });
            }
        }

        const result = await response.json();
        const enhancedText = result.choices?.[0]?.message?.content?.trim();

        if (!enhancedText) {
            console.error('Could not extract enhanced text from OpenRouter response:', result);
            return NextResponse.json({ error: 'Failed to get enhancement from API.' }, { status: 500 });
        }

        console.log("Enhancement successful.");

        return NextResponse.json({ enhancedText: enhancedText });

    } catch (error: unknown) { 
        console.error('Error during text enhancement:', error);
       
        const message = error instanceof Error ? error.message : 'An unknown server error occurred';
        return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
    }
}