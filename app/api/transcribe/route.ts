import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';
import * as fs from 'fs/promises'; 
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const speechClient = new SpeechClient();


interface GoogleSpeechRecognitionResult {
    alternatives?: { transcript?: string; confidence?: number }[];
}

interface GoogleSpeechRecognitionResponse {
    results?: GoogleSpeechRecognitionResult[];

}

export async function POST(request: NextRequest) {
    const inputFilename = `${uuidv4()}-input.webm`;
    const outputFilename = `${uuidv4()}-output.flac`;
    const inputPath = path.join(os.tmpdir(), inputFilename);
    const outputPath = path.join(os.tmpdir(), outputFilename);

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided.' }, { status: 400 });
        }

        console.log(`Received file: ${file.name}, size: ${file.size}, type: ${file.type}`);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(inputPath, buffer);
        console.log(`Input file written to: ${inputPath}`);

        await new Promise<void>((resolve, reject) => {
            console.log('Starting FFmpeg conversion (fluent-ffmpeg)...');
            ffmpeg(inputPath)
                .output(outputPath)
                .audioCodec('flac') 
                .audioChannels(1)   
                .audioFrequency(16000) 
                .on('end', () => {
                    console.log('FFmpeg conversion finished.');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(new Error(`Audio conversion failed: ${err.message}`));
                })
                .run();
        });

        const flacData = await fs.readFile(outputPath);
        const flacBase64 = flacData.toString('base64');

        console.log(`Converted audio size: ${flacData.length} bytes (FLAC)`);

        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
        console.log('Temporary files removed.');

        const audio = { content: flacBase64 };
        const config = {
            encoding: 2, 
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'default',
        };
        const requestPayload = { audio, config };

        console.log('Sending request to Google Cloud Speech-to-Text...');
        
        const [responseData] = await speechClient.recognize(requestPayload) as [GoogleSpeechRecognitionResponse, unknown, unknown];

      
        if (!responseData?.results || responseData.results.length === 0) {
            console.log('Google API returned no results.');
            return NextResponse.json({ transcription: '' });
        }

        const transcription = responseData.results
            .map((result: GoogleSpeechRecognitionResult) => result.alternatives?.[0]?.transcript)
            .filter((transcript): transcript is string => transcript != null) // Type guard
            .join('\n');

        console.log('Transcription successful:', transcription);
        return NextResponse.json({ transcription: transcription });

    } catch (error: unknown) { 
        console.error('Error during processing:', error);

        try {
            if (await fs.stat(inputPath).catch(() => false)) await fs.unlink(inputPath);
            if (await fs.stat(outputPath).catch(() => false)) await fs.unlink(outputPath);
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }

        let userErrorMessage = 'An unexpected error occurred during transcription.';
        
        if (typeof error === 'object' && error !== null) {
             if ('code' in error && error.code === 3 && 'details' in error && typeof error.details === 'string' && error.details.includes('Sync input too long')) {
                 userErrorMessage = 'Audio duration is too long. Please use audio shorter than 60 seconds.'; 
                 return NextResponse.json({ error: userErrorMessage }, { status: 400 });
             }
             if ('message' in error && typeof error.message === 'string') {
                 userErrorMessage = error.message;
                 if (userErrorMessage.includes('conversion failed')) {
                     userErrorMessage = 'Failed to convert audio format.';
                 }
             }
        } else if (error instanceof Error) { 
             userErrorMessage = error.message;
             if (userErrorMessage.includes('conversion failed')) {
                 userErrorMessage = 'Failed to convert audio format.';
             }
        }

        return NextResponse.json({ error: `Processing failed: ${userErrorMessage}` }, { status: 500 });
    }
}