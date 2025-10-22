import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, WorkExperience, Education } from '../../types';
import { ResumePage } from '../ResumePage';

interface ResumeProps {
  data: ResumeData;
  containerId: string;
}

const PAGE_CONTENT_HEIGHT = 950; // 1056px page height - 48px top/bottom padding. Increased from 936 to ensure the last skill fits on page 2.

interface PageData {
  isFirstPage: boolean;
  experience: WorkExperience[];
  skills: string[];
  education: Education[];
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-lg font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-200 pb-1 mb-3">{title}</h2>
);

export const ModernHybridResume: React.FC<ResumeProps> = ({ data, containerId }) => {
  const [pages, setPages] = useState<PageData[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!measureRef.current) return;
    
    // --- Measurement ---
    const headerEl = measureRef.current.querySelector('.measure-header') as HTMLElement;
    const summarySectionEl = measureRef.current.querySelector('.measure-summary-section') as HTMLElement;
    const expHeaderEl = measureRef.current.querySelector('.measure-experience-header') as HTMLElement;
    const expItemEls = Array.from(measureRef.current.querySelectorAll('.measure-exp-item')) as HTMLElement[];
    const skillsHeaderEl = measureRef.current.querySelector('.measure-skills-header') as HTMLElement;
    const skillItemEls = Array.from(measureRef.current.querySelectorAll('.measure-skill-item')) as HTMLElement[];
    const eduHeaderEl = measureRef.current.querySelector('.measure-education-header') as HTMLElement;
    const eduItemEls = Array.from(measureRef.current.querySelectorAll('.measure-edu-item')) as HTMLElement[];

    // --- Content Blocking ---
    let leftBlocks: { type: string; data: any; height: number }[] = [];
    if (data.experience.length > 0) {
      leftBlocks.push(...data.experience.map((exp, i) => ({ type: 'exp', data: exp, height: expItemEls[i]?.offsetHeight || 0 })));
    }
    if (data.education.length > 0) {
       leftBlocks.push({ type: 'header_edu', data: 'Education', height: eduHeaderEl?.offsetHeight || 0});
       leftBlocks.push(...data.education.map((edu, i) => ({ type: 'edu', data: edu, height: eduItemEls[i]?.offsetHeight || 0 })));
    }
    
    let rightBlocks = data.skills.map((skill, i) => ({ type: 'skill', data: skill, height: skillItemEls[i]?.offsetHeight || 0 }));


    // --- Pagination ---
    const allPages: PageData[] = [];
    let pageIndex = 0;
    while (leftBlocks.length > 0 || rightBlocks.length > 0 || pageIndex === 0) {
      const isFirstPage = pageIndex === 0;
      
      const availableHeight = isFirstPage
        ? PAGE_CONTENT_HEIGHT - (headerEl?.offsetHeight || 0) - (summarySectionEl?.offsetHeight || 0)
        : PAGE_CONTENT_HEIGHT;
      
      let currentPage: PageData = {
        isFirstPage,
        experience: [],
        skills: [],
        education: []
      };

      let currentLeftH = 0;
      let currentRightH = 0;
      
      const needsExpHeader = leftBlocks.some(b => b.type === 'exp') && (currentPage.experience.length === 0);
      const needsSkillsHeader = rightBlocks.length > 0 && (currentPage.skills.length === 0);
      
      if(needsExpHeader) currentLeftH += expHeaderEl?.offsetHeight || 0;
      if(needsSkillsHeader) currentRightH += skillsHeaderEl?.offsetHeight || 0;

      // Process right column first
      const tempRightBlocks = [...rightBlocks];
      for (const block of tempRightBlocks) {
        if (currentRightH + block.height <= availableHeight) {
          currentRightH += block.height;
          currentPage.skills.push(block.data);
          rightBlocks.shift();
        } else {
          break;
        }
      }
      
      // Process left column
      const tempLeftBlocks = [...leftBlocks];
      for (const block of tempLeftBlocks) {
         if (currentLeftH + block.height <= availableHeight) {
             currentLeftH += block.height;
             if (block.type === 'exp') currentPage.experience.push(block.data);
             if (block.type === 'edu') currentPage.education.push(block.data);
             // ignore headers, they are just for height
             leftBlocks.shift();
         } else { break; }
      }

      allPages.push(currentPage);
      pageIndex++;
      if (leftBlocks.length === 0 && rightBlocks.length === 0) break;
    }
    setPages(allPages);
  }, [data]);

  const renderPage = (pageData: PageData) => (
    <div className="p-12 bg-white text-slate-800 font-sans text-sm leading-relaxed h-full">
      {pageData.isFirstPage && (
        <>
          <header className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">{data.personalInfo.name}</h1>
              <p className="text-xl text-indigo-600 font-medium">{data.personalInfo.title}</p>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-1 flex-shrink-0 pl-4">
              <p>{data.personalInfo.phone}</p>
              <p>{data.personalInfo.email}</p>
              {data.personalInfo.linkedin && <p>{data.personalInfo.linkedin}</p>}
              <p>{data.personalInfo.location}</p>
              {data.personalInfo.portfolio && <p>{data.personalInfo.portfolio}</p>}
            </div>
          </header>
          {data.summary && <section className="mb-8"><SectionHeader title="Summary" /><p>{data.summary}</p></section>}
        </>
      )}

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-3">
          {(pageData.experience.length > 0 || (!pageData.isFirstPage && pages.some(p => p.experience.length > 0) && pageData.experience.length === 0)) && (
            <section className="mb-8">
              <SectionHeader title="Experience" />
              {pageData.experience.map((job, index) => (
                <div key={index} className="mb-6 relative pl-4">
                  <div className="absolute left-0 top-1.5 h-full border-l-2 border-slate-200"></div>
                  <div className="absolute left-[-5px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-md text-slate-900">{job.title}</h3>
                    <p className="text-xs font-medium text-slate-500 pl-2 text-right">{job.dates}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{job.company}</p>
                  <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700">{job.description.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              ))}
            </section>
          )}
           {pageData.education.length > 0 && (
            <section>
              <SectionHeader title="Education" />
              {pageData.education.map((edu, index) => (
                 <div key={index} className="mb-6 relative pl-4">
                  <div className="absolute left-0 top-1.5 h-full border-l-2 border-slate-200"></div>
                  <div className="absolute left-[-5px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white"></div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-md text-slate-900">{edu.institution}</h3>
                    <p className="text-xs font-medium text-slate-500 pl-2 text-right">{edu.dates}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{edu.degree}</p>
                </div>
              ))}
            </section>
          )}
        </div>
        <div className="col-span-2">
          {pageData.skills.length > 0 && (
            <section className="mb-8">
              <SectionHeader title="Skills" />
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 pt-3 pb-4 space-y-2">
                {pageData.skills.map((skill, index) => {
                  const [title, ...description] = skill.split(':');
                  if (description.length > 0) {
                    return <p key={index} className="text-slate-700"><strong className="font-bold text-slate-900">{title}:</strong>{description.join(':')}</p>;
                  }
                  return <p key={index} className="text-slate-700">{skill}</p>;
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div id={containerId} className="flex flex-col items-center">
        {pages.map((page, index) => (
          <ResumePage key={index}>
            {renderPage(page)}
          </ResumePage>
        ))}
      </div>
      
      <div ref={measureRef} className="opacity-0 absolute -z-10" style={{ width: '816px', left: '-9999px', top: 0 }}>
          <div className="p-12">
            <header className="measure-header flex justify-between items-start mb-8">
                <div><h1 className="text-4xl font-extrabold text-slate-900">{data.personalInfo.name}</h1><p className="text-xl text-indigo-600 font-medium">{data.personalInfo.title}</p></div>
                <div className="text-right text-xs text-slate-600 space-y-1 flex-shrink-0 pl-4">...</div>
            </header>
            <section className="measure-summary-section mb-8"><SectionHeader title="Summary" /><p>{data.summary}</p></section>
            
            <div className="grid grid-cols-5 gap-8">
              <div className="col-span-3">
                <section>
                  <div className="measure-experience-header"><SectionHeader title="Experience" /></div>
                  {data.experience.map((job, index) => (<div key={index} className="measure-exp-item mb-6 relative pl-4">
                    <div className="flex justify-between items-baseline"><h3 className="font-bold text-md text-slate-900">{job.title}</h3><p className="text-xs font-medium text-slate-500 pl-2 text-right">{job.dates}</p></div>
                    <p className="text-sm font-semibold text-slate-600">{job.company}</p>
                    <ul className="mt-4 list-disc list-outside ml-4 space-y-2 text-slate-700">{job.description.map(d => <li key={d}>{d}</li>)}</ul>
                  </div>))}
                </section>
                <section>
                  <div className="measure-education-header"><SectionHeader title="Education" /></div>
                  {data.education.map((edu, index) => (<div key={index} className="measure-edu-item mb-6 relative pl-4">
                    <div className="flex justify-between items-baseline"><h3 className="font-bold text-md text-slate-900">{edu.institution}</h3><p className="text-xs font-medium text-slate-500 pl-2 text-right">{edu.dates}</p></div>
                    <p className="text-sm font-semibold text-slate-600">{edu.degree}</p>
                  </div>))}
                </section>
              </div>
              <div className="col-span-2">
                <section className="measure-skills-section mb-8">
                  <div className="measure-skills-header"><SectionHeader title="Skills" /></div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 pt-3 pb-4 space-y-2">
                    {data.skills.map((skill, index) => (<p key={index} className="measure-skill-item text-slate-700">{skill}</p>))}
                  </div>
                </section>
              </div>
            </div>
          </div>
      </div>
    </>
  );
};
