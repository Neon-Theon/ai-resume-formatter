import React, { useState, useCallback } from 'react';
import {
  ResumeData,
  AtsAnalysis,
  ResumeStyle,
  AppView,
  PageSize,
} from './types';
import { generateResumeJson, analyzeAtsScore } from './services/geminiService';
import { exportToPdf } from './services/pdfExportService';
import { UploadView } from './components/UploadView';
import { ResultsView } from './components/ResultsView';

const App: React.FC = () => {
  const [rawResumeText, setRawResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [generatedResumeData, setGeneratedResumeData] = useState<ResumeData | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<AtsAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReoptimizing, setIsReoptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);

  const handleFormat = useCallback(async () => {
    if (!rawResumeText) {
      setError('Please provide your résumé content.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAtsAnalysis(null);
    setGeneratedResumeData(null);

    try {
      // First, generate the structured resume. The service will handle whether to optimize text.
      const resumeData = await generateResumeJson(rawResumeText, jobDescription);
      setGeneratedResumeData(resumeData);

      // Always run ATS analysis. The service will handle general vs. specific analysis.
      const analysis = await analyzeAtsScore(rawResumeText, resumeData, jobDescription);
      setAtsAnalysis(analysis);
      
      setCurrentView(AppView.RESULTS);
    } catch (e) {
      console.error(e);
      setError('An error occurred while formatting your résumé. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [rawResumeText, jobDescription]);

  const handleReOptimize = useCallback(async (newJobDescription: string) => {
    if (!rawResumeText || !newJobDescription) return;

    setIsReoptimizing(true);
    setError(null);
    setJobDescription(newJobDescription); // Update job description state

    try {
      // Re-generate with optimization
      const optimizedResumeData = await generateResumeJson(rawResumeText, newJobDescription);
      setGeneratedResumeData(optimizedResumeData); // Update with optimized version

      // Now, run the analysis
      const analysis = await analyzeAtsScore(rawResumeText, optimizedResumeData, newJobDescription);
      setAtsAnalysis(analysis);

    } catch (e) {
      console.error(e);
      setError('An error occurred while analyzing your résumé. Please try again.');
    } finally {
      setIsReoptimizing(false);
    }
  }, [rawResumeText]);


  const handleReset = () => {
    setRawResumeText('');
    setJobDescription('');
    setGeneratedResumeData(null);
    setAtsAnalysis(null);
    setIsLoading(false);
    setError(null);
    setCurrentView(AppView.UPLOAD);
  };

  const handleDownloadPdf = (style: ResumeStyle, size: PageSize) => {
    exportToPdf(
      `resume-container-${style.toLowerCase().replace(' ', '-')}`, 
      `${generatedResumeData?.personalInfo.name || 'resume'}-formatted.pdf`,
      size
    );
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900">AI Resume Formatter</h1>
          </div>
          {currentView !== AppView.UPLOAD && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === AppView.UPLOAD && (
          <UploadView
            rawResumeText={rawResumeText}
            setRawResumeText={setRawResumeText}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            handleFormat={handleFormat}
            isLoading={isLoading}
            error={error}
          />
        )}
        {currentView === AppView.RESULTS && generatedResumeData && (
          <ResultsView
            originalResume={rawResumeText}
            resumeData={generatedResumeData}
            atsAnalysis={atsAnalysis}
            onDownloadPdf={handleDownloadPdf}
            onReOptimize={handleReOptimize}
            isReoptimizing={isReoptimizing}
            error={error}
            jobDescriptionProvided={!!jobDescription}
          />
        )}
      </main>
    </div>
  );
};

export default App;