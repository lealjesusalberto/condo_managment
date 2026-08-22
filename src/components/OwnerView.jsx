import React from 'react';

export const OwnerView = ({ currentOwner, fullOwnerData, ownerPayments, activities, monthlyFee, totalExpensesAliquota, onOpenReportModal, onOpenReceiptModal, billsIssued, onOpenMonthlyBill }) => {
    const isSolvent = currentOwner.monthsDue === 0;

    return (
        <section className="view-section active">
            {billsIssued && (
                <div style={{ backgroundColor: '#DBEAFE', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #2563EB' }}>
                    <div>
                        <strong style={{ color: '#1E3A8A' }}><i className="fa-solid fa-bell"></i> Tienes un nuevo recibo de condominio disponible</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#1E3A8A' }}>El administrador ha emitido el recibo correspondiente al mes en curso.</p>
                    </div>
                    <button className="btn-primary" onClick={() => onOpenMonthlyBill(fullOwnerData || currentOwner)}>
                        <i className="fa-solid fa-file-invoice"></i> Ver Recibo del Mes
                    </button>
                </div>
            )}
            
            {/* CARDS RESUMEN PROPIETARIO */}
            <div className="summary-grid">
                <div className={`summary-card ${isSolvent ? 'card-status-ok' : 'card-status-alert'}`}>
                    <div className="card-icon">
                        <i className={`fa-solid ${isSolvent ? 'fa-circle-check text-emerald' : 'fa-triangle-exclamation text-rose'}`}></i>
                    </div>
                    <div className="card-info">
                        <span>Estado de Cuenta (Apto {currentOwner.apto})</span>
                        <h3 className={isSolvent ? 'text-emerald' : 'text-rose'}>
                            {isSolvent ? 'AL DÍA (0 Meses en Mora)' : `EN MORA (${currentOwner.monthsDue} Meses)`}
                        </h3>
                        <small>Cuota Estimada: ${monthlyFee.toFixed(2)}</small>
                        <br/>
                        <small style={{ fontSize: '11px', color: '#94A3B8' }}>
                            ({currentOwner.aliquotPercentage}% de ${totalExpensesAliquota.toFixed(2)} gastos)
                        </small>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon icon-blue">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div className="card-info">
                        <span>Último Mes Solvente</span>
                        <h3>Julio 2026</h3>
                        <small>Próximo Vencimiento: 05 de Agosto</small>
                    </div>
                </div>

                <div className="summary-card card-action">
                    <button className="btn-primary-lg" onClick={onOpenReportModal}>
                        <i className="fa-solid fa-receipt"></i> Reportar Nuevo Pago
                    </button>
                    <small>Adjunta tu comprobante bancario o Zelle</small>
                </div>
            </div>

            {/* GRID PRINCIPAL: TABLA DE PAGOS Y MURO DE TRANSPARENCIA */}
            <div className="owner-grid">
                {/* HISTORIAL DE PAGOS */}
                <div className="panel-card">
                    <div className="panel-header">
                        <h3><i className="fa-solid fa-clock-rotate-left"></i> Historial de Mis Pagos</h3>
                        <span className="badge-blue">{ownerPayments.length} Registros</span>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mes</th>
                                    <th>Monto</th>
                                    <th>Fecha</th>
                                    <th>Referencia</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownerPayments.map((p) => (
                                    <tr key={p.id}>
                                        <td><strong>{p.month}</strong></td>
                                        <td>${p.amount.toFixed(2)}</td>
                                        <td>{p.date}</td>
                                        <td><code>{p.ref}</code></td>
                                        <td>
                                            {p.status === 'approved' && (
                                                <span className="status-badge status-approved">
                                                    <i className="fa-solid fa-check"></i> Validado
                                                </span>
                                            )}
                                            {p.status === 'pending' && (
                                                <span className="status-badge status-pending">
                                                    <i className="fa-solid fa-clock"></i> Pendiente
                                                </span>
                                            )}
                                            {p.status === 'rejected' && (
                                                <span className="status-badge status-rejected">
                                                    <i className="fa-solid fa-xmark"></i> Rechazado
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {p.status === 'approved' ? (
                                                <button
                                                    className="btn-sm-outline"
                                                    onClick={() => onOpenReceiptModal(p)}
                                                >
                                                    <i className="fa-solid fa-file-pdf"></i> Recibo
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#94A3B8' }}>En revisión</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FEED DE TRANSPARENCIA */}
                <div className="panel-card">
                    <div className="panel-header">
                        <h3><i className="fa-solid fa-bullhorn"></i> Cartelera de Transparencia</h3>
                        <span className="badge-emerald">Obras y Mantenimientos</span>
                    </div>

                    <div className="activities-feed">
                        {activities.map((act) => {
                            const defaultImage = act.category === 'Personal' 
                                ? 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=700' 
                                : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=700';
                            
                            return (
                                <div key={act.id} className="activity-card">
                                    <div className="act-image-container">
                                        <img src={act.photo || defaultImage} alt={act.title} />
                                        <div className="act-cost-badge">${act.cost.toFixed(2)}</div>
                                    </div>
                                    <div className="act-content">
                                        <div className="act-meta">
                                            <span><i className="fa-solid fa-tag"></i> {act.category}</span>
                                            <span><i className="fa-solid fa-calendar"></i> {act.date}</span>
                                        </div>
                                        <h4>{act.title}</h4>
                                        <p>{act.desc}</p>
                                        
                                        {(act.beneficiary || act.eventType) && (
                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                                                {act.beneficiary && <div><strong>Beneficiario:</strong> {act.beneficiary}</div>}
                                                {act.eventType && <div><strong>Tipo de Evento:</strong> {act.eventType}</div>}
                                                {act.impactsAliquota !== undefined && (
                                                    <div><strong>Impacta Alícuota:</strong> {act.impactsAliquota ? 'Sí' : 'No'}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
