/**
 * Browser-compatible audio interface for ElevenLabs Conversational AI.
 *
 * Captures microphone audio as 16kHz mono PCM and plays back AI audio
 * through the browser's Web Audio API (AudioContext).
 */

export class BrowserAudioInterface {
    private static readonly SAMPLE_RATE = 16000;
    private static readonly CHANNELS = 1;
    private static readonly INPUT_FRAMES_PER_BUFFER = 4096; // ~256ms at 16kHz (must be power of 2)

    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private scriptNode: ScriptProcessorNode | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;

    private outputQueue: Uint8Array[] = [];
    private outputContext: AudioContext | null = null;
    private shouldStop = false;

    private inputCallback?: (audio: Buffer) => void;

    /**
     * Start capturing microphone audio and set up playback.
     */
    async start(inputCallback: (audio: Buffer) => void): Promise<void> {
        console.log('[ElevenLabs Audio] Starting audio interface...');
        this.inputCallback = inputCallback;
        this.shouldStop = false;
        this.outputQueue = [];

        // Request microphone access
        console.log('[ElevenLabs Audio] Requesting microphone access...');
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: { ideal: BrowserAudioInterface.SAMPLE_RATE },
                channelCount: { ideal: BrowserAudioInterface.CHANNELS },
                echoCancellation: true,
                noiseSuppression: true,
            },
        });
        console.log('[ElevenLabs Audio] Microphone access granted');

        // Create audio context for input processing
        this.audioContext = new AudioContext({
            sampleRate: BrowserAudioInterface.SAMPLE_RATE,
        });
        console.log('[ElevenLabs Audio] AudioContext created');

        // Create source from microphone
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

        // Create script processor to capture audio chunks
        this.scriptNode = this.audioContext.createScriptProcessor(
            BrowserAudioInterface.INPUT_FRAMES_PER_BUFFER,
            BrowserAudioInterface.CHANNELS,
            BrowserAudioInterface.CHANNELS,
        );

        let audioChunkCount = 0;
        this.scriptNode.onaudioprocess = (event) => {
            if (this.shouldStop) return;
            audioChunkCount++;
            if (audioChunkCount % 10 === 0) {
                console.log('[ElevenLabs Audio] Audio chunks sent:', audioChunkCount);
            }

            const float32Data = event.inputBuffer.getChannelData(0);
            const pcm16 = this.float32ToPcm16(float32Data);

            if (this.inputCallback) {
                this.inputCallback(Buffer.from(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength));
            }
        };

        // Connect the graph
        this.sourceNode.connect(this.scriptNode);
        this.scriptNode.connect(this.audioContext.destination);

        // Set up output context for playback
        this.outputContext = new AudioContext({
            sampleRate: BrowserAudioInterface.SAMPLE_RATE,
        });
        console.log('[ElevenLabs Audio] Audio interface started successfully');
    }

    /**
     * Stop capturing and clean up resources.
     */
    stop(): void {
        this.shouldStop = true;

        // Stop input
        if (this.scriptNode) {
            this.scriptNode.disconnect();
            this.scriptNode = null;
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track) => track.stop());
            this.mediaStream = null;
        }

        // Stop output
        this.outputQueue = [];
        if (this.outputContext) {
            this.outputContext.close();
            this.outputContext = null;
        }
    }

    /**
     * Output audio chunk to the speaker.
     * Audio is 16-bit PCM mono at 16kHz.
     */
    output(audio: Buffer): void {
        if (this.shouldStop || !this.outputContext) return;

        // Queue the audio data for playback
        this.outputQueue.push(new Uint8Array(audio));

        // Play if not already playing
        if (!this.isPlaying) {
            this.playQueuedAudio();
        }
    }

    /**
     * Interrupt current audio playback.
     */
    interrupt(): void {
        this.outputQueue = [];
        if (this.outputContext) {
            this.outputContext.close();
            this.outputContext = new AudioContext({
                sampleRate: BrowserAudioInterface.SAMPLE_RATE,
            });
        }
    }

    private get isPlaying(): boolean {
        return this.outputContext?.state === 'running' && this.outputQueue.length > 0;
    }

    private async playQueuedAudio(): Promise<void> {
        if (this.outputQueue.length === 0 || !this.outputContext) return;

        // Drain the queue and play as a single buffer
        const totalLength = this.outputQueue.reduce((sum, chunk) => sum + chunk.length, 0);
        const pcmData = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of this.outputQueue) {
            pcmData.set(chunk, offset);
            offset += chunk.length;
        }
        this.outputQueue = [];

        // Convert PCM16 to Float32 for AudioBuffer
        const float32Data = this.pcm16ToFloat32(pcmData);
        const audioBuffer = this.outputContext.createBuffer(
            BrowserAudioInterface.CHANNELS,
            float32Data.length,
            BrowserAudioInterface.SAMPLE_RATE,
        );
        audioBuffer.getChannelData(0).set(float32Data);

        // Create and play source
        const source = this.outputContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputContext.destination);
        source.start();

        // When done, check if more audio is queued
        source.onended = () => {
            if (this.outputQueue.length > 0 && !this.shouldStop) {
                this.playQueuedAudio();
            }
        };
    }

    private float32ToPcm16(float32Array: Float32Array): Int16Array {
        const pcm16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        return pcm16;
    }

    private pcm16ToFloat32(pcm16: Uint8Array): Float32Array {
        const int16View = new Int16Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength / 2);
        const float32 = new Float32Array(int16View.length);
        for (let i = 0; i < int16View.length; i++) {
            float32[i] = int16View[i] / (int16View[i] < 0 ? 0x8000 : 0x7fff);
        }
        return float32;
    }
}

/**
 * Create a new BrowserAudioInterface instance.
 */
export function createBrowserAudioInterface(): BrowserAudioInterface {
    return new BrowserAudioInterface();
}
