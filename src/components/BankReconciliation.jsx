import React, { useState } from 'react';

export const BankReconciliation = ({ bankTransactions, setBankTransactions, expenses, apartments, rentalIncomes }) => {
    const [csvInput, setCsvInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Sistema Data
    const totalCuotasMes = apartments.filter(a => a.monthsDue === 0).length * 45.00 + 450.00;
    const totalAlquileres = rentalIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIngresosSistema = totalCuotasMes + totalAlquileres;
    const totalGastosSistema = expenses.reduce((acc, curr) => acc + curr.cost, 0);
    const saldoSistema = totalIngresosSistema - totalGastosSistema + 1250.00; // Asumiendo saldo base de 1250

    // Banco Data (Calculated from imported transactions)
    const saldoBancoInicial = 1250.00; // Same base balance for the demo
    const saldoBancoActual = bankTransactions.reduce((acc, tx) => acc + tx.amount, saldoBancoInicial);
    
    const diferencia = saldoBancoActual - saldoSistema;

    const handleImportCSV = () => {
        if (!csvInput.trim()) {
            window.appAlert('Por favor pega el contenido CSV del banco.', 'error');
            return;
        }

        setIsProcessing(true);
        // Simple CSV parser for demo purposes. Expects Format: Date, Reference, Amount
        try {
            const lines = csvInput.trim().split('\n');
            const newTxs = [];
            
            // Skip header if first line doesn't start with a number (Date)
            let startIndex = 0;
            if (lines[0] && isNaN(parseInt(lines[0][0]))) {
                startIndex = 1;
            }

            for (let i = startIndex; i < lines.length; i++) {
                const columns = lines[i].split(',');
                if (columns.length >= 3) {
                    newTxs.push({
                        id: 'tx-' + Date.now() + i,
                        date: columns[0].trim(),
                        ref: columns[1].trim(),
                        amount: parseFloat(columns[2].trim())
                    });
                }
            }

            setBankTransactions([...bankTransactions, ...newTxs]);
            setCsvInput('');
            window.appAlert(`✅ ${newTxs.length} transacciones importadas correctamente.`);
        } catch (error) {
            window.appAlert('Error procesando el CSV. Asegúrate de que tenga el formato: Fecha,Referencia,Monto', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearTransactions = () => {
        if(window.confirm('¿Estás seguro de que quieres limpiar las transacciones importadas?')) {
            setBankTransactions([]);
        }
    };

    return (
        <div className="bank-reconciliation-container">
            <div className="reconciliation-header">
                <div className="header-text">
                    <h2><i className="fa-solid fa-building-columns"></i> Conciliación Bancaria</h2>
                    <p>Importa el estado de cuenta para cuadrar los movimientos del banco vs el sistema.</p>
                </div>
            </div>

            {/* DASHBOARD CONCILIACION */}
            <div className="recon-dashboard">
                <div className="recon-card system-card">
                    <h4>Saldo según Sistema</h4>
                    <h2>${saldoSistema.toFixed(2)}</h2>
                    <small>Ingresos y Egresos Registrados</small>
                </div>
                
                <div className="recon-card bank-card">
                    <h4>Saldo según Banco</h4>
                    <h2>${saldoBancoActual.toFixed(2)}</h2>
                    <small>Transacciones Importadas</small>
                </div>

                <div className={`recon-card diff-card ${Math.abs(diferencia) > 0.01 ? 'has-diff' : 'no-diff'}`}>
                    <h4>Diferencia por Conciliar</h4>
                    <h2>${Math.abs(diferencia).toFixed(2)}</h2>
                    <small>{Math.abs(diferencia) > 0.01 ? 'Requiere revisión' : 'Conciliación Perfecta'}</small>
                </div>
            </div>

            <div className="recon-grid">
                {/* ZONA DE IMPORTACION */}
                <div className="import-zone panel-card">
                    <h3>Importar Estado de Cuenta (CSV)</h3>
                    <p className="helper-text">Formato esperado: <code>Fecha,Referencia,Monto</code></p>
                    <p className="helper-text"><small>Ejemplo: 20/07/2026, TRF-00123, 45.00</small></p>
                    
                    <textarea 
                        className="form-input" 
                        rows="8" 
                        placeholder="Pega aquí el contenido de tu CSV bancario..."
                        value={csvInput}
                        onChange={(e) => setCsvInput(e.target.value)}
                    ></textarea>

                    <div className="recon-actions">
                        <button className="btn-primary" onClick={handleImportCSV} disabled={isProcessing}>
                            {isProcessing ? 'Procesando...' : <><i className="fa-solid fa-file-import"></i> Procesar Movimientos</>}
                        </button>
                    </div>
                </div>

                {/* TABLA DE MOVIMIENTOS DEL BANCO */}
                <div className="bank-tx-list panel-card">
                    <div className="panel-header">
                        <h3>Movimientos Bancarios Importados</h3>
                        {bankTransactions.length > 0 && (
                            <button className="btn-sm-outline" onClick={handleClearTransactions}>
                                Limpiar
                            </button>
                        )}
                    </div>
                    
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {bankTransactions.length === 0 ? (
                            <div className="empty-state-tx">
                                <i className="fa-solid fa-receipt text-slate-400" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                <p>No hay transacciones importadas aún.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Referencia</th>
                                        <th>Monto</th>
                                        <th>Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bankTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.date}</td>
                                            <td><code>{tx.ref}</code></td>
                                            <td>
                                                <strong className={tx.amount > 0 ? 'text-emerald' : 'text-rose'}>
                                                    ${Math.abs(tx.amount).toFixed(2)}
                                                </strong>
                                            </td>
                                            <td>
                                                {tx.amount > 0 ? (
                                                    <span className="badge-emerald">Ingreso</span>
                                                ) : (
                                                    <span className="badge-rose">Egreso</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
