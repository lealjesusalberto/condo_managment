import React from 'react';

export const ExpenseReceiptModal = ({ isOpen, onClose, data, condoName }) => {
    if (!isOpen || !data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card modal-card-large">
                <button className="modal-close" onClick={onClose}>&times;</button>

                {/* DOCUMENTO OFICIAL IMPRIMIBLE */}
                <div className="official-receipt-box" id="officialExpenseReceiptDoc">
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
                            <span className="doc-badge">COMPROBANTE DE EGRESO</span>
                            <h4>RECIBO DE PAGO A PERSONAL / PROVEEDOR</h4>
                            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                Fecha de Emisión: {new Date().toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>

                    {/* CUERPO DEL DOCUMENTO */}
                    <div className="receipt-financial-summary">
                        <div className="fin-box">
                            <span>Beneficiario / Proveedor</span>
                            <strong style={{ fontSize: '16px', color: '#1E40AF' }}>
                                {data.beneficiary || 'N/A'}
                            </strong>
                        </div>
                        <div className="fin-box">
                            <span>Fecha de Gasto</span>
                            <strong style={{ fontSize: '16px', color: '#10B981' }}>
                                {data.date}
                            </strong>
                        </div>
                        <div className="fin-box">
                            <span>Monto Pagado</span>
                            <strong style={{ fontSize: '20px', color: '#1E40AF' }}>
                                ${data.cost.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    <div className="table-responsive margin-top-15">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Categoría / Tipo de Evento</th>
                                    <th>¿Afecta Alícuota?</th>
                                    <th style={{ textAlign: 'right' }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>{data.title}</strong><br/>
                                        <small>{data.desc}</small>
                                    </td>
                                    <td>
                                        {data.category}<br/>
                                        <small>{data.eventType || 'Mantenimiento Preventivo'}</small>
                                    </td>
                                    <td>
                                        {data.impactsAliquota ? (
                                            <span className="badge-emerald">Sí</span>
                                        ) : (
                                            <span className="badge-amber">No</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                        ${data.cost.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* FIRMAS DIGITALES */}
                    <div className="receipt-signature-row" style={{ marginTop: '60px' }}>
                        <div className="sig-box">
                            <div className="sig-line"></div>
                            <p>Firma de Administración</p>
                            <small>Sello del Condominio</small>
                        </div>
                        <div className="sig-box">
                            <div className="sig-line"></div>
                            <p>Firma del Beneficiario / Proveedor</p>
                            <small>C.I. / RIF:</small>
                        </div>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN DE MODAL */}
                <div className="modal-actions-row">
                    <button className="btn-sm-outline" onClick={handlePrint} style={{ width: '100%', padding: '12px' }}>
                        <i className="fa-solid fa-print"></i> Imprimir Recibo para Firma
                    </button>
                </div>
            </div>
        </div>
    );
};
