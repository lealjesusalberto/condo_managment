import React from 'react';

export const FinancialReports = ({ apartments, expenses, rentalIncomes }) => {
    // 1. Calculations for Estado de Resultados (Income Statement)
    // Ingresos por cuotas de mes (asumimos los pagos al día)
    const totalCuotasMes = apartments.filter(a => a.monthsDue === 0).length * 45.00 + 450.00; // Valor del dashboard original
    const totalAlquileres = rentalIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIngresos = totalCuotasMes + totalAlquileres;

    // Gastos Operativos
    const totalGastos = expenses.reduce((acc, curr) => acc + curr.cost, 0);

    // Excedente o Déficit
    const resultadoDelMes = totalIngresos - totalGastos;

    // 2. Calculations for Estado de Situación Financiera (Balance Sheet)
    // Activos
    // Cuentas por cobrar a copropietarios
    const cuentasPorCobrar = apartments.reduce((acc, curr) => acc + curr.debt, 0);
    
    // Saldo en Banco (Para demo, asumimos que es el resultado acumulado + ingresos del mes no gastados)
    // En un caso real vendría de la conciliación. Aquí simularemos un saldo base + el resultado de este mes
    const saldoBancoInicial = 1250.00;
    const saldoBancoActual = saldoBancoInicial + resultadoDelMes - cuentasPorCobrar; // Ajuste simple para que no parezca que todo está en banco

    const totalActivos = saldoBancoActual + cuentasPorCobrar;

    // Pasivos (Cuentas por pagar - asumimos 0 para la demo)
    const cuentasPorPagar = 0.00;
    const totalPasivos = cuentasPorPagar;

    // Patrimonio (Excedentes Acumulados)
    const patrimonio = totalActivos - totalPasivos; // Ecuación contable básica A = P + Pt

    return (
        <div className="financial-reports-container">
            <div className="report-header">
                <h2>Estados Financieros Mensuales</h2>
                <p>Mes correspondiente: Julio 2026</p>
                <div className="report-actions">
                    <button className="btn-primary" onClick={() => window.print()}>
                        <i className="fa-solid fa-print"></i> Imprimir Reportes
                    </button>
                </div>
            </div>

            <div className="reports-grid">
                {/* ESTADO DE RESULTADOS */}
                <div className="financial-doc-card">
                    <div className="doc-header">
                        <h3>Estado de Resultados</h3>
                        <span>Del 01 al 31 de Julio de 2026</span>
                    </div>
                    
                    <div className="doc-body">
                        {/* INGRESOS */}
                        <div className="doc-section">
                            <h4 className="section-title">INGRESOS</h4>
                            <div className="doc-row">
                                <span>Cuotas del Mes (Recaudación)</span>
                                <span>${totalCuotasMes.toFixed(2)}</span>
                            </div>
                            <div className="doc-row">
                                <span>Alquileres de Locales Comerciales</span>
                                <span>${totalAlquileres.toFixed(2)}</span>
                            </div>
                            <div className="doc-row total-row">
                                <strong>Total Ingresos</strong>
                                <strong>${totalIngresos.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* EGRESOS */}
                        <div className="doc-section mt-4">
                            <h4 className="section-title">GASTOS OPERATIVOS</h4>
                            {expenses.map(exp => (
                                <div className="doc-row" key={exp.id}>
                                    <span>{exp.title}</span>
                                    <span>${exp.cost.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="doc-row total-row">
                                <strong>Total Gastos</strong>
                                <strong>${totalGastos.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* RESULTADO NETO */}
                        <div className="doc-section mt-4">
                            <div className={`doc-row result-row ${resultadoDelMes >= 0 ? 'text-emerald' : 'text-rose'}`}>
                                <strong>{resultadoDelMes >= 0 ? 'EXCEDENTE DEL MES' : 'DÉFICIT DEL MES'}</strong>
                                <strong>${resultadoDelMes.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ESTADO DE SITUACION FINANCIERA */}
                <div className="financial-doc-card">
                    <div className="doc-header">
                        <h3>Estado de Situación Financiera</h3>
                        <span>Al 31 de Julio de 2026</span>
                    </div>

                    <div className="doc-body">
                        {/* ACTIVOS */}
                        <div className="doc-section">
                            <h4 className="section-title">ACTIVOS</h4>
                            <div className="doc-row">
                                <span>Efectivo y Equivalentes (Saldo en Banco)</span>
                                <span>${saldoBancoActual.toFixed(2)}</span>
                            </div>
                            <div className="doc-row">
                                <span>Cuentas por Cobrar (Copropietarios)</span>
                                <span>${cuentasPorCobrar.toFixed(2)}</span>
                            </div>
                            <div className="doc-row total-row">
                                <strong>Total Activos</strong>
                                <strong>${totalActivos.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* PASIVOS */}
                        <div className="doc-section mt-4">
                            <h4 className="section-title">PASIVOS</h4>
                            <div className="doc-row">
                                <span>Cuentas por Pagar (Proveedores)</span>
                                <span>${cuentasPorPagar.toFixed(2)}</span>
                            </div>
                            <div className="doc-row total-row">
                                <strong>Total Pasivos</strong>
                                <strong>${totalPasivos.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* PATRIMONIO */}
                        <div className="doc-section mt-4">
                            <h4 className="section-title">PATRIMONIO</h4>
                            <div className="doc-row">
                                <span>Excedentes Acumulados</span>
                                <span>${patrimonio.toFixed(2)}</span>
                            </div>
                            <div className="doc-row total-row">
                                <strong>Total Patrimonio</strong>
                                <strong>${patrimonio.toFixed(2)}</strong>
                            </div>
                        </div>

                        {/* VERIFICACION CONTABLE */}
                        <div className="doc-section mt-4">
                            <div className="doc-row result-row" style={{ borderTop: '2px solid #CBD5E1', background: '#F8FAFC' }}>
                                <strong>Total Pasivo y Patrimonio</strong>
                                <strong>${(totalPasivos + patrimonio).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
