import React from 'react';
import { generateSingleReceiptPDF, generateExpensesReportPDF } from '../utils/pdfGenerator';

export const OfficialReceiptModal = ({ isOpen, onClose, type, data, condoName }) => {
    if (!isOpen || !data) return null;

    const isSinglePayment = type === 'single';

    const handleDownloadPDF = () => {
        if (isSinglePayment) {
            generateSingleReceiptPDF(data.payment, data.ownerInfo, condoName);
        } else {
            generateExpensesReportPDF(data.expenses, condoName, data.totalExpenses, data.totalIncome);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShareWhatsapp = () => {
        let text = '';
        if (isSinglePayment) {
            text = `📄 *COMPROBANTE OFICIAL DE PAGO - ${condoName}*\n\n` +
                   `• *Propietario:* ${data.ownerInfo.name} (${data.ownerInfo.apto})\n` +
                   `• *Mes:* ${data.payment.month}\n` +
                   `• *Monto:* $${data.payment.amount.toFixed(2)}\n` +
                   `• *Referencia:* ${data.payment.ref}\n` +
                   `• *Estado:* VALIDADO / APROBADO\n\n` +
                   `Comprobante emitido electrónicamente por HabitApp.`;
        } else {
            text = `📊 *INFORME MENSUAL DE TRANSPARENCIA - ${condoName}*\n\n` +
                   `• *Recaudación Total:* $${data.totalIncome.toFixed(2)}\n` +
                   `• *Total Gastos Ejecutados:* $${data.totalExpenses.toFixed(2)}\n` +
                   `• *Fondo Neto:* $${(data.totalIncome - data.totalExpenses).toFixed(2)}\n\n` +
                   `Consulte el desglose completo en HabitApp.`;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card modal-card-large">
                <button className="modal-close" onClick={onClose}>&times;</button>

                {/* DOCUMENTO OFICIAL IMPRIMIBLE */}
                <div className="official-receipt-box" id="officialReceiptDoc">
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
                            <span className="doc-badge">DOCUMENTO OFICIAL VERIFICADO</span>
                            <h4>{isSinglePayment ? 'RECIBO DE COMPROBANTE DE PAGO' : 'INFORME MENSUAL DE GASTOS Y TRANSPARENCIA'}</h4>
                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>

                    {/* CUERPO DEL DOCUMENTO */}
                    {isSinglePayment ? (
                        <>
                            <div className="receipt-financial-summary">
                                <div className="fin-box">
                                    <span>Propietario / Apto</span>
                                    <strong style={{ fontSize: '16px', color: '#1E40AF' }}>
                                        {data.ownerInfo.name} ({data.ownerInfo.apto})
                                    </strong>
                                </div>
                                <div className="fin-box">
                                    <span>Mes Aportado</span>
                                    <strong style={{ fontSize: '18px', color: '#10B981' }}>
                                        {data.payment.month}
                                    </strong>
                                </div>
                                <div className="fin-box">
                                    <span>Monto Total Pagado</span>
                                    <strong style={{ fontSize: '20px', color: '#1E40AF' }}>
                                        ${data.payment.amount.toFixed(2)}
                                    </strong>
                                </div>
                            </div>

                            <div className="table-responsive margin-top-15">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Concepto</th>
                                            <th>N° Referencia</th>
                                            <th>Método de Pago</th>
                                            <th>Estado</th>
                                            <th style={{ textAlign: 'right' }}>Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Cuota Mantenimiento y Servicios Condominio ({data.payment.month})</td>
                                            <td><code>{data.payment.ref}</code></td>
                                            <td>{data.payment.method || 'Transferencia'}</td>
                                            <td>
                                                <span className="status-badge status-approved">
                                                    <i className="fa-solid fa-check"></i> VALIDADO
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                                ${data.payment.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="receipt-financial-summary">
                                <div className="fin-box">
                                    <span>Recaudación del Mes</span>
                                    <strong style={{ fontSize: '18px', color: '#10B981' }}>
                                        ${data.totalIncome.toFixed(2)}
                                    </strong>
                                </div>
                                <div className="fin-box">
                                    <span>Total Gastos Ejecutados</span>
                                    <strong style={{ fontSize: '18px', color: '#EF4444' }}>
                                        ${data.totalExpenses.toFixed(2)}
                                    </strong>
                                </div>
                                <div className="fin-box">
                                    <span>Fondo Neto Disponible</span>
                                    <strong style={{ fontSize: '18px', color: '#1E40AF' }}>
                                        ${(data.totalIncome - data.totalExpenses).toFixed(2)}
                                    </strong>
                                </div>
                            </div>

                            <div className="table-responsive margin-top-15">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Categoría</th>
                                            <th>Concepto del Trabajo / Servicio</th>
                                            <th style={{ textAlign: 'right' }}>Monto ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.expenses.map((exp) => (
                                            <tr key={exp.id}>
                                                <td>{exp.date}</td>
                                                <td><span className="badge-blue">{exp.category}</span></td>
                                                <td>
                                                    <strong>{exp.title}</strong>
                                                    <br />
                                                    <small style={{ color: '#64748B' }}>{exp.desc}</small>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                                                    ${exp.cost.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="table-total-row">
                                            <td colSpan="3" style={{ fontWeight: '800', textAlign: 'right' }}>
                                                TOTAL GASTOS REGISTRADOS EN CARTELERA:
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '16px', color: '#1E40AF' }}>
                                                ${data.totalExpenses.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* FIRMAS DIGITALES */}
                    <div className="receipt-signature-row">
                        <div className="sig-box">
                            <div className="sig-line"></div>
                            <p>Administración de Condominio</p>
                        </div>
                        <div className="sig-box">
                            <div className="sig-line"></div>
                            <p>Propietario / Residente</p>
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
                        <i className="fa-brands fa-whatsapp"></i> Compartir por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};
