'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlertCircle, ImageIcon, Upload, X} from 'lucide-react';
import {Form, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import FileUploadField from '@/components/FileUploadField';
import InputField from '@/components/InputField';
import VoiceSelector from '@/components/VoiceSelector';
import LoadingOverlay from '@/components/LoadingOverlay';
import {ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, DEFAULT_VOICE} from '@/lib/constants';
import {UploadSchema} from '@/lib/zod';
import {parsePDFFile} from '@/lib/utils';
import {BookUploadFormValues} from '@/types';
import {useAuth} from "@clerk/nextjs";
import {toast} from "sonner";
import {checkBookExists, createBook, saveBookSegments, uploadFile} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
// Helper: convert a File/Blob to base64 data URL
function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const UploadForm = () => {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const {userId} = useAuth();
    const router = useRouter();

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            voice: '',
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const {isSubmitting} = form.formState;

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error("Please login to upload books");
        }
        setSubmitError(null);

        // TODO:
        //  Post hog -> Track Book uploads........

        try {
            // Extract text segments, plus a cover from page 1 for the fallback case
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                toast.info("Book with same title already exists.");
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;

            const parsedPDF = await parsePDFFile(pdfFile);

            if (parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file.");
                return;
            }

            // Upload PDF to InsForge storage via server action
            const pdfKey = `${fileTitle}.pdf`;
            const pdfBase64 = await fileToBase64(pdfFile);
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const pdfBase64Data = pdfBase64.split(',')[1];
            const pdfUploadResult = await uploadFile('books', pdfKey, pdfBase64Data, 'application/pdf');

            if (!pdfUploadResult.success) {
                console.error('PDF upload error:', pdfUploadResult.error);
                toast.error("Failed to upload PDF file.");
                return;
            }

            let coverUrl: string;
            let coverKey: string;

            if (data.coverImage) {
                const coverFile = data.coverImage;
                const coverKeyPath = `${fileTitle}_cover.png`;
                const coverBase64 = await fileToBase64(coverFile);
                const coverBase64Data = coverBase64.split(',')[1];
                const coverUploadResult = await uploadFile('covers', coverKeyPath, coverBase64Data, 'image/png');

                if (!coverUploadResult.success) {
                    console.error('Cover upload error:', coverUploadResult.error);
                    toast.error("Failed to upload cover image.");
                    return;
                }

                coverUrl = coverUploadResult.data!.url!;
                coverKey = coverUploadResult.data!.key!;
            } else {
                // parsedPDF.cover is a data URL (data:image/png;base64,...)
                const coverKeyPath = `${fileTitle}_cover.png`;
                const coverBase64Data = parsedPDF.cover.split(',')[1];
                const coverUploadResult = await uploadFile('covers', coverKeyPath, coverBase64Data, 'image/png');

                if (!coverUploadResult.success) {
                    console.error('Cover upload error:', coverUploadResult.error);
                    toast.error("Failed to upload generated cover.");
                    return;
                }

                coverUrl = coverUploadResult.data!.url!;
                coverKey = coverUploadResult.data!.key!;
            }

            const book = await createBook({
                userId,
                title: data.title,
                author: data.author,
                persona: data.voice,
                fileUrl: pdfUploadResult.data!.url!,
                fileKey: pdfUploadResult.data!.key!,
                coverUrl,
                coverKey,
                fileSize: pdfFile.size,
            });

            if (!book.success) throw new Error("Failed to create book");
            if (!book.data) throw new Error("No book data returned");

            if (book.alreadyExists) {
                toast.info("Book with same title already exists");
                form.reset();
                router.push(`/books/${book.data.slug}`);
                return;
            }

            const segments = await saveBookSegments(book.data.id, userId, parsedPDF.content);

            if (!segments.success) {
                toast.error("Failed to save book segments");
                throw new Error("Failed to save book segments");
            }

            form.reset();
            router.push('/');
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'Something went wrong while processing your book. Please try again.',
            );
        }
    };

    return (
        <>
            {isSubmitting && <LoadingOverlay/>}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                    {submitError && (
                        <div className="error-banner" role="alert">
                            <div className="error-banner-content">
                                <AlertCircle className="error-banner-icon"/>
                                <p className="flex-1 text-sm text-red-700">{submitError}</p>
                                <button
                                    type="button"
                                    className="error-banner-dismiss"
                                    onClick={() => setSubmitError(null)}
                                    aria-label="Dismiss error"
                                >
                                    <X className="size-4"/>
                                </button>
                            </div>
                        </div>
                    )}

                    <FileUploadField
                        control={form.control}
                        name="pdfFile"
                        label="Book PDF File"
                        acceptTypes={ACCEPTED_PDF_TYPES}
                        icon={Upload}
                        placeholder="Click to upload PDF"
                        hint="PDF file (max 50MB)"
                        disabled={isSubmitting}
                    />

                    <FileUploadField
                        control={form.control}
                        name="coverImage"
                        label="Cover Image (Optional)"
                        acceptTypes={ACCEPTED_IMAGE_TYPES}
                        icon={ImageIcon}
                        placeholder="Click to upload cover image"
                        hint="Leave empty to auto-generate from PDF"
                        disabled={isSubmitting}
                    />

                    <InputField
                        control={form.control}
                        name="title"
                        label="Title"
                        placeholder="ex: Rich Dad Poor Dad"
                        disabled={isSubmitting}
                    />

                    <InputField
                        control={form.control}
                        name="author"
                        label="Author Name"
                        placeholder="ex: Robert Kiyosaki"
                        disabled={isSubmitting}
                    />

                    <FormField
                        control={form.control}
                        name="voice"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                <VoiceSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isSubmitting}
                                />
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <button type="submit" className="form-btn" disabled={isSubmitting}>
                        Begin Synthesis
                    </button>
                </form>
            </Form>
        </>
    );
};

export default UploadForm;
