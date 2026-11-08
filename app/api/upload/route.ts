import {handleUpload, type HandleUploadBody} from '@vercel/blob/client';
import {NextResponse} from 'next/server';
import {auth} from "@clerk/nextjs/server";
import {MAX_FILE_SIZE} from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.formData()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            token: process.env.BOOKIFIED_READ_WRITE_TOKEN,
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
                const {userId} = await auth();
                if (!userId) throw new Error('Unauthorized: User not authenticated');

                return {
                    allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
                    addRandomSuffix: true,
                    maximumSizeInBytes: MAX_FILE_SIZE,
                    tokenPayload: JSON.stringify({userId})
                };
            },
            onUploadCompleted: async ({blob, tokenPayload}) => {
                console.log('File uploaded to blob: ', blob.url);

                const payload = tokenPayload ? JSON.parse(tokenPayload): null
                const userId = payload?.userId;

            //     TODO: Posthog
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        const status = message.includes("Unauthorized") ? 401 : 500;
        return NextResponse.json(
            {error: message},
            {status},
        );
    }
}
