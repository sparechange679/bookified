import {IBook, Messages} from "@/types";
import {useAuth} from "@clerk/nextjs";
import {useEffect, useRef, useState} from "react";
import {startVoiceSession, endVoiceSession} from "@/lib/actions/sessions.actions";
import {ElevenLabsClient} from "@elevenlabs/elevenlabs-js/Client";
import {Conversation} from "@elevenlabs/elevenlabs-js/api/resources/conversationalAi/conversation";
import {createBrowserAudioInterface} from "@/lib/elevenlabs-audio";
import {createBrowserWebSocketFactory} from "@/lib/elevenlabs";

export type CallStatus = 'idle' | 'connecting' | 'starting' | 'listening' | 'thinking' | 'speaking';

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref;
};

export const useLabs = (book: IBook) => {
    const {userId} = useAuth();

    const [status, setStatus] = useState<CallStatus>('idle');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const sessionIdRef = useRef<string | null>(null);
    const conversationRef = useRef<Conversation | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration);
    const messagesRef = useLatestRef(messages);
    const currentMessageRef = useLatestRef(currentMessage);
    const isActive = status === 'listening' || status === 'thinking' || status === 'starting' || status === 'speaking';

    const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';

    // Duration timer
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setDuration((d) => d + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive]);

    const start = async () => {
        if (!userId) return setLimitError("Please login to start a conversation");
        if (!assistantId) return setLimitError("ElevenLabs assistant not configured");

        setLimitError(null);
        setStatus('connecting');

        try {
            console.log('[ElevenLabs] Starting voice session...');
            console.log('[ElevenLabs] Assistant ID:', assistantId);
            console.log('[ElevenLabs] API Key configured:', !!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY);
            
            // Create the voice session in the database
            const result = await startVoiceSession(userId, book.id);

            if (!result.success) {
                setLimitError(result.error || 'Session limit reached. Please upgrade your plan');
                setStatus('idle');
                return;
            }

            sessionIdRef.current = result.sessionId ?? null;
            console.log('[ElevenLabs] Voice session created:', sessionIdRef.current);

            // Initialize ElevenLabs client
            const client = new ElevenLabsClient({
                apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
            });

            // Create browser audio interface
            const audioInterface = createBrowserAudioInterface();

            // Build the system prompt from the book
            const systemPrompt = `You are ${book.title}'s author, ${book.author}. You are having a friendly, conversational discussion about the book "${book.title}". Be warm, engaging, and insightful. Keep responses concise and natural for spoken conversation.`;

            // Create the Conversation instance
            const conversation = new Conversation({
                client,
                agentId: assistantId,
                requiresAuth: true,
                audioInterface,
                webSocketFactory: createBrowserWebSocketFactory(),
                config: {
                    conversationConfigOverride: {
                        conversation_config_override: {
                            system_message: systemPrompt,
                        },
                    },
                    dynamicVariables: {
                        bookId: book.id,
                    },
                },
                callbackAgentResponse: (response: string) => {
                    // AI finished speaking — add the complete message
                    setStatus('listening');
                    setCurrentMessage('');

                    // If there was a streaming message, replace it; otherwise add new
                    if (currentMessageRef.current) {
                        setMessages((prev) => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;
                            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                                updated[lastIdx] = {role: 'assistant', content: response};
                            } else {
                                updated.push({role: 'assistant', content: response});
                            }
                            return updated;
                        });
                    } else {
                        setMessages((prev) => [...prev, {role: 'assistant', content: response}]);
                    }
                },
                callbackAgentResponseCorrection: (_original: string, corrected: string) => {
                    // AI corrected its response while streaming
                    setCurrentMessage(corrected);
                },
                callbackUserTranscript: (transcript: string) => {
                    // User finished speaking
                    if (transcript.trim()) {
                        setCurrentUserMessage('');
                        setMessages((prev) => [...prev, {role: 'user', content: transcript}]);
                    }
                    setStatus('thinking');
                },
            });

            conversationRef.current = conversation;

            // Listen for all conversation events
            conversation.on('start', () => {
                console.log('[ElevenLabs] Session started');
                setStatus('starting');
            });

            conversation.on('end', () => {
                console.log('[ElevenLabs] Session ended');
                setStatus('idle');
            });

            conversation.on('error', (error: any) => {
                console.error("[ElevenLabs] Conversation error:", error);
                setStatus('idle');
                setLimitError("Connection error. Please try again.");
            });

            conversation.on('session_started', () => {
                console.log('[ElevenLabs] session_started event fired');
            });

            conversation.on('conversation_started', (conversationId: string) => {
                console.log('[ElevenLabs] Conversation started with ID:', conversationId);
                setStatus('listening');
            });

            // Start the conversation
            console.log('[ElevenLabs] Starting session...');
            await conversation.startSession();
            console.log('[ElevenLabs] Session started successfully');
            setStatus('listening');

        } catch (e) {
            console.error("Error starting call", e);
            setStatus('idle');
            setLimitError("An error occurred while starting the call");
        }
    };

    const stop = async () => {
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        try {
            if (conversationRef.current) {
                await conversationRef.current.endSession();
                conversationRef.current = null;
            }

            // Update the session in the database
            if (sessionIdRef.current) {
                await endVoiceSession(sessionIdRef.current, durationRef.current);
            }
        } catch (e) {
            console.error("Error stopping call", e);
        } finally {
            setStatus('idle');
            setDuration(0);
            sessionIdRef.current = null;
            isStoppingRef.current = false;
        }
    };

    const clearErrors = async () => {
        setLimitError(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (conversationRef.current) {
                conversationRef.current.endSession();
            }
        };
    }, []);

    return {
        status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors,
    };
};

export default useLabs;