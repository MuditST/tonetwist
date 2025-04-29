import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from "elevenlabs";
import { enhancementStyles, getVoiceConfig } from '@/lib/styles';
import { Buffer } from 'buffer';


// Type guards using unknown
function hasDestroy(stream: unknown): stream is { destroy: () => void } {
    return !!stream && typeof (stream as any).destroy === 'function';
}

function hasCancel(stream: unknown): stream is { cancel: () => void } {
    return !!stream && typeof (stream as any).cancel === 'function';
}

function hasPause(stream: unknown): stream is { pause: () => void } {
    return !!stream && typeof (stream as any).pause === 'function';
}

function hasUnpipe(stream: unknown): stream is { unpipe: () => void } {
    return !!stream && typeof (stream as any).unpipe === 'function';
}

function safeDestroyStream(stream: unknown): void {
    if (!stream) return;

    if (hasDestroy(stream)) {
        console.log("Calling destroy() on stream object.");
        stream.destroy();
    } else if (hasCancel(stream)) {
        console.log("Calling cancel() on stream object.");
        stream.cancel();
    }
    else if (typeof stream === 'object' && stream !== null && 'readableStream' in stream && stream.readableStream instanceof ReadableStream) {
        console.log("Attempting to cancel inner ReadableStream from wrapper as fallback...");
        stream.readableStream.cancel().catch(e => console.error("Error cancelling inner stream:", e));
    }
    else {
        console.warn("Stream object does not have a standard destroy or cancel method. Attempting pause/unpipe.");
        if (hasPause(stream)) stream.pause();
        if (hasUnpipe(stream)) stream.unpipe();
    }
}

// streamToBuffer using unknown
async function streamToBuffer(stream: unknown, timeoutMs: number = 90000): Promise<Buffer> {
    
    if (!stream || typeof (stream as any)[Symbol.asyncIterator] !== 'function') {
       
        if (typeof (stream as any).on !== 'function') {
             throw new Error("Input is not an async iterable stream or a compatible Node.js stream.");
        }
       
        console.warn("Stream is not async iterable, falling back to event-based buffering.");
        return streamToBufferWithEvents(stream as NodeJS.ReadableStream, timeoutMs);
    }

    console.log("Processing stream using async iteration (for await...of)...");
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Async iteration timed out after ${timeoutMs}ms`)), timeoutMs)
    );

    try {
        const processStream = async () => {
            const asyncIterableStream = stream as AsyncIterable<Uint8Array | Buffer>;
            for await (const chunk of asyncIterableStream) {
                const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                chunks.push(bufferChunk);
                totalBytes += bufferChunk.length;
                
            }
            console.log(`Async iteration completed. Total chunks: ${chunks.length}, Total bytes: ${totalBytes}`);
            return Buffer.concat(chunks);
        };

        return await Promise.race([processStream(), timeoutPromise]) as Buffer;

    } catch (error) {
        console.error("Error during async iteration:", error);
        throw error;
    }
}

// streamToBufferWithEvents using NodeJS.ReadableStream
async function streamToBufferWithEvents(readable: NodeJS.ReadableStream, timeoutMs: number): Promise<Buffer> {
     console.log("Using event-based buffering...");
     const chunks: Buffer[] = [];
     return new Promise((resolve, reject) => {
         const timeoutId = setTimeout(() => {
             console.error(`Event-based buffer operation timed out after ${timeoutMs}ms`);
             safeDestroyStream(readable); 
             reject(new Error(`Timed out waiting for stream events after ${timeoutMs}ms`));
         }, timeoutMs);

         readable.on('data', (chunk) => {
             chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
         });
         readable.on('error', (err) => {
             clearTimeout(timeoutId);
             console.error("Error reading stream via events:", err);
             reject(err);
         });
         readable.on('end', () => {
             clearTimeout(timeoutId);
             console.log(`Stream 'end' event received. Total chunks: ${chunks.length}.`);
             resolve(Buffer.concat(chunks));
         });
         readable.on('close', () => { 
             clearTimeout(timeoutId);
             console.log("Stream 'close' event received.");
             resolve(Buffer.concat(chunks));
         });

         if (typeof readable.resume === 'function' && (readable as any).isPaused?.()) {
            console.log("Calling resume() on Node.js stream...");
            readable.resume();
         }
     });
}

export async function POST(request: NextRequest) {
    let audioStream: unknown = null;

    try {
        const { text, style } = await request.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid text in request body.' }, { status: 400 });
        }
        if (!style || typeof style !== 'string') {
            return NextResponse.json({ error: 'Missing or invalid style in request body.' }, { status: 400 });
        }
        if (!enhancementStyles.some(s => s.value === style)) {
             return NextResponse.json({ error: 'Invalid enhancement style selected.' }, { status: 400 });
        }

      
        const { voiceId, apiKeyIndex } = getVoiceConfig(style);
        const apiKeyEnvVar = `ELEVENLABS_API_KEY${apiKeyIndex}`;
        const apiKey = process.env[apiKeyEnvVar];

        if (!apiKey) {
            console.error(`ElevenLabs API Key not found for index ${apiKeyIndex} (Variable: ${apiKeyEnvVar})`);
            return NextResponse.json({ error: `Configuration error: API Key for the selected voice style is missing.` }, { status: 500 });
        }

        console.log(`Synthesizing text with voiceId: ${voiceId} using API Key Index: ${apiKeyIndex}`);

        const elevenlabs = new ElevenLabsClient({ apiKey: apiKey });

        audioStream = await elevenlabs.generate({
            voice: voiceId,
            text: text,
            model_id: "eleven_multilingual_v2", 
            voice_settings: { stability: 0.5, similarity_boost: 0.75 } 
        });

        console.log("Buffering audio stream...");
        const audioBuffer = await streamToBuffer(audioStream, 90000); 
        audioStream = null; 

        console.log(`Audio stream buffered successfully. Size: ${audioBuffer.length} bytes.`);

        return new NextResponse(audioBuffer, { 
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
            },
        });

    } catch (error: unknown) {
        console.error('Error during ElevenLabs synthesis API call:', error);
        safeDestroyStream(audioStream);

        let errorMessage = 'Failed to synthesize audio.';
        let status = 500;

     
        if (typeof error === 'object' && error !== null) {
            if ('status' in error && typeof error.status === 'number') {
                status = error.status;
            }
            if ('message' in error && typeof error.message === 'string') {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) { 
             errorMessage = error.message;
        }


       
        if (status === 401) {
             errorMessage = 'Invalid ElevenLabs API Key provided.';
        } else if (status === 400) {
             if (errorMessage.toLowerCase().includes('voice')) {
                 errorMessage = 'Selected ElevenLabs voice ID not found or inaccessible with the provided API key. Please verify the Voice ID in your configuration.';
             } else if (errorMessage.toLowerCase().includes('text')) {
                 errorMessage = 'Invalid or empty text provided for synthesis.';
             } else {
                 errorMessage = `Bad request (${errorMessage || 'details unavailable'}). Please check input parameters.`;
             }
        } else if (status === 429) {
             errorMessage = 'ElevenLabs API quota exceeded or rate limit hit for the provided key.';
        } else if (errorMessage.toLowerCase().includes('timed out')) {
             errorMessage = 'Audio synthesis timed out. The request may be too long or the service is experiencing delays.';
             status = 504;
        }

        return NextResponse.json({ error: errorMessage }, { status: status });
    }
}