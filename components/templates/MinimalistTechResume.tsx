import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, WorkExperience, Education } from '../../types';
import { ResumePage } from '../ResumePage';

interface ResumeProps {
  data: ResumeData;
  containerId: string;
}

const PAGE_CONTENT_HEIGHT = 912; // 1056px page height - 48px top padding - 48px bottom padding - 48px extra safety margin

interface PageData {
  isFirstPage: boolean;
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

const SectionHeader: React.FC<{ title: string, isExperience?: boolean }> = ({ title, isExperience = false }) => (
    <h2 className={`text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 ${isExperience ? 'border-b border-slate-200 pb-1' : ''}`}>{title}</h2>
);

export const MinimalistTechResume: React.FC<ResumeProps> = ({ data, containerId }) => {
  const [pages, setPages] = useState<PageData[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!measureRef.current) return;

    // --- Measurement ---
    const headerEl = measureRef.current.querySelector('.measure-header') as HTMLElement;
    const summaryEl = measureRef.current.querySelector('.measure-summary') as HTMLElement;
    const experienceHeaderEl = measureRef.current.querySelector('.measure-experience-header') as HTMLElement;
    const expItemEls = Array.from(measureRef.current.querySelectorAll('.measure-exp-item')) as HTMLElement[];
    const educationHeaderEl = measureRef.current.querySelector('.measure-education-header') as HTMLElement;
    const eduItemEls = Array.from(measureRef.current.querySelectorAll('.measure-edu-item')) as HTMLElement[];
    const skillsHeaderEl = measureRef.current.querySelector('.measure-skills-header') as HTMLElement;
    const skillItemEls = Array.from(measureRef.current.querySelectorAll('.measure-skill-item')) as HTMLElement[];

    // --- Content Blocking ---
    const contentBlocks: { type: string; height: number; data?: any }[] = [];
    if (data.summary) contentBlocks.push({ type: 'summary', height: summaryEl?.offsetHeight || 0, data: data.summary });
    
    if (data.experience.length > 0) {
        contentBlocks.push({ type: 'header_exp', height: experienceHeaderEl?.offsetHeight || 0 });
        data.experience.forEach((exp, i) => contentBlocks.push({ type: 'exp', data: exp, height: expItemEls[i]?.offsetHeight || 0 }));
    }
    if (data.education.length > 0) {
        contentBlocks.push({ type: 'header_edu', height: educationHeaderEl?.offsetHeight || 0 });
        data.education.forEach((edu, i) => contentBlocks.push({ type: 'edu', data: edu, height: eduItemEls[i]?.offsetHeight || 0 }));
    }
    if (data.skills.length > 0) {
        contentBlocks.push({ type: 'header_skills', height: skillsHeaderEl?.offsetHeight || 0 });
        data.skills.forEach((skill, i) => contentBlocks.push({ type: 'skill', data: skill, height: skillItemEls[i]?.offsetHeight || 0 }));
    }

    // --- Pagination ---
    const newPages: PageData[] = [];
    let pageIndex = 0;
    while (contentBlocks.length > 0 || pageIndex === 0) {
        const isFirstPage = pageIndex === 0;
        let currentPage: PageData = { isFirstPage, experience: [], education: [], skills: [] };
        let currentPageHeight = isFirstPage ? (headerEl?.offsetHeight || 0) : 0;

        const processedBlocks: any[] = [];
        for (const block of contentBlocks) {
            if (currentPageHeight + block.height <= PAGE_CONTENT_HEIGHT) {
                currentPageHeight += block.height;
                switch(block.type) {
                    case 'summary': currentPage.summary = block.data; break;
                    case 'exp': currentPage.experience.push(block.data); break;
                    case 'edu': currentPage.education.push(block.data); break;
                    case 'skill': currentPage.skills.push(block.data); break;
                }
                processedBlocks.push(block);
            } else {
                break;
            }
        }
        
        contentBlocks.splice(0, processedBlocks.length);

        if (processedBlocks.length === 0 && contentBlocks.length > 0) {
            const block = contentBlocks.shift()!;
            switch(block.type) {
                case 'exp': currentPage.experience.push(block.data); break;
                case 'edu': currentPage.education.push(block.data); break;
                case 'skill': currentPage.skills.push(block.data); break;
            }
        }

        newPages.push(currentPage);
        pageIndex++;
        if (contentBlocks.length === 0) break;
    }

    setPages(newPages);

  }, [data]);

  const renderPageContent = (pageData: PageData) => (
    <div className="p-12 bg-white text-slate-800 font-sans text-sm leading-relaxed">
      {pageData.isFirstPage && (
          <header className="text-left border-b pb-4 mb-8 border-slate-300">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">{data.personalInfo.name}</h1>
              <p className="text-md text-slate-600 mt-1">{data.personalInfo.title}</p>
              <div className="flex justify-start items-center flex-wrap gap-x-4 mt-3 text-xs text-slate-500">
                  <span>{data.personalInfo.email}</span><span className="hidden sm:inline">&bull;</span>
                  <span>{data.personalInfo.phone}</span><span className="hidden sm:inline">&bull;</span>
                  <span>{data.personalInfo.location}</span>
                  {data.personalInfo.linkedin && <><span className="hidden sm:inline">&bull;</span><span>{data.personalInfo.linkedin}</span></>}
                  {data.personalInfo.portfolio && <><span className="hidden sm:inline">&bull;</span><span>{data.personalInfo.portfolio}</span></>}
              </div>
          </header>
      )}
      {pageData.summary && (
          <section className="mb-8"><SectionHeader title="Summary" /><p>{pageData.summary}</p></section>
      )}
      {pageData.experience.length > 0 && (
          <section className="mb-8">
              <SectionHeader title="Experience" isExperience={true} />
              {pageData.experience.map((job, index) => (
                  <div key={index} className="mb-6">
                      <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-md text-slate-900">{job.title}</h3>
                          <p className="text-xs font-medium text-slate-500 text-right pl-2">{job.dates}</p>
                      </div>
                      <p className="text-sm text-slate-600">{job.company}</p>
                      <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700">
                          {job.description.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
              ))}
          </section>
      )}
      {pageData.education.length > 0 && (
          <section className="mb-8">
              <SectionHeader title="Education" isExperience={true} />
              {pageData.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-baseline mb-6">
                      <div>
                          <h3 className="font-semibold text-md text-slate-900">{edu.institution}</h3>
                          <p className="text-sm text-slate-600">{edu.degree}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 text-right pl-2">{edu.dates}</p>
                  </div>
              ))}
          </section>
      )}
      {pageData.skills.length > 0 && (
          <section>
              <SectionHeader title="Skills" isExperience={true} />
              <div className="flex flex-col gap-y-1 text-slate-700">
                  {pageData.skills.map((skill, index) => {
                      const colonIndex = skill.indexOf(':');
                      if (colonIndex !== -1) {
                          const title = skill.substring(0, colonIndex);
                          const description = skill.substring(colonIndex + 1);
                          return <div key={index}><strong className="font-semibold text-slate-900">{title}:</strong>{description}</div>;
                      }
                      return <span key={index}>{skill}</span>;
                  })}
              </div>
          </section>
      )}
    </div>
  );

  return (
    <>
      <div id={containerId} className="flex flex-col items-center">
        {pages.map((page, index) => (
          <ResumePage key={index}>
            {renderPageContent(page)}
          </ResumePage>
        ))}
      </div>
      
      <div ref={measureRef} className="opacity-0 absolute -z-10" style={{ width: '816px', left: '-9999px', top: 0 }}>
          <div className="p-12 bg-white text-slate-800 font-sans text-sm leading-relaxed">
            <header className="measure-header text-left border-b pb-4 mb-8 border-slate-300">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">{data.personalInfo.name}</h1>
                <p className="text-md text-slate-600 mt-1">{data.personalInfo.title}</p>
                <div className="flex justify-start items-center flex-wrap gap-x-4 mt-3 text-xs text-slate-500">...</div>
            </header>
            <section className="measure-summary mb-8"><SectionHeader title="Summary" /><p>{data.summary}</p></section>
            
            <section className="measure-experience-section mb-8">
                <div className="measure-experience-header"><SectionHeader title="Experience" isExperience={true} /></div>
                {data.experience.map((job, index) => (
                    <div key={index} className="measure-exp-item mb-6">
                        <div className="flex justify-between items-baseline"><h3 className="font-semibold text-md text-slate-900">{job.title}</h3><p className="text-xs font-medium text-slate-500 text-right pl-2">{job.dates}</p></div>
                        <p className="text-sm text-slate-600">{job.company}</p>
                        <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700">{job.description.map(d => <li key={d}>{d}</li>)}</ul>
                    </div>
                ))}
            </section>
            <section className="measure-education-section mb-8">
                <div className="measure-education-header"><SectionHeader title="Education" isExperience={true} /></div>
                {data.education.map((edu, index) => (
                    <div key={index} className="measure-edu-item flex justify-between items-baseline mb-6">
                        <div><h3 className="font-semibold text-md text-slate-900">{edu.institution}</h3><p className="text-sm text-slate-600">{edu.degree}</p></div>
                        <p className="text-xs font-medium text-slate-500 text-right pl-2">{edu.dates}</p>
                    </div>
                ))}
            </section>
            <section className="measure-skills-section">
                <div className="measure-skills-header"><SectionHeader title="Skills" isExperience={true} /></div>
                <div className="flex flex-col gap-y-1 text-slate-700">
                  {data.skills.map((skill, index) => <div key={index} className="measure-skill-item">{skill}</div>)}
                </div>
            </section>
          </div>
      </div>
    </>
  );
};
