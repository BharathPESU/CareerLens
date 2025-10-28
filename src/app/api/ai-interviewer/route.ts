// src/app/api/ai-interviewer/route.ts
import { aiInterviewerStream } from '@/ai/flows/ai-interviewer-flow';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stream = await aiInterviewerStream(body);

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (e: any) {
    console.error('Error in AI-interviewer route:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
