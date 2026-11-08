"use server"

import {getAdminClient} from "@/lib/insforge";
import {getCurrentBillingPeriodStart} from "@/lib/subscription-constants";

export interface StartSessionResult {
    success: boolean;
    sessionId?: string;
    error?: string;
}

export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        const insforge = getAdminClient();

        const {data, error} = await insforge.database
            .from('voice_sessions')
            .insert([{
                user_id: clerkId,
                book_id: bookId,
                started_at: new Date().toISOString(),
                ended_at: null,
                duration_seconds: 0,
                billing_period_start: getCurrentBillingPeriodStart().toISOString(),
            }])
            .select()
            .single();

        if (error) {
            console.error("Error starting voice session", error);
            return {
                success: false,
                error: 'Failed to start voice session. Please try again later.'
            }
        }

        return {
            success: true,
            sessionId: (data as any).id,
        }
    } catch (e) {
        console.error("Error starting voice session", e);
        return {
            success: false,
            error: 'Failed to start voice session. Please try again later.'
        }
    }
}

export const endVoiceSession = async (sessionId: string, durationSeconds: number): Promise<{ success: boolean }> => {
    try {
        const insforge = getAdminClient();

        const {error} = await insforge.database
            .from('voice_sessions')
            .update({
                ended_at: new Date().toISOString(),
                duration_seconds: durationSeconds,
            })
            .eq('id', sessionId);

        if (error) {
            console.error("Error ending voice session", error);
            return { success: false };
        }

        return { success: true };
    } catch (e) {
        console.error("Error ending voice session", e);
        return { success: false };
    }
}

