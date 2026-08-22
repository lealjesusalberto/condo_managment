import React, { useState } from 'react';

export const ReportPaymentModal = ({ isOpen, onClose, onSubmit, monthlyFee }) => {
    const [month, setMonth] = useState('Agosto 2026');
    const [amount, setAmount] = useState(monthlyFee);
    const [method, setMethod] = useState('Transferencia');
    const [ref, setRef] = useState('');
    const [receiptPhoto, setReceiptPhoto] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!ref.trim()) {
            window.appAlert('Por favor, ingresa el número de referencia del pago.', 'error');
            return;
        }

        const newPayment = {
            id: Date.now(),
            month,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            ref: ref.trim(),
            method,
            photo: receiptPhoto || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500',
            status: 'pending'
        };

        onSubmit(newPayment);
        setRef('');
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <div className="modal-icon-blue">
                        <i className="fa-solid fa-file-circle-plus"></i>
                    </div>
                    <h3>Reportar Pago de Mantenimiento</h3>
                    <p className="text-muted" style={{ fontSize: '13px' }}>
                        Envía los detalles de tu transferencia o pago móvil para validación
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mes Aportado</label>
                        <select
                            className="modal-input"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        >
                            <option value="Julio 2026">Julio 2026 ($45.00)</option>
                            <option value="Agosto 2026">Agosto 2026 ($45.00)</option>
                            <option value="Septiembre 2026">Septiembre 2026 ($45.00)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Monto Transferido ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="modal-input"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Método de Pago</label>
                        <select
                            className="modal-input"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <option value="Transferencia">Transferencia Bancaria</option>
                            <option value="Pago Móvil">Pago Móvil / Zelle</option>
                            <option value="Bizum">Bizum / Efectivo</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>N° de Referencia / Transacción</label>
                        <input
                            type="text"
                            className="modal-input"
                            placeholder="Ej: REF-994821"
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Adjuntar Foto Comprobante (Simulado)</label>
                        <div
                            className="file-upload-simulated"
                            onClick={() => {
                                setReceiptPhoto('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500');
                                window.appAlert('✅ 📷 Comprobante adjuntado correctamente (Simulación de upload)');
                            }}
                        >
                            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}></i>
                            <span>{receiptPhoto ? '✓ Comprobante listo' : 'Haz clic para seleccionar comprobante de pago'}</span>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-block">
                        <i className="fa-solid fa-paper-plane"></i> Enviar Pago para Aprobación
                    </button>
                </form>
            </div>
        </div>
    );
};
