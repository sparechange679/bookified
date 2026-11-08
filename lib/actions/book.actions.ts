'use server';

import {CreateBook, IBook, TextSegment} from "@/types";
import {getAdminClient} from "@/lib/insforge";
import {generateSlug} from "@/lib/utils";

export const getAllBooks = async () => {
    try {
        const insforge = getAdminClient();

        const {data, error} = await insforge.database
            .from('books')
            .select('*')
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching all books:', error.message);
            return {success: false, error};
        }

        return {
            success: true,
            data: (data || []) as IBook[],
        }
    } catch (e) {
        console.error('Error fetching all books:', e);
        return {success: false, error: e};
    }
}

export const getBookBySlug = async (slug: string) => {
    try {
        const insforge = getAdminClient();

        const {data, error} = await insforge.database
            .from('books')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching book by slug "${slug}":`, error.message);
            return {success: false, error};
        }

        return {
            success: true,
            data: data as IBook,
        }
    } catch (e) {
        console.error(`Error fetching book by slug "${slug}":`, e);
        return {success: false, error: e};
    }
}

export const checkBookExists = async (title: string) => {
    try {
        const insforge = getAdminClient();
        const slug = generateSlug(title);

        const {data, error} = await insforge.database
            .from('books')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            console.error(`Error checking book exists: ${error.message}`);
            return {exists: false, error};
        }

        if (data) {
            return {exists: true, book: data as IBook};
        }

        return {exists: false};
    } catch (e) {
        console.error(`Error checking book exists ${e}`);
        return {exists: false, error: e};
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        const insforge = getAdminClient();
        const slug = generateSlug(data.title);

        // Check if book with same slug already exists
        const {data: existingBook, error: checkError} = await insforge.database
            .from('books')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking existing book:', checkError.message);
            return {success: false, error: checkError};
        }

        if (existingBook) {
            return {
                success: true,
                data: existingBook as IBook,
                alreadyExists: true,
            }
        }

        // Create new book
        const bookData = {
            user_id: data.userId,
            title: data.title,
            slug,
            author: data.author,
            persona: data.persona,
            file_url: data.fileUrl,
            file_key: data.fileKey,
            cover_url: data.coverUrl,
            cover_key: data.coverKey || '',
            file_size: data.fileSize,
            total_segments: 0,
        };

        const {data: book, error} = await insforge.database
            .from('books')
            .insert([bookData])
            .select()
            .single();

        if (error) {
            console.error('Error creating a book', error);
            return {success: false, error};
        }

        return {
            success: true,
            data: book as IBook,
        }
    } catch (e) {
        console.error('Error creating a book', e);
        return {success: false, error: e};
    }
}

// Upload a file to InsForge storage using the admin client
// Accepts a Base64-encoded string from the client
export const uploadFile = async (bucket: string, key: string, base64Data: string, contentType: string) => {
    try {
        const insforge = getAdminClient();

        // Convert base64 to Buffer
        const buffer = Buffer.from(base64Data, 'base64');
        const file = new File([buffer], key, { type: contentType });

        const { data, error } = await insforge.storage
            .from(bucket)
            .upload(key, file);

        if (error) {
            console.error(`Upload error (${bucket}/${key}):`, error);
            return { success: false, error };
        }

        return {
            success: true,
            data: {
                url: data?.url,
                key: data?.key,
            }
        };
    } catch (e) {
        console.error(`Upload error (${bucket}/${key}):`, e);
        return { success: false, error: e };
    }
}

export const saveBookSegments = async (bookId: string, userId: string, segments: TextSegment[]) => {
    try {
        const insforge = getAdminClient();

        console.log('Saving book segments...');

        const segmentsToInsert = segments.map(({text, segmentIndex, pageNumber, wordCount}) => ({
            user_id: userId,
            book_id: bookId,
            content: text,
            segment_index: segmentIndex,
            page_number: pageNumber,
            word_count: wordCount,
        }));

        const {error: insertError} = await insforge.database
            .from('book_segments')
            .insert(segmentsToInsert);

        if (insertError) {
            throw insertError;
        }

        // Update book total segments
        const {error: updateError} = await insforge.database
            .from('books')
            .update({total_segments: segments.length})
            .eq('id', bookId);

        if (updateError) {
            throw updateError;
        }

        console.log("Book segments saved successfully.");

        return {
            success: true,
            data: {
                segmentsCreated: segments.length
            }
        }
    } catch (e) {
        console.error('Error saving book segments', e);

        // Rollback: delete segments and book on failure
        const insforge = getAdminClient();
        await insforge.database.from('book_segments').delete().eq('book_id', bookId);
        await insforge.database.from('books').delete().eq('id', bookId);

        console.log('Deleted book segments and book due to failure to save segments.');

        return {
            success: false,
            error: e,
        }
    }
}


