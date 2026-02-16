/**
 * Report Generation Module
 * Uses jsPDF to create PDF reports
 */

export const generatePDF = (records, period) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // medical-500
    doc.text("Patient Health Report", 14, 20);
    
    // Subtitle / Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr} | Period: ${period}`, 14, 28);
    
    // Calculate Stats for Report
    let avgSys = 0, avgDia = 0, avgSugarBefore = 0, avgSugarAfter = 0;
    let countBP = 0, countSugarBefore = 0, countSugarAfter = 0;

    records.forEach(r => {
        if(r.systolic && r.diastolic) {
            avgSys += Number(r.systolic);
            avgDia += Number(r.diastolic);
            countBP++;
        }
        if(r.sugarBefore) {
            avgSugarBefore += Number(r.sugarBefore);
            countSugarBefore++;
        }
        if(r.sugarAfter) {
            avgSugarAfter += Number(r.sugarAfter);
            countSugarAfter++;
        }
    });

    avgSys = countBP ? Math.round(avgSys / countBP) : '-';
    avgDia = countBP ? Math.round(avgDia / countBP) : '-';
    avgSugarBefore = countSugarBefore ? Math.round(avgSugarBefore / countSugarBefore) : '-';
    avgSugarAfter = countSugarAfter ? Math.round(avgSugarAfter / countSugarAfter) : '-';

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Summary Statistics", 14, 40);
    
    const summaryData = [
        ['Avg Blood Pressure', `${avgSys} / ${avgDia} mmHg`],
        ['Avg Sugar (Before Meal)', `${avgSugarBefore} mg/dL`],
        ['Avg Sugar (After Meal)', `${avgSugarAfter} mg/dL`]
    ];

    doc.autoTable({
        startY: 45,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', width: 80 } }
    });

    // Records Table
    doc.text("Detailed Records", 14, doc.lastAutoTable.finalY + 15);

    const tableRows = records.map(r => [
        r.date,
        (r.systolic && r.diastolic) ? `${r.systolic}/${r.diastolic}` : '-',
        r.sugarBefore ? `${r.sugarBefore}` : '-',
        r.sugarAfter ? `${r.sugarAfter}` : '-',
        r.notes || '-'
    ]);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Date', 'BP (mmHg)', 'Sugar Fast (mg/dL)', 'Sugar Post (mg/dL)', 'Notes']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [14, 165, 233] }
    });

    // Save
    doc.save(`Health_Report_${period.replace(/\s/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`);
};
