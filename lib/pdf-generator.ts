import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface ReceiptData {
  receiptNumber: string;
  transactionId: string;
  studentName: string;
  courseName: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  applicationNumber: string;
}

export interface AdmissionLetterData {
  studentName: string;
  courseName: string;
  applicationNumber: string;
  admissionDate: Date;
  academicYear: string;
  department: string;
}

export class PDFGenerator {
  private addHeader(doc: jsPDF, title: string) {
    // Add SPPU Logo and Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SAVITRIBAI PHULE PUNE UNIVERSITY', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 105, 45, { align: 'center' });
    
    // Add line
    doc.line(20, 55, 190, 55);
  }

  private addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated document and does not require a signature.', 105, pageHeight - 20, { align: 'center' });
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 105, pageHeight - 10, { align: 'center' });
  }

  generateReceipt(data: ReceiptData): string {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'PAYMENT RECEIPT');
    
    let yPosition = 70;
    
    // Receipt details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Details:', 20, yPosition);
    
    yPosition += 15;
    doc.setFont('helvetica', 'normal');
    
    const details = [
      ['Receipt Number:', data.receiptNumber],
      ['Transaction ID:', data.transactionId],
      ['Student Name:', data.studentName],
      ['Course:', data.courseName],
      ['Application Number:', data.applicationNumber],
      ['Amount Paid:', `₹${data.amount.toFixed(2)}`],
      ['Payment Date:', format(data.paymentDate, 'dd/MM/yyyy HH:mm:ss')],
      ['Payment Method:', data.paymentMethod],
    ];

    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 12;
    });

    // Add success message
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text('Payment Successful!', 105, yPosition, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition += 15;
    doc.text('Please keep this receipt for your records.', 105, yPosition, { align: 'center' });

    this.addFooter(doc);
    
    return doc.output('datauristring');
  }

  generateAdmissionLetter(data: AdmissionLetterData): string {
    const doc = new jsPDF();
    
    this.addHeader(doc, 'ADMISSION CONFIRMATION LETTER');
    
    let yPosition = 70;
    
    // Admission details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const content = `
Dear ${data.studentName},

Congratulations! We are pleased to inform you that your application for admission to ${data.courseName} has been approved.

Application Details:
• Application Number: ${data.applicationNumber}
• Course: ${data.courseName}
• Department: ${data.department}
• Academic Year: ${data.academicYear}
• Admission Date: ${format(data.admissionDate, 'dd/MM/yyyy')}

Please report to the admission office with all original documents for verification and completion of admission formalities.

Important Instructions:
1. Bring all original documents for verification
2. Complete the admission process within 7 days of this letter
3. Pay the course fees as per the fee structure
4. Attend the orientation program as scheduled

We look forward to welcoming you to our university.

Best regards,
Admission Committee
Savitribai Phule Pune University
    `;

    const lines = doc.splitTextToSize(content, 170);
    lines.forEach((line: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });

    this.addFooter(doc);
    
    return doc.output('datauristring');
  }
}

export const pdfGenerator = new PDFGenerator();