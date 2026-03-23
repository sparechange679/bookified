import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="mt-10 w-full">
      <div className="relative bg-[#f3e4c7] rounded-3xl p-8 md:px-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden min-h-[400px]">
        {/* Left Content */}
        <div className="flex-1 z-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[#212a3b]">
            Your Library
          </h1>
          <p className="text-lg text-[#3d485e] max-w-sm leading-snug">
            Convert your books into interactive AI conversations. Listen, learn, and discuss your favorite reads.
          </p>
          <div className="pt-4">
            <Link
              href="/books/new"
              className="inline-flex items-center gap-2 bg-white text-[#212a3b] px-6 py-3 rounded-xl font-bold font-serif hover:bg-white/90 transition-colors shadow-sm"
            >
              <span className="text-2xl font-normal leading-none mb-1">+</span> Add new book
            </Link>
          </div>
        </div>

        {/* Center Illustration */}
        <div className="flex-1 flex justify-center items-center z-10">
          <div className="relative w-full max-w-[480px] aspect-[16/9]">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vintage books and globe illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Steps Card */}
        <div className="w-full md:w-[280px] bg-white rounded-2xl p-7 shadow-soft-md z-10 self-center md:self-auto">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center font-semibold text-sm text-[#212a3b]">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#212a3b]">Upload PDF</h3>
                <p className="text-sm text-[#3d485e]">Add your book file</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center font-semibold text-sm text-[#212a3b]">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#212a3b]">AI Processing</h3>
                <p className="text-sm text-[#3d485e]">We analyze the content</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center font-semibold text-sm text-[#212a3b]">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#212a3b]">Voice Chat</h3>
                <p className="text-sm text-[#3d485e]">Discuss with AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
