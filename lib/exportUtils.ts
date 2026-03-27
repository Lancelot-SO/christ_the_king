/**
 * Exports data to an Excel file (.xlsx)
 * @param data Array of objects to export
 * @param fileName Name of the file without extension
 */
export const exportToExcel = async (data: any[], fileName: string) => {
    try {
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
        console.error("Excel Export Error:", error);
        alert("Failed to export Excel file.");
    }
};

/**
 * Exports data to a PDF file (.pdf)
 * @param headers Array of column headers
 * @param data Array of arrays representing table rows
 * @param fileName Name of the file without extension
 * @param title Title to display at the top of the PDF
 */
export const exportToPDF = async (headers: string[], data: any[][], fileName: string, title: string) => {
    try {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        
        const doc = new jsPDF();
        
        // Add Title
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        
        // Add Date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        
        // Add Table
        autoTable(doc, {
            head: [headers],
            body: data,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] }, // Black header to match theme
            styles: { fontSize: 9 },
        });
        
        doc.save(`${fileName}.pdf`);
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("Failed to export PDF file.");
    }
};
