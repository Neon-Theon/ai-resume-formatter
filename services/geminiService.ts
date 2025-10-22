
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData, AtsAnalysis } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Recursively traverses an object or array and replaces all whole-word instances of "Al" with "AI".
 * @param obj The object, array, or primitive to process.
 * @returns The processed object, array, or primitive.
 */
const fixAiTypo = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.replace(/\bAl\b/g, 'AI');
  }
  if (Array.isArray(obj)) {
    return obj.map(item => fixAiTypo(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = fixAiTypo(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedin: { type: Type.STRING, nullable: true },
        portfolio: { type: Type.STRING, nullable: true },
      },
      required: ['name', 'title', 'email', 'phone', 'location']
    },
    summary: { type: Type.STRING },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          title: { type: Type.STRING },
          dates: { type: Type.STRING },
          description: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['company', 'title', 'dates', 'description']
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          dates: { type: Type.STRING }
        },
        required: ['institution', 'degree', 'dates']
      }
    },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['personalInfo', 'summary', 'experience', 'education', 'skills']
};


const atsAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    before: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        keywordMatch: { type: Type.NUMBER },
        formattingCompliance: { type: Type.NUMBER },
        sectionClarity: { type: Type.NUMBER },
      },
      required: ['score', 'keywordMatch', 'formattingCompliance', 'sectionClarity'],
    },
    after: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        keywordMatch: { type: Type.NUMBER },
        formattingCompliance: { type: Type.NUMBER },
        sectionClarity: { type: Type.NUMBER },
      },
      required: ['score', 'keywordMatch', 'formattingCompliance', 'sectionClarity'],
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['before', 'after', 'improvements'],
};


export const generateResumeJson = async (rawResumeText: string, jobDescription?: string): Promise<ResumeData> => {
  const formattingPrompt = `
    You are an expert resume parser. Your task is to transform the following raw resume text into a structured, modern JSON format. 
    - **DO NOT alter the original wording or content in any way.** Your only job is to parse and structure the information.
    - Preserve all factual information exactly as provided.
    - Standardize section headings (e.g., 'Work Experience', 'Education', 'Skills').
    - Ensure the output strictly adheres to the provided JSON schema.

    [RAW RESUME TEXT]:
    ---
    ${rawResumeText}
    ---

    Generate the JSON output now.
  `;
  
  const optimizationPrompt = `
    You are an expert resume writer and ATS optimization specialist. Your task is to transform the following raw resume text into a structured, modern, and ATS-friendly JSON format. 
    You must also incorporate relevant keywords from the provided job description where appropriate.
    - Preserve all factual information. Do not invent details.
    - Use strong action verbs to start bullet points.
    - Standardize section headings (e.g., 'Work Experience', 'Education', 'Skills').
    - Ensure the output strictly adheres to the provided JSON schema.

    [RAW RESUME TEXT]:
    ---
    ${rawResumeText}
    ---

    [TARGET JOB DESCRIPTION]:
    ---
    ${jobDescription}
    ---

    Generate the JSON output now.
  `;
  
  const prompt = jobDescription ? optimizationPrompt : formattingPrompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
  });

  const jsonText = response.text.trim();
  const resumeData = JSON.parse(jsonText) as ResumeData;
  
  const fixedData = fixAiTypo(resumeData) as ResumeData;

  // Normalize date ranges to use a consistent hyphen format
  if (fixedData.experience) {
    fixedData.experience.forEach(exp => {
      if (exp.dates) {
        exp.dates = exp.dates.replace(/\s*-\s*/g, ' - ');
      }
    });
  }
  if (fixedData.education) {
    fixedData.education.forEach(edu => {
      if (edu.dates) {
        edu.dates = edu.dates.replace(/\s*-\s*/g, ' - ');
      }
    });
  }

  return fixedData;
};

export const analyzeAtsScore = async (rawResumeText: string, improvedResumeData: ResumeData, jobDescription?: string): Promise<AtsAnalysis> => {
  const analysisWithJdPrompt = `
    You are an expert ATS (Applicant Tracking System) analysis tool. Your task is to compare the original resume text with the improved, structured JSON version and provide a detailed "Before & After" analysis in JSON format, based on the provided job description.
    - Calculate a score from 0-100 for both versions. The "after" score must be significantly higher.
    - Break down each score into: Keyword Match (0-100), Formatting Compliance (0-100), and Section Clarity (0-100).
    - Provide a list of 3-5 specific, actionable improvements that were made, explaining why they are beneficial for this specific job.

    [ORIGINAL RESUME TEXT]:
    ---
    ${rawResumeText}
    ---

    [IMPROVED RESUME JSON]:
    ---
    ${JSON.stringify(improvedResumeData)}
    ---

    [TARGET JOB DESCRIPTION]:
    ---
    ${jobDescription}
    ---

    Generate the JSON analysis based on the provided schema.
  `;

  const analysisWithoutJdPrompt = `
    You are an expert ATS (Applicant Tracking System) analysis tool. Your task is to compare the original resume text with the improved, structured JSON version and provide a detailed "Before & After" analysis in JSON format based on general best practices.
    - Calculate a score from 0-100 for both versions. The "after" score must be higher due to improved structure and formatting.
    - Break down each score into: Keyword Match (0-100), Formatting Compliance (0-100), and Section Clarity (0-100).
    - Since no job description is provided, base the "Keyword Match" score on the presence of common strong action verbs and industry-standard skill terms. The score should still be realistic.
    - Provide a list of 3-5 specific, actionable improvements that were made related to formatting, clarity, and structure, explaining why they are beneficial for general ATS parsing and readability.

    [ORIGINAL RESUME TEXT]:
    ---
    ${rawResumeText}
    ---

    [IMPROVED RESUME JSON]:
    ---
    ${JSON.stringify(improvedResumeData)}
    ---

    Generate the JSON analysis based on the provided schema.
  `;
  
  const prompt = jobDescription ? analysisWithJdPrompt : analysisWithoutJdPrompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: atsAnalysisSchema,
    },
  });

  const jsonText = response.text.trim();
  const analysisData = JSON.parse(jsonText) as AtsAnalysis;
  return fixAiTypo(analysisData) as AtsAnalysis;
}
