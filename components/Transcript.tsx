'use client';

import {Messages} from '@/types';
import {MicOff} from 'lucide-react';
import { useEffect, useRef } from 'react';

interface TranscriptProps {
    messages: Messages[];
    currentMessage?: string;
    currentUserMessage?: string;
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const hasMessages = messages.length > 0 || !!currentMessage || !!currentUserMessage;

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentMessage, currentUserMessage]);

    if (!hasMessages) {
        return (
            <div className="transcript-container">
                <div className="transcript-empty">
                    <MicOff size={48} className="text-[var(--text-muted)] mb-3" />
                    <p className="transcript-empty-text">No conversation yet</p>
                    <p className="transcript-empty-hint">
                        Click the mic button above to start talking
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="transcript-container">
            <div className="transcript-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`transcript-message transcript-message-${msg.role === 'user' ? 'user' : 'assistant'}`}
                    >
                        <div
                            className={`transcript-bubble transcript-bubble-${msg.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Streaming user message */}
                {currentUserMessage && (
                    <div className="transcript-message transcript-message-user">
                        <div className="transcript-bubble transcript-bubble-user">
                            {currentUserMessage}
                            <span className="transcript-cursor"></span>
                        </div>
                    </div>
                )}

                {/* Streaming assistant message */}
                {currentMessage && (
                    <div className="transcript-message transcript-message-assistant">
                        <div className="transcript-bubble transcript-bubble-assistant">
                            {currentMessage}
                            <span className="transcript-cursor"></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default Transcript;
