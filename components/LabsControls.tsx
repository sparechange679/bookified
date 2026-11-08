'use client';

import {Mic, MicOff} from "lucide-react";
import {IBook} from "@/types";
import useLabs, {CallStatus} from "@/hooks/useLabs";
import Transcript from "@/components/Transcript";

const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const getStatusText = (status: CallStatus): string => {
    switch (status) {
        case 'connecting':
            return 'Connecting';
        case 'starting':
            return 'Starting';
        case 'listening':
            return 'Listening';
        case 'thinking':
            return 'Thinking';
        case 'speaking':
            return 'Speaking';
        default:
            return 'Ready';
    }
};

const getStatusDotClass = (status: CallStatus): string => {
    switch (status) {
        case 'connecting':
        case 'starting':
            return 'vapi-status-dot-connecting';
        case 'listening':
            return 'vapi-status-dot-listening';
        case 'thinking':
            return 'vapi-status-dot-thinking';
        case 'speaking':
            return 'vapi-status-dot-speaking';
        default:
            return 'vapi-status-dot-ready';
    }
};

const LabsControls = ({book, coverUrl, persona}: { book: IBook, coverUrl?: string, persona?: string }) => {
    const {status, isActive, messages, currentMessage, currentUserMessage, duration, start, stop, clearErrors,} = useLabs(book);

    const voice = persona || book.persona || 'Default';
    const statusText = getStatusText(status);
    const statusDotClass = getStatusDotClass(status);
    const maxDuration = '15:00';

    return (

        <>
            <div className="vapi-header-card mb-6">
                {/* Left: Cover + Mic Button */}
                <div className="relative shrink-0">
                    <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-30 h-auto rounded shadow-lg object-cover"
                    />
                    {/* Overlapping Mic Button */}
                    <div className="absolute -bottom-3 -right-3">
                        {(status === 'speaking' || status === 'thinking') && (
                            <span className="vapi-mic-btn animate-ping absolute inset-0"></span>
                        )}
                        <button
                            onClick={isActive ? stop : start}
                            disabled={status === 'connecting'}
                            className={`relative vapi-mic-btn ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                        >
                            {isActive ? <Mic size={24} /> : <MicOff size={24} />}
                        </button>
                    </div>
                </div>

                {/* Right: Title, Author, Badges */}
                <div className="flex-1 ml-5">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-(--text-primary)">
                        {book.title}
                    </h1>
                    <p className="text-(--text-secondary) mt-1">
                        by {book.author}
                    </p>

                    {/* Status, Voice, Timer Badges */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="vapi-status-indicator">
                            <span className={`vapi-status-dot ${statusDotClass}`}></span>
                            <span className="vapi-status-text">{statusText}</span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">Voice: <strong>{voice}</strong></span>
                        </div>
                        <div className="vapi-status-indicator">
                            <span className="vapi-status-text">{formatDuration(duration)}/{maxDuration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error display */}
            {clearErrors && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <span className="text-red-700 text-sm">Connection error. Please try again.</span>
                    <button
                        onClick={clearErrors}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="vapi-transcript-wrapper">
                <Transcript
                    messages={messages}
                    currentMessage={currentMessage}
                    currentUserMessage={currentUserMessage}
                />
            </div>
        </>
    )
}
export default LabsControls
