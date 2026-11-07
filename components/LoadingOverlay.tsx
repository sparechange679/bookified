import { Loader2 } from 'lucide-react';

const steps = [
  'Uploading your files',
  'Reading and splitting the text',
  'Preparing your voice assistant',
];

const LoadingOverlay = () => {
  return (
    <div className="loading-wrapper" role="status" aria-live="polite">
      <div className="loading-shadow-wrapper bg-[var(--bg-primary)] shadow-soft-lg">
        <div className="loading-shadow">
          <Loader2 className="loading-animation size-12 text-[#663820]" />
          <h2 className="loading-title font-serif">Synthesizing your book</h2>

          <ul className="loading-progress">
            {steps.map((step) => (
              <li key={step} className="loading-progress-item">
                <span className="loading-progress-status" />
                <span className="text-[var(--text-secondary)]">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
