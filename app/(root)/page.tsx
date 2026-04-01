import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import {sampleBooks} from "@/lib/constants";

const Page = () => {
    return (
        <main className="container wrapper">
            <Hero/>

            <div className="library-books-grid mt-10 md:mt-16">
                {sampleBooks.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}/>
                ))}
            </div>
        </main>
    )
}
export default Page
