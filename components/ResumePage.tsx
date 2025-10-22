import React from 'react';

interface ResumePageProps {
  children: React.ReactNode;
}

// US Letter dimensions in pixels at 96 DPI: 8.5" x 11" -> 816px x 1056px
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

export const ResumePage: React.FC<ResumePageProps> = ({ children }) => {
  return (
    <div
      className="resume-page bg-white shadow-lg overflow-hidden relative"
      style={{
        width: `${PAGE_WIDTH}px`,
        height: `${PAGE_HEIGHT}px`,
        // Adding a small margin between pages for the preview
        marginBottom: '16px', 
      }}
    >
      <div className="page-content h-full">
        {children}
      </div>
    </div>
  );
};
