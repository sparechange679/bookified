import {handleUpload, type HandleUploadBody} from '@vercel/blob/client';
import {NextResponse} from 'next/server';

export async function POST(request: Request) {
    const body = await request.json() as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
                // Optional: add authentication check here
                // const {userId} = await auth();
                // if (!userId) throw new Error('Not authenticated');

                return {
                    allowedContentTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
                };
            },
            onUploadCompleted: async ({blob, tokenPayload}) => {
                // Optional: log upload completion or update database
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            {error: error instanceof Error ? error.message : 'Upload failed'},
            {status: 400},
        );
    }
}
