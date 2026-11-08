import {auth} from '@clerk/nextjs/server';
import {redirect} from 'next/navigation';
import {getBookBySlug} from '@/lib/actions/book.actions';
import {ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import LabsControls from "@/components/LabsControls";

export default async function BookDetailPage({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;

    // Require authentication
    const {userId} = await auth();
    if (!userId) {
        redirect('/');
    }

    // Fetch the book by slug
    const result = await getBookBySlug(slug);
    if (!result.success || !result.data) {
        redirect('/');
    }

    const book = result.data;
    const coverUrl = book.cover_url || '';
    const persona = book.persona || 'Default';

    return (
        <div className="book-page-container">
            {/* Floating Back Button */}
            <Link href="/" className="back-btn-floating">
                <ArrowLeft size={20}/>
            </Link>

            <div className="max-w-4xl mx-auto">
                {/* Transcript Area */}
                <LabsControls book={book} coverUrl={coverUrl} persona={persona} />
            </div>
        </div>
    );
}
