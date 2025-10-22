import React, { useState } from 'react';
import { ResumeData, AtsAnalysis, ResumeStyle, PageSize } from '../types';
import { MinimalistTechResume } from './templates/MinimalistTechResume';
import { ExecutiveEleganceResume } from './templates/ExecutiveEleganceResume';
import { CreativePortfolioResume } from './templates/CreativePortfolioResume';
import { ModernHybridResume } from './templates/ModernHybridResume';
import { ComparisonView } from './ComparisonView';

interface ResultsViewProps {
  originalResume: string;
  resumeData: ResumeData;
  atsAnalysis: AtsAnalysis | null;
  onDownloadPdf: (style: ResumeStyle, size: PageSize) => void;
  onReOptimize: (newJobDescription: string) => Promise<void>;
  isReoptimizing: boolean;
  error: string | null;
  jobDescriptionProvided: boolean;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  originalResume,
  resumeData,
  atsAnalysis,
  onDownloadPdf,
  onReOptimize,
  isReoptimizing,
  error,
  jobDescriptionProvided,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<ResumeStyle>(ResumeStyle.ModernHybrid);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<PageSize>(PageSize.Letter);

  const renderResume = (style: ResumeStyle) => {
    const containerId = `resume-container-${style.toLowerCase().replace(' ', '-')}`;
    const resumeProps = { data: resumeData, containerId };

    const ResumeComponent = {
      [ResumeStyle.MinimalistTech]: MinimalistTechResume,
      [ResumeStyle.ExecutiveElegance]: ExecutiveEleganceResume,
      [ResumeStyle.CreativePortfolio]: CreativePortfolioResume,
      [ResumeStyle.ModernHybrid]: ModernHybridResume,
    }[style];

    return ResumeComponent ? <ResumeComponent {...resumeProps} /> : null;
  };

  const styleOptions = Object.values(ResumeStyle);

  const resumePreview = (
     <div className="w-full mx-auto pb-8">
        <div className="shadow-lg border bg-white">
          {renderResume(selectedStyle)}
        </div>
      </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Formatted Résumé</h2>
        <p className="mt-4 text-lg text-slate-600">
          Preview the AI-powered designs below. Choose your favorite style and see the ATS analysis.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowComparison(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${!showComparison ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              Design Previews
            </button>
            <button 
              onClick={() => setShowComparison(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${showComparison ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              Before & After Analysis
            </button>
          </div>
          {!showComparison && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="page-size" className="text-sm font-medium text-slate-600">Page Size:</label>
                <div id="page-size" className="isolate inline-flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPageSize(PageSize.Letter)}
                    className={`relative inline-flex items-center rounded-l-md px-3 py-1 text-sm font-semibold ${pageSize === PageSize.Letter ? 'bg-indigo-600 text-white z-10 focus:z-10' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}
                  >
                    US Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize(PageSize.A4)}
                    className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-1 text-sm font-semibold ${pageSize === PageSize.A4 ? 'bg-indigo-600 text-white z-10 focus:z-10' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'}`}
                  >
                    A4
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => onDownloadPdf(selectedStyle, pageSize)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" /><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /></svg>
                Download as PDF
              </button>
            </div>
          )}
        </div>

        {showComparison ? (
          <ComparisonView 
            originalResume={originalResume} 
            atsAnalysis={atsAnalysis}
            onReOptimize={onReOptimize}
            isReoptimizing={isReoptimizing}
            error={error}
            jobDescriptionProvided={jobDescriptionProvided}
          >
             <div className="bg-slate-100 rounded-lg">
                {resumePreview}
             </div>
          </ComparisonView>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex flex-wrap justify-center gap-2">
                {styleOptions.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-2 text-sm font-medium rounded-full ${selectedStyle === style ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-100 ring-1 ring-inset ring-slate-300'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-8 bg-slate-100 rounded-lg">
                {resumePreview}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};