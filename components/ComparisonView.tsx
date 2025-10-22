import React, { useState } from 'react';
import { AtsAnalysis } from '../types';
import { Loader } from './Loader';

interface ComparisonViewProps {
  originalResume: string;
  atsAnalysis: AtsAnalysis | null;
  children: React.ReactNode;
  onReOptimize: (newJobDescription: string) => Promise<void>;
  isReoptimizing: boolean;
  error: string | null;
  jobDescriptionProvided: boolean;
}

interface ReOptimizeProps {
  onReOptimize: (jd: string) => void;
  isReoptimizing: boolean;
  error: string | null;
}

const ReOptimizeSection: React.FC<ReOptimizeProps> = ({ onReOptimize, isReoptimizing, error }) => {
  const [jd, setJd] = useState('');

  return (
    <div className="mt-8 p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Get a Higher Score</h3>
        <p className="mt-2 mb-4 max-w-2xl mx-auto text-slate-600">
          Your score is based on general formatting. For a tailored analysis and keyword optimization, paste a target job description below.
        </p>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <textarea
          rows={8}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
          placeholder="Paste the target job description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          aria-label="Target job description for re-optimization"
        />
        {error && <div className="rounded-md bg-red-50 p-3 text-left">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>}
        <div className="text-center">
          <button
            onClick={() => onReOptimize(jd)}
            disabled={isReoptimizing || !jd}
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isReoptimizing ? (
              <>
                <Loader />
                Re-analyzing...
              </>
            ) : (
              'Optimize for Job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


const ScoreCard: React.FC<{ title: string; score: number }> = ({ title, score }) => (
  <div className="flex flex-col items-center bg-slate-100 p-3 rounded-lg">
    <p className="text-sm font-medium text-slate-600">{title}</p>
    <p className="text-2xl font-bold text-indigo-600">{score}<span className="text-base font-medium text-slate-500">/100</span></p>
  </div>
);

const ImprovementItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-start">
        <svg className="flex-shrink-0 w-5 h-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-slate-700">{text}</span>
    </li>
);

export const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  originalResume, 
  atsAnalysis, 
  children,
  onReOptimize,
  isReoptimizing,
  error,
  jobDescriptionProvided
}) => {
  if (!atsAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 rounded-lg">
        <Loader />
        <p className="mt-4 text-slate-600 font-medium">Analyzing ATS Performance...</p>
      </div>
    );
  }

  const scoreDifference = atsAnalysis.after.score - atsAnalysis.before.score;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Before</h3>
          <div className="bg-white border border-slate-200 rounded-lg p-4 h-[600px] overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-sans text-slate-600">{originalResume}</pre>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">After (Formatted & Optimized)</h3>
          <div className="bg-slate-100 p-4 rounded-lg h-[600px] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-inner border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">ATS Performance Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Before Scores */}
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-3 text-center">Before Analysis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreCard title="Overall Score" score={atsAnalysis.before.score} />
                  <ScoreCard title="Keyword Match" score={atsAnalysis.before.keywordMatch} />
                  <ScoreCard title="Formatting" score={atsAnalysis.before.formattingCompliance} />
                  <ScoreCard title="Clarity" score={atsAnalysis.before.sectionClarity} />
                </div>
              </div>
               {/* After Scores */}
              <div className="p-4 border border-indigo-300 bg-indigo-50 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-3 text-center">After Analysis</h4>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreCard title="Overall Score" score={atsAnalysis.after.score} />
                  <ScoreCard title="Keyword Match" score={atsAnalysis.after.keywordMatch} />
                  <ScoreCard title="Formatting" score={atsAnalysis.after.formattingCompliance} />
                  <ScoreCard title="Clarity" score={atsAnalysis.after.sectionClarity} />
                </div>
              </div>
            </div>
            <div className="text-center bg-green-100 text-green-800 font-bold p-3 rounded-lg text-lg">
              Score Improved by +{scoreDifference} points!
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-3">Key Improvements Made:</h4>
            <ul className="space-y-2 text-sm">
                {atsAnalysis.improvements.map((item, index) => <ImprovementItem key={index} text={item} />)}
            </ul>
          </div>
        </div>
      </div>
      
      {!jobDescriptionProvided && (
        <ReOptimizeSection 
          onReOptimize={onReOptimize}
          isReoptimizing={isReoptimizing}
          error={error}
        />
      )}
    </div>
  );
};