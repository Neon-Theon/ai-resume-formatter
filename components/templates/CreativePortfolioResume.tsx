import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, WorkExperience } from '../../types';
import { ResumePage } from '../ResumePage';

interface ResumeProps {
  data: ResumeData;
  containerId: string;
}

const PAGE_CONTENT_HEIGHT = 960; // 1056px page height - 48px top padding - 48px bottom padding

interface MainPageData {
  summary?: string;
  experience: WorkExperience[];
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-2xl font-bold text-slate-800 border-b-4 border-indigo-500 pb-2 mb-4">{title}</h2>
);

export const CreativePortfolioResume: React.FC<ResumeProps> = ({ data, containerId }) => {
  const [mainPages, setMainPages] = useState<MainPageData[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!measureRef.current) return;

    // --- Measurement ---
    const summaryEl = measureRef.current.querySelector('.measure-summary-section') as HTMLElement;
    const experienceHeaderEl = measureRef.current.querySelector('.measure-experience-header') as HTMLElement;
    const expItemEls = Array.from(measureRef.current.querySelectorAll('.measure-exp-item')) as HTMLElement[];

    // --- Content Blocking ---
    const contentBlocks: { type: string; height: number; data?: any }[] = [];
    if (data.summary) contentBlocks.push({ type: 'summary', height: summaryEl?.offsetHeight || 0, data: data.summary });
    
    if (data.experience.length > 0) {
        contentBlocks.push({ type: 'header_exp', height: experienceHeaderEl?.offsetHeight || 0 });
        data.experience.forEach((exp, i) => contentBlocks.push({ type: 'exp', data: exp, height: expItemEls[i]?.offsetHeight || 0 }));
    }

    // --- Pagination ---
    const newPages: MainPageData[] = [];
    let pageIndex = 0;
    while (contentBlocks.length > 0 || pageIndex === 0) {
        let currentPage: MainPageData = { experience: [] };
        let currentPageHeight = 0;

        const processedBlocks: any[] = [];
        for (const block of contentBlocks) {
            if (currentPageHeight + block.height <= PAGE_CONTENT_HEIGHT) {
                currentPageHeight += block.height;
                if (block.type === 'summary') currentPage.summary = block.data;
                if (block.type === 'exp') currentPage.experience.push(block.data);
                processedBlocks.push(block);
            } else {
                break;
            }
        }
        
        contentBlocks.splice(0, processedBlocks.length);

        if (processedBlocks.length === 0 && contentBlocks.length > 0) {
            const block = contentBlocks.shift()!;
            if (block.type === 'exp') currentPage.experience.push(block.data);
        }

        newPages.push(currentPage);
        pageIndex++;
        if (contentBlocks.length === 0) break;
    }

    setMainPages(newPages);

  }, [data]);

  const renderSidebar = () => (
    <div className="w-[30%] bg-slate-800 text-white py-12 pl-12 pr-6 flex flex-col">
        <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-white">{data.personalInfo.name}</h1>
            <p className="text-md text-indigo-300 mt-1">{data.personalInfo.title}</p>
        </div>
        <div className="space-y-6">
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">Contact</h2>
                <div className="space-y-1 text-xs break-words">
                    <p>{data.personalInfo.phone}</p>
                    <p>{data.personalInfo.email}</p>
                    {data.personalInfo.linkedin && <p>{data.personalInfo.linkedin}</p>}
                    <p>{data.personalInfo.location}</p>
                    {data.personalInfo.portfolio && <p>{data.personalInfo.portfolio}</p>}
                </div>
            </div>
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">Education</h2>
                {data.education.map((edu, index) => (
                    <div key={index} className="text-xs mb-2">
                        <h3 className="font-semibold">{edu.institution}</h3><p>{edu.degree}</p><p className="opacity-70">{edu.dates}</p>
                    </div>
                ))}
            </div>
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-2">Skills</h2>
                <div className="space-y-2 text-xs">
                    {data.skills.map((skill, index) => {
                        const [title, ...description] = skill.split(':');
                        if (description.length > 0) {
                            return <div key={index}><strong className="font-semibold text-white">{title}:</strong><span className="opacity-80">{description.join(':')}</span></div>;
                        }
                        return <div key={index}>{skill}</div>;
                    })}
                </div>
            </div>
        </div>
    </div>
  );

  const renderMainContent = (pageData: MainPageData) => (
    <div className="w-[70%] text-slate-800 py-12 pr-12 pl-6">
      {pageData.summary && (
        <section className="mb-8">
          <SectionHeader title="Profile" />
          <p className="leading-relaxed">{pageData.summary}</p>
        </section>
      )}
      {pageData.experience.length > 0 && (
        <section>
          <SectionHeader title="Work Experience" />
          {pageData.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-xs font-medium text-slate-500 pl-2 text-right">{job.dates}</p>
              </div>
              <p className="text-md font-medium text-indigo-600">{job.company}</p>
              <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700 text-sm">
                {job.description.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );

  return (
    <>
      <div id={containerId} className="flex flex-col items-center">
        {mainPages.map((page, index) => (
          <ResumePage key={index}>
             <div className="bg-white font-sans text-sm flex h-full">
                {renderSidebar()}
                {renderMainContent(page)}
             </div>
          </ResumePage>
        ))}
      </div>
      
      <div ref={measureRef} className="opacity-0 absolute -z-10" style={{ width: '816px', left: '-9999px', top: 0 }}>
          <div className="w-[calc(0.7*816px)] py-12 pr-12 pl-6">
            <section className="measure-summary-section mb-8">
              <SectionHeader title="Profile" />
              <p className="leading-relaxed">{data.summary}</p>
            </section>
            <section>
              <div className="measure-experience-header"><SectionHeader title="Work Experience" /></div>
              {data.experience.map((job, index) => (
                <div key={index} className="measure-exp-item mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-xs font-medium text-slate-500 pl-2 text-right">{job.dates}</p>
                  </div>
                  <p className="text-md font-medium text-indigo-600">{job.company}</p>
                  <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700 text-sm">
                    {job.description.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </section>
          </div>
      </div>
    </>
  );
};
