import React from 'react';
import { generateMonthlyBillPDF } from '../utils/pdfGenerator';
import { useExchangeRate } from '../hooks/useExchangeRate';

export const MonthlyBillModal = ({ isOpen, onClose, data, condoName }) => {
    if (!isOpen || !data) return null;

    const { rate, loading } = useExchangeRate();

    const handleDownloadPDF = () => {
        generateMonthlyBillPDF(data.ownerInfo, data.expenses, data.totalExpenses, condoName, rate);
    };

    const handlePrint = () => {
        window.print();
    };

    const currentMonthFee = data.totalExpenses * (data.ownerInfo.aliquotPercentage / 100);
    let previousDebt = data.ownerInfo.debt - currentMonthFee;
    if (previousDebt < 0) previousDebt = 0;
    const totalToPay = currentMonthFee + previousDebt;

    const formatCurrency = (usdAmount) => {
        if (loading || !rate) return `$${usdAmount.toFixed(2)}`;
        const vesAmount = usdAmount * rate;
        return `$${usdAmount.toFixed(2)} (Bs. ${vesAmount.toFixed(2)})`;
    };

    const handleShareWhatsapp = () => {
        const text = `📄 *AVISO DE COBRO MENSUAL - ${condoName}*\n\n` +
                     `• *Propietario:* ${data.ownerInfo.name} (${data.ownerInfo.apto})\n` +
                     `• *Cuota del Mes:* $${currentMonthFee.toFixed(2)}\n` +
                     `• *Deuda Meses Anteriores:* $${previousDebt.toFixed(2)}\n` +
                     `• *TOTAL A PAGAR:* ${formatCurrency(totalToPay)}\n\n` +
                     `Para más detalles, revise su recibo en PDF o contacte a la administración.`;
        window.open(`https://wa.me/${data.ownerInfo.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card modal-card-large">
                <button className="modal-close" onClick={onClose}>&times;</button>

                {/* DOCUMENTO OFICIAL IMPRIMIBLE */}
                <div className="official-receipt-box" id="monthlyBillDoc">
                    {/* ENCABEZADO DOC */}
                    <div className="receipt-doc-header">
                        <div className="receipt-brand">
                            <i className="fa-solid fa-building-user text-emerald"></i>
                            <div>
                                <h2>Habit<span style={{ color: '#10B981' }}>App</span></h2>
                                <p>{condoName} • RIF J-40192841-0</p>
                            </div>
                        </div>
                        <div className="receipt-doc-title">
                            <span className="doc-badge">DOCUMENTO DE COBRO</span>
                            <h4>AVISO DE COBRO MENSUAL</h4>
                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>

                    {/* CUERPO DEL DOCUMENTO */}
                    <div className="receipt-financial-summary">
                        <div className="fin-box">
                            <span>Propietario / Apto</span>
                            <strong style={{ fontSize: '16px', color: '#1E40AF' }}>
                                {data.ownerInfo.name} ({data.ownerInfo.apto})
                            </strong>
                        </div>
                        <div className="fin-box">
                            <span>Alícuota</span>
                            <strong style={{ fontSize: '18px', color: '#10B981' }}>
                                {data.ownerInfo.aliquotPercentage}%
                            </strong>
                        </div>
                        <div className="fin-box">
                            <span>Total Gastos Mes</span>
                            <strong style={{ fontSize: '18px', color: '#EF4444' }}>
                                ${data.totalExpenses.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className="table-responsive margin-top-15">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Concepto (Gastos Operativos del Mes)</th>
                                    <th style={{ textAlign: 'right' }}>Costo Total</th>
                                    <th style={{ textAlign: 'right' }}>Monto a Pagar (Alícuota {data.ownerInfo.aliquotPercentage}%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>
                                            <strong>{exp.title}</strong>
                                        </td>
                                        <td style={{ textAlign: 'right', color: '#64748B' }}>
                                            {formatCurrency(exp.cost)}
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: '500' }}>
                                            {formatCurrency(exp.cost * (data.ownerInfo.aliquotPercentage / 100))}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: '600' }}>
                                        Subtotal Cuota del Mes:
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                                        {formatCurrency(currentMonthFee)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ textAlign: 'right', fontWeight: '600' }}>
                                        Deuda de Meses Anteriores (Mora):
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '600', color: previousDebt > 0 ? '#EF4444' : '#10B981' }}>
                                        {formatCurrency(previousDebt)}
                                    </td>
                                </tr>
                                <tr className="table-total-row">
                                    <td colSpan="2" style={{ fontWeight: '800', textAlign: 'right' }}>
                                        TOTAL A PAGAR:
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '16px', color: '#1E40AF' }}>
                                        {formatCurrency(totalToPay)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* FIRMAS DIGITALES */}
                    <div className="receipt-signature-row">
                        <div className="sig-box">
                            <div className="sig-line"></div>
                            <p>Administración de Condominio</p>
                        </div>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN DE MODAL */}
                <div className="modal-actions-row">
                    <button className="btn-primary" onClick={handleDownloadPDF}>
                        <i className="fa-solid fa-file-pdf"></i> Descargar Recibo PDF (.pdf)
                    </button>
                    <button className="btn-sm-outline" onClick={handlePrint}>
                        <i className="fa-solid fa-print"></i> Imprimir / Guardar como PDF
                    </button>
                    <button className="btn-whatsapp-cobro" onClick={handleShareWhatsapp}>
                        <i className="fa-brands fa-whatsapp"></i> Enviar por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};
