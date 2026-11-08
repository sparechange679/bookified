import {ReactNode} from 'react';
import {Control, FieldPath, FieldValues} from 'react-hook-form';
import {LucideIcon} from 'lucide-react';
import z from 'zod';
import {UploadSchema} from '@/lib/zod';

// ============================================
// DATABASE MODELS (InsForge schema)
// ============================================

export interface IBook {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    author: string;
    persona?: string | null;
    file_url: string;
    file_key: string;
    cover_url?: string | null;
    cover_key: string;
    file_size: number;
    total_segments: number;
    created_at: string;
    updated_at: string;
}

export interface IBookSegment {
    id: string;
    user_id: string;
    book_id: string;
    content: string;
    segment_index: number;
    page_number?: number | null;
    word_count: number;
    created_at: string;
    updated_at: string;
}

export interface IVoiceSession {
    id: string;
    user_id: string;
    book_id: string;
    started_at: string;
    ended_at?: string | null;
    duration_seconds: number;
    billing_period_start: string;
    created_at: string;
    updated_at: string;
}

// ============================================
// FORM & INPUT TYPES
// ============================================

export type BookUploadFormValues = z.infer<typeof UploadSchema>;

export interface CreateBook {
    userId: string;
    title: string;
    author: string;
    persona?: string;
    fileUrl: string;
    fileKey: string;
    coverUrl?: string;
    coverKey?: string;
    fileSize: number;
}

export interface TextSegment {
    text: string;
    segmentIndex: number;
    pageNumber?: number;
    wordCount: number;
}

export interface BookCardProps {
    title: string;
    author: string;
    coverURL: string;
    slug: string;
}

export interface Messages {
    role: string;
    content: string;
}

export interface ShadowBoxProps {
    children: ReactNode;
    className?: string;
}

export interface VoiceSelectorProps {
    disabled?: boolean;
    className?: string;
    value?: string;
    onChange: (voiceId: string) => void;
}

export interface InputFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    placeholder?: string;
    disabled?: boolean;
}

export interface FileUploadFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    acceptTypes: string[];
    disabled?: boolean;
    icon: LucideIcon;
    placeholder: string;
    hint: string;
}