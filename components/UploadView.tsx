import React from 'react';
import { Loader } from './Loader';

interface UploadViewProps {
  rawResumeText: string;
  setRawResumeText: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  handleFormat: () => void;
  isLoading: boolean;
  error: string | null;
}

export const UploadView: React.FC<UploadViewProps> = ({
  rawResumeText,
  setRawResumeText,
  jobDescription,
  setJobDescription,
  handleFormat,
  isLoading,
  error,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // For this demo, we are asking user to paste text.
      // A real app would use a library like pdf.js to extract text here.
      alert('PDF parsing is simulated. Please paste your résumé content into the text area below.');
    } else if (file) {
      alert('Please upload a valid PDF file.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Format Your Résumé in Seconds
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Paste your résumé content and a target job description. Our AI will analyze, reformat, and redesign it for the modern job market.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label htmlFor="resume-text" className="block text-sm font-medium text-slate-700 mb-2">
            1. Paste Your Current Résumé Content
          </label>
           <div className="mt-1">
             <textarea
               id="resume-text"
               name="resume-text"
               rows={15}
               className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
               placeholder="Paste your full résumé text here..."
               value={rawResumeText}
               onChange={(e) => setRawResumeText(e.target.value)}
             />
           </div>
           <p className="mt-2 text-xs text-slate-500">
             For best results, include all sections like summary, experience, education, and skills.
           </p>
        </div>

        <div>
           <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 mb-2">
             2. Paste the Target Job Description (Optional)
           </label>
           <div className="mt-1">
             <textarea
               id="job-description"
               name="job-description"
               rows={8}
               className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
               placeholder="Pasting a job description helps the AI tailor keywords and optimize your content for a specific role."
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
             />
           </div>
           <p className="mt-2 text-xs text-slate-500">
             Leave this blank if you only want to reformat your résumé without changing the content.
           </p>
        </div>

        {error && <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>}

        <div className="text-center">
          <button
            onClick={handleFormat}
            disabled={isLoading || !rawResumeText}
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader />
                Formatting...
              </>
            ) : (
              'Format My Résumé'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};