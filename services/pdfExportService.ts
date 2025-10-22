import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageSize } from '../types';

export const exportToPdf = async (containerId: string, fileName: string, pageSize: PageSize): Promise<void> => {
  const resumeContainer = document.getElementById(containerId);
  if (!resumeContainer) {
    console.error(`Container with id ${containerId} not found.`);
    return;
  }

  const pages = resumeContainer.querySelectorAll('.resume-page');
  if (pages.length === 0) {
    console.error("No pages found to export.");
    return;
  }
  
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: pageSize,
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i] as HTMLElement;
      const canvas = await html2canvas(page, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        width: page.offsetWidth,
        height: page.offsetHeight,
      });

      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};