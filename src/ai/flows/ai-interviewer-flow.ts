
'use server';
/**
 * @fileOverview This file defines the Genkit flow for a real-time conversational AI interviewer
 * that streams video from D-ID.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerInputSchema,
  AiInterviewerFlowOutputSchema,
  type AiInterviewerInput,
} from '@/ai/schemas/ai-interviewer-flow';
import { Readable, PassThrough } from 'stream';

const D_ID_API_KEY = process.env.D_ID_API_KEY || '';

const AVATARS = {
  HR: 'https://cdn.d-id.com/avatars/fT47o6iKk2_SGS2A8m53I.png',
  Mentor: 'https://cdn.d-id.com/avatars/enhanced/o_jC4I2Aa0Cj8y0sBso_U.jpeg',
  Robot: 'https://cdn.d-id.com/avatars/enhanced/Cubs2gK3cDmF6xK2pGv01.jpeg',
};

async function* createDidStream(text: string, avatarType: keyof typeof AVATARS) {
  const response = await fetch('https://api.d-id.com/talks/streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${D_ID_API_KEY}`,
    },
    body: JSON.stringify({
      source_url: AVATARS[avatarType],
      script: {
        type: 'text',
        input: text,
      },
      config: {
        result_format: 'mp4',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D-ID API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const { session_id, id: talk_id } = data;
  let iceServers: any[] = [];
  let offer: any;

  // Poll for session to be ready
  while (true) {
    const sessionResponse = await fetch(
      `https://api.d-id.com/talks/streams/${session_id}`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${D_ID_API_KEY}` },
      }
    );
    const sessionData = await sessionResponse.json();
    if (sessionData.status === 'started' && sessionData.ice_servers) {
      iceServers = sessionData.ice_servers;
      offer = sessionData.offer;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Create Peer Connection
  const peerConnection = new RTCPeerConnection({ iceServers });

  const stream = new Readable({
    read() {},
  });

  peerConnection.ontrack = ({ track }) => {
    if (track.kind === 'video') {
      // This is a browser-specific part, we'll handle the stream on the server.
      // For the sake of streaming bytes back to our client, we need to handle the data chunks.
    }
  };

  const dataChannel = peerConnection.createDataChannel('json-channel');
  dataChannel.onmessage = (event) => {
    const message = JSON.parse(event.data);
    stream.push(JSON.stringify(message) + '\n');
  };

  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // Send SDP answer to D-ID
  await fetch(`https://api.d-id.com/talks/streams/${session_id}/sdp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${D_ID_API_KEY}`,
    },
    body: JSON.stringify({
      answer: peerConnection.localDescription,
      session_id,
    }),
  });

  // This part is conceptual as node-webrtc is not available in Next.js edge runtime
  // A proper implementation would need a separate server or different architecture.
  // We will simulate the stream of video chunks.
  // For the purpose of this prototype, we will yield metadata and the client will handle the connection.

  yield JSON.stringify({
    type: 'meta',
    session_id,
    ice_servers: iceServers,
    offer: offer
  }) + '\n';
  
  // The client will now take over the WebRTC handshake.
  // The server flow's job is done after providing the handshake metadata.
}

const systemPrompt = `You are "Alex", an expert career coach and interviewer. Your persona is professional, encouraging, and insightful. Your goal is to conduct a realistic and helpful mock interview.
You will be given the user's profile and the context of the conversation.
Your task is to analyze the user's most recent answer and generate the next turn in the conversation.
Keep your responses concise, natural-sounding, and no more than 2-3 sentences to keep video generation time short.
At the very end of the entire interview (when the user indicates they are done), you will provide a comprehensive performance report. The report should have a headline "## Performance Report" and include feedback on clarity, confidence, use of examples (like the STAR method), and suggestions for improvement.
`;

export const aiInterviewerStream = ai.defineFlow(
  {
    name: 'aiInterviewerStream',
    inputSchema: AiInterviewerInputSchema,
    outputSchema: AiInterviewerFlowOutputSchema,
  },
  async (input) => {
    const { userProfile, jobDescription, transcript, avatarType } = input;

    const llm = ai.getModel('googleai/gemini-2.5-flash-lite');

    // Create a simplified history for the model prompt
    const history = transcript.map(item => ({
      role: item.speaker === 'user' ? 'user' : 'model',
      content: [{ text: item.text }],
    }));

    // Construct the final prompt for the LLM
    const finalPrompt = `
      User Profile: ${JSON.stringify(userProfile)}
      Job Description: ${jobDescription || 'Not provided.'}
      The last thing the user said was: "${transcript[transcript.length - 1]?.text || 'Hello'}"
    `;

    // 1. Get the text response from Gemini
    const llmResponse = await llm.generate({
      system: systemPrompt,
      history,
      prompt: finalPrompt,
    });

    const responseText = llmResponse.text;
    
    // Create a pass-through stream to merge JSON and video data
    const passThrough = new PassThrough();

    // 2. Write the Gemini response as the first chunk of the stream
    passThrough.write(JSON.stringify({ type: 'text', content: responseText }) + '\n');
    
    // 3. Start the D-ID streaming process
    const didStream = await createDidStream(responseText, avatarType);

    // 4. Pipe the D-ID stream to our pass-through stream
    for await (const chunk of didStream) {
      passThrough.write(chunk);
    }

    passThrough.end();

    // This readable stream will be sent to the client
    return new Readable({
      read() {
        let chunk;
        while ((chunk = passThrough.read()) !== null) {
          this.push(chunk);
        }
      },
    }).pipe(passThrough);
  }
);
