import UploadForm from '@/components/UploadForm';

const NewBookPage = () => {
  return (
    <main className="container wrapper">
      <div className="new-book-wrapper">
        <header className="space-y-3 text-center">
          <h1 className="page-title-xl">Add a new book</h1>
          <p className="subtitle">
            Upload a PDF and choose a voice. We&rsquo;ll turn it into a book you can talk to.
          </p>
        </header>

        <UploadForm />
      </div>
    </main>
  );
};

export default NewBookPage;
