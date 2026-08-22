import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateSingleReceiptPDF = (payment, ownerInfo, condoName) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175); // #1E40AF Primary
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HabitApp', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Comprobante Oficial de Pago • ${condoName}`, 15, 28);
    
    doc.setFontSize(14);
    doc.text('RECIBO DE COMPROBANTE', 140, 22);
    
    // Payment Details Box
    doc.setTextColor(15, 23, 42); // Text Main
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PROPIETARIO', 15, 48);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Propietario: ${ownerInfo.name}`, 15, 56);
    doc.text(`Apartamento / Unidad: ${ownerInfo.apto}`, 15, 63);
    doc.text(`Teléfono Contacto: ${ownerInfo.phone}`, 15, 70);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL PAGO', 120, 48);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° Referencia: ${payment.ref}`, 120, 56);
    doc.text(`Fecha del Pago: ${payment.date}`, 120, 63);
    doc.text(`Método: ${payment.method || 'Transferencia'}`, 120, 70);
    doc.text(`Estado: VALIDADO / APROBADO`, 120, 77);
    
    // Table of Breakdown
    doc.autoTable({
        startY: 85,
        head: [['Mes Correspondiente', 'Concepto', 'Monto Cuota']],
        body: [
            [payment.month, 'Cuota de Mantenimiento y Servicios de Condominio', `$${payment.amount.toFixed(2)}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL PAGADO: $${payment.amount.toFixed(2)}`, 140, finalY);
    
    // Footer / Signatures
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(30, finalY + 35, 80, finalY + 35);
    doc.line(130, finalY + 35, 180, finalY + 35);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Administración del Condominio', 33, finalY + 41);
    doc.text('Propietario Conforme', 142, finalY + 41);
    
    doc.save(`Recibo_${ownerInfo.apto}_${payment.month.replace(' ', '_')}.pdf`);
};

export const generateExpensesReportPDF = (expenses, condoName, totalExpenses, totalIncome) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HabitApp', 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Informe Mensual de Transparencia de Gastos - ${condoName}`, 15, 26);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}`, 15, 33);
    
    // Summary Cards
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, 46, 55, 22, 3, 3, 'F');
    doc.roundedRect(77, 46, 55, 22, 3, 3, 'F');
    doc.roundedRect(139, 46, 55, 22, 3, 3, 'F');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('RECAUDACIÓN MES', 18, 52);
    doc.text('TOTAL GASTOS MES', 80, 52);
    doc.text('FONDO RESERVA NETO', 142, 52);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text(`$${totalIncome.toFixed(2)}`, 18, 62);
    doc.text(`$${totalExpenses.toFixed(2)}`, 80, 62);
    doc.text(`$${(totalIncome - totalExpenses).toFixed(2)}`, 142, 62);
    
    // Table
    const tableBody = expenses.map(e => [
        e.date,
        e.category,
        e.title,
        e.desc,
        `$${e.cost.toFixed(2)}`
    ]);
    
    doc.autoTable({
        startY: 75,
        head: [['Fecha', 'Categoría', 'Concepto', 'Descripción de Ejecución', 'Monto']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 35 },
            2: { cellWidth: 45 },
            3: { cellWidth: 65 },
            4: { cellWidth: 23, fontStyle: 'bold', halign: 'right' }
        }
    });
    
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`TOTAL GASTOS EJECUTADOS: $${totalExpenses.toFixed(2)}`, 125, finalY);
    
    doc.save(`Informe_Gastos_Transparencia_${condoName.replace(/\s+/g, '_')}.pdf`);
};

export const generateMonthlyBillPDF = (ownerInfo, expenses, totalExpenses, condoName, rate) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HabitApp', 15, 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Aviso de Cobro de Condominio • ${condoName}`, 15, 26);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')}`, 15, 33);

    // Owner Info Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PROPIETARIO', 15, 48);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Propietario: ${ownerInfo.name}`, 15, 56);
    doc.text(`Apartamento: ${ownerInfo.apto}`, 15, 63);
    doc.text(`Alícuota: ${ownerInfo.aliquotPercentage}%`, 15, 70);
    
    if (rate) {
        doc.text(`Tasa de Cambio (BCV): Bs. ${rate.toFixed(2)}`, 130, 70);
    }

    const currentMonthFee = totalExpenses * (ownerInfo.aliquotPercentage / 100);
    let previousDebt = ownerInfo.debt - currentMonthFee;
    if (previousDebt < 0) previousDebt = 0;
    const totalToPay = currentMonthFee + previousDebt;

    const formatCurrency = (usdAmount) => {
        if (!rate) return `$${usdAmount.toFixed(2)}`;
        const vesAmount = usdAmount * rate;
        return `$${usdAmount.toFixed(2)}\n(Bs. ${vesAmount.toFixed(2)})`;
    };

    // Table
    const tableBody = expenses.map(exp => [
        exp.title,
        formatCurrency(exp.cost),
        formatCurrency(exp.cost * (ownerInfo.aliquotPercentage / 100))
    ]);

    tableBody.push([
        { content: 'Subtotal Cuota del Mes', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(currentMonthFee), styles: { fontStyle: 'bold' } }
    ]);
    tableBody.push([
        { content: 'Deuda de Meses Anteriores (Mora)', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatCurrency(previousDebt), styles: { fontStyle: 'bold', textColor: previousDebt > 0 ? [239, 68, 68] : [16, 185, 129] } }
    ]);

    doc.autoTable({
        startY: 80,
        head: [['Concepto (Gastos Operativos)', 'Costo Total', `Monto a Pagar (${ownerInfo.aliquotPercentage}%)`]],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    // For single line total
    const totalVes = rate ? ` (Bs. ${(totalToPay * rate).toFixed(2)})` : '';
    doc.text(`TOTAL A PAGAR: $${totalToPay.toFixed(2)}${totalVes}`, 80, finalY);

    // Footer
    doc.setLineWidth(0.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(30, finalY + 35, 80, finalY + 35);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Administración del Condominio', 33, finalY + 41);

    doc.save(`Aviso_Cobro_${ownerInfo.apto}_${new Date().getMonth()+1}_${new Date().getFullYear()}.pdf`);
};
