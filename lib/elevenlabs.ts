import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';

export function getElevenLabsClient() {
    return new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
    });
}
