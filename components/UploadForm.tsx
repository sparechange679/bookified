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
import {checkBookExists, createBook, saveBookSegments} from "@/lib/actions/book.actions";
import {useRouter} from "next/navigation";
import {upload} from "@vercel/blob/client";

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

            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'application/pdf'
            });

            let coverUrl: string;

            if (data.coverImage) {
                const coverFile = data.coverImage;

                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: coverFile.type,
                });

                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPDF.cover);

                const blob = await response.blob();

                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: 'public',
                    handleUploadUrl: '/api/upload',
                    contentType: 'image/png',
                });
                coverUrl = uploadedCoverBlob.url;
            }

            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.voice,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });

            if (!book.success) throw new Error("Failed to create book");

            if (book.alreadyExists) {
                toast.info("Book with same title already exists");
                form.reset();
                router.push(`/books/${existsCheck.book.slug}`);
                return;
            }

            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);

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
