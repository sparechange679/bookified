import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.actions";

const Page = async () => {
    const {data: books} = await getAllBooks();

    return (
        <main className="container wrapper">
            <Hero/>

            <div className="library-books-grid mt-10 md:mt-16">
                {books?.map((book) => (
                    <BookCard key={book.id} title={book.title} author={book.author} coverURL={book.cover_url || ''} slug={book.slug}/>
                ))}
            </div>
        </main>
    )
}
export default Page
