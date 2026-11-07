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

const UploadForm = () => {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            voice: DEFAULT_VOICE,
        },
    });

    const {isSubmitting} = form.formState;

    const onSubmit = async (values: BookUploadFormValues) => {
        setSubmitError(null);

        try {
            // Extract text segments, plus a cover from page 1 for the fallback case
            const {content, cover} = await parsePDFFile(values.pdfFile);

            // TODO: persist the book.
            //  1. Upload values.pdfFile and (values.coverImage ?? cover data URL) to storage
            //  2. Call a server action / API route with title, author, voice (persona),
            //     file URLs and `content` (the text segments)
            //  3. router.push(`/books/${slug}`) on success
            console.log({...values, segments: content.length, hasGeneratedCover: !values.coverImage && !!cover});
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
