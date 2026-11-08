import {z} from 'zod';
import {
    ACCEPTED_IMAGE_TYPES,
    ACCEPTED_PDF_TYPES,
    MAX_FILE_SIZE,
    MAX_IMAGE_SIZE,
} from './constants';

// `File` only exists in the browser, so guard for SSR
const isFile = (value: unknown): value is File =>
    typeof File !== 'undefined' && value instanceof File;

export const UploadSchema = z.object({
    pdfFile: z
        .custom<File>(isFile, {message: 'Please upload a PDF file'})
        .refine(
            (file) => isFile(file) && ACCEPTED_PDF_TYPES.includes(file.type),
            'Only PDF files are accepted',
        )
        .refine(
            (file) => isFile(file) && file.size <= MAX_FILE_SIZE,
            'PDF must be 50MB or smaller',
        ),

    // Optional: when empty, the cover is generated from the first PDF page
    coverImage: z
        .custom<File>(isFile, {message: 'Invalid image file'})
        .refine(
            (file) => isFile(file) && ACCEPTED_IMAGE_TYPES.includes(file.type),
            'Cover must be a JPG, JPEG, PNG or WebP image',
        )
        .refine(
            (file) => isFile(file) && file.size <= MAX_IMAGE_SIZE,
            'Cover image must be 10MB or smaller',
        )
        .optional(),

    title: z
        .string()
        .trim()
        .min(1, 'Title is required')
        .max(120, 'Title must be 120 characters or fewer'),

    author: z
        .string()
        .trim()
        .min(1, 'Author name is required')
        .max(120, 'Author name must be 120 characters or fewer'),

    voice: z.string().min(1, 'Choose an assistant voice'),
});
