import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { FinancialReports } from './FinancialReports';
import { BankReconciliation } from './BankReconciliation';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { db, secondaryAuth } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getCountFromServer, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });
    return position && position.lat ? <Marker position={[position.lat, position.lng]} icon={customIcon} /> : null;
}

export const AdminView = ({
    apartments,
    setApartments,
    condoSettings,
    setCondoSettings,
    fixedExpensesCatalog,
    setFixedExpensesCatalog,
    pendingApprovals,
    onApprovePayment,
    onRejectPayment,
    onAddExpense,
    activities,
    onUploadExpenseReceipt,
    onPrintExpenseReceipt,
    expenses,
    condoName,
    onOpenExpensesReportModal,
    rentalIncomes,
    bankTransactions,
    setBankTransactions,
    onOpenMonthlyBill,
    onIssueBills,
    userData,
    onLogout,
    currentUser,
    apartmentsLoading
}) => {
    if (userData && userData.status !== 'approved') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 81px)', padding: '20px' }}>
                <div className="panel-card" style={{ maxWidth: '450px', textAlign: 'center', padding: '40px' }}>
                    <i className="fa-solid fa-user-clock text-amber" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
                    <h2>Cuenta en Revisión</h2>
                    <p style={{ color: '#64748B', marginTop: '15px', lineHeight: '1.6' }}>Tu solicitud de administrador está pendiente de aprobación. Por favor, espera a que tu cuenta sea validada por nuestro equipo.</p>
                    <button className="btn-primary" onClick={onLogout} style={{ marginTop: '25px', width: '100%' }}>Cerrar Sesión</button>
                </div>
            </div>
        );
    }

    // Tabs state
    const [activeTab, setActiveTab] = useState('dashboard');
    const [finanzasExpanded, setFinanzasExpanded] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState(null);

    // Form state for adding an expense
    const [selectedCatalogId, setSelectedCatalogId] = useState('');
    const [title, setTitle] = useState('');
    const [beneficiary, setBeneficiary] = useState('');
    const [category, setCategory] = useState('Servicios Básicos');
    const [eventType, setEventType] = useState('Mantenimiento Preventivo');
    const [impactsAliquota, setImpactsAliquota] = useState(true);
    const [cost, setCost] = useState('');
    const [photo, setPhoto] = useState('');
    const [desc, setDesc] = useState('');

    // State for uploading receipt to existing expense
    const [uploadingReceiptId, setUploadingReceiptId] = useState(null);
    const [tempReceiptUrl, setTempReceiptUrl] = useState('');

    // State for Config Tab - New Apartment
    const [newApto, setNewApto] = useState({ apto: '', torre: '', owner: '', phone: '', email: '', password: '', aliquotPercentage: '' });
    // State for Config Tab - New Fixed Expense
    const [newCatalogExpense, setNewCatalogExpense] = useState({ title: '', category: 'Servicios Básicos', defaultCost: '', impactsAliquota: true });

    // Calculated metrics
    const totalCollected = apartments.filter(a => a.monthsDue === 0).length * 45.00;
    const totalInMora = apartments.reduce((acc, curr) => acc + curr.debt, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.cost, 0);

    const triggerConfetti = () => {
        try {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (e) {
            console.log('Confetti effect executed');
        }
    };

    const handleCatalogSelection = (e) => {
        const id = e.target.value;
        setSelectedCatalogId(id);
        if (id) {
            const item = fixedExpensesCatalog.find(x => x.id.toString() === id);
            if (item) {
                setTitle(item.title);
                setCategory(item.category);
                setImpactsAliquota(item.impactsAliquota);
                if (item.defaultCost > 0) setCost(item.defaultCost);
            }
        } else {
            setTitle('');
            setCost('');
        }
    };

    const handleApprove = (item) => {
        triggerConfetti();
        onApprovePayment(item);
    };

    const handleAddExpenseSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !cost || !beneficiary.trim()) {
            window.appAlert('Por favor ingresa el concepto, beneficiario y costo.', 'error');
            return;
        }

        const newExp = {
            id: Date.now(),
            date: new Date().toLocaleDateString('es-ES'),
            category,
            title: title.trim(),
            desc: desc.trim() || 'Servicio registrado por la Junta de Condominio.',
            cost: parseFloat(cost),
            photo: photo || '', // Optional now
            beneficiary: beneficiary.trim(),
            eventType,
            impactsAliquota,
            signedReceiptUrl: ''
        };

        onAddExpense(newExp);

        // Si fue "Otro" (selectedCatalogId vacío), guardarlo automáticamente en el catálogo para futuros usos
        if (!selectedCatalogId) {
            setFixedExpensesCatalog([
                ...fixedExpensesCatalog,
                {
                    id: Date.now() + 1, // +1 to avoid collision with newExp.id if fast enough
                    title: title.trim(),
                    category: category,
                    defaultCost: parseFloat(cost),
                    impactsAliquota: impactsAliquota
                }
            ]);
        }

        setSelectedCatalogId('');
        setTitle('');
        setBeneficiary('');
        setCost('');
        setPhoto('');
        setDesc('');
        setEventType('Mantenimiento Preventivo');
        setImpactsAliquota(true);
        window.appAlert('✅ Gasto registrado y publicado exitosamente en la Cartelera de Transparencia.');
    };

    const handleConfirmUpload = (id) => {
        if (!tempReceiptUrl) return;
        onUploadExpenseReceipt(id, tempReceiptUrl);
        setUploadingReceiptId(null);
        setTempReceiptUrl('');
        window.appAlert('✅ Comprobante firmado adjuntado con éxito.');
    };

    const handleAddApartment = async (e) => {
        e.preventDefault();
        const aliquot = parseFloat(newApto.aliquotPercentage);
        if (!newApto.apto || !newApto.owner || isNaN(aliquot)) {
            window.appAlert('Por favor completa los campos requeridos y asegúrate que la alícuota sea un número.', 'error');
            return;
        }
        if (!currentUser) {
            window.appAlert('Error: No se ha identificado al usuario (currentUser es null). Intenta iniciar sesión de nuevo.', 'error');
            console.error('currentUser is null/undefined');
            return;
        }
        const path = `users/${currentUser.uid}/apartments`;
        console.log('🔵 Intentando guardar apartamento en:', path);
        console.log('🔵 UID del usuario:', currentUser.uid);
        console.log('🔵 Datos:', { apto: newApto.apto, owner: newApto.owner, aliquot });
        try {
            let ownerUid = null;

            // Si se proporciona email y contraseña, crear el usuario en Firebase Auth usando la app secundaria
            if (newApto.email && newApto.password) {
                try {
                    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newApto.email, newApto.password);
                    ownerUid = userCredential.user.uid;
                    
                    // Crear documento global del usuario
                    await setDoc(doc(db, 'users', ownerUid), {
                        name: newApto.owner,
                        email: newApto.email,
                        role: 'owner',
                        apto: newApto.apto,
                        adminUid: currentUser.uid, // Referencia al admin que lo creó
                        condoName: condoName,
                        createdAt: new Date()
                    });

                    // Desloguear la app secundaria para limpiar estado
                    await signOut(secondaryAuth);
                } catch (authErr) {
                    console.error('Error creando Auth user:', authErr);
                    window.appAlert('No se pudo crear la cuenta del propietario: ' + authErr.message, 'error');
                    return; // Detener proceso si falla la creación de usuario
                }
            }

            const apartmentsRef = collection(db, 'users', currentUser.uid, 'apartments');
            const docRef = await addDoc(apartmentsRef, {
                apto: newApto.apto,
                torre: newApto.torre,
                owner: newApto.owner,
                phone: newApto.phone,
                email: newApto.email || '',
                ownerUid: ownerUid,
                aliquotPercentage: aliquot,
                monthsDue: 0,
                debt: 0,
                paidUntil: 'Nuevo Registro',
                createdAt: new Date()
            });
            console.log('✅ Apartamento guardado con ID:', docRef.id, 'en path:', path);
            // Actualizar conteo de apartamentos en el documento del admin
            try {
                const snapshot = await getCountFromServer(apartmentsRef);
                await updateDoc(doc(db, 'users', currentUser.uid), { apts: snapshot.data().count });
            } catch (countErr) {
                console.warn('No se pudo actualizar conteo de apts:', countErr);
            }
            setNewApto({ apto: '', torre: '', owner: '', phone: '', email: '', password: '', aliquotPercentage: '' });
            window.appAlert('✅ Apartamento y propietario registrados exitosamente.');
        } catch (error) {
            console.error('❌ Error adding apartment:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            window.appAlert(`Error al registrar: ${error.message}`, 'error');
        }
    };

    const handleDeleteApartment = async (aptId) => {
        if (!currentUser) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'apartments', aptId));
            // Actualizar conteo de apartamentos en el documento del admin
            try {
                const apartmentsRef = collection(db, 'users', currentUser.uid, 'apartments');
                const snapshot = await getCountFromServer(apartmentsRef);
                await updateDoc(doc(db, 'users', currentUser.uid), { apts: snapshot.data().count });
            } catch (countErr) {
                console.warn('No se pudo actualizar conteo de apts:', countErr);
            }
            window.appAlert('✅ Apartamento eliminado.');
        } catch (error) {
            console.error('Error deleting apartment:', error);
            window.appAlert('Error al eliminar el apartamento.', 'error');
        }
    };

    const handleAddCatalogExpense = (e) => {
        e.preventDefault();
        if (!newCatalogExpense.title) return;
        setFixedExpensesCatalog([
            ...fixedExpensesCatalog,
            { ...newCatalogExpense, id: Date.now(), defaultCost: parseFloat(newCatalogExpense.defaultCost) || 0 }
        ]);
        setNewCatalogExpense({ title: '', category: 'Servicios Básicos', defaultCost: '', impactsAliquota: true });
        window.appAlert('✅ Gasto frecuente añadido al catálogo.');
    };

    const openWhatsappMsg = (apto) => {
        const text = `Hola ${apto.owner}, te saludamos de la Junta de Condominio de ${condoName}. Recordamos amablemente el pago pendiente de tu cuota (Deuda: $${apto.debt.toFixed(2)}). ¡Gracias por tu colaboración!`;
        window.open(`https://wa.me/${apto.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleDetectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCondoSettings({
                    ...condoSettings,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                window.appAlert("✅ Ubicación detectada exitosamente.");
            }, (err) => {
                window.appAlert("No se pudo obtener tu ubicación. Verifica los permisos del navegador.", "error");
            });
        } else {
            window.appAlert("Tu navegador no soporta geolocalización.", "error");
        }
    };

    return (
        <section className="admin-dashboard-layout">
            {/* ADMIN SIDEBAR NAV */}
            <aside className="admin-sidebar">
                <div className="sidebar-menu">
                    <div className="sidebar-section-title">Principal</div>
                    <button className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <i className="fa-solid fa-gauge-high"></i> Dashboard
                    </button>
                    <button className={`sidebar-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
                        <i className="fa-solid fa-circle-check"></i> Aprobaciones {pendingApprovals.length > 0 && <span className="badge-amber" style={{marginLeft:'auto'}}>{pendingApprovals.length}</span>}
                    </button>
                    <button className={`sidebar-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                        <i className="fa-solid fa-money-bill-transfer"></i> Egresos & Recibos
                    </button>
                    <button className={`sidebar-item ${activeTab === 'owners' ? 'active' : ''}`} onClick={() => setActiveTab('owners')}>
                        <i className="fa-solid fa-users"></i> Propietarios
                    </button>

                    <div className="sidebar-section-title">Gestión</div>
                    <button className={`sidebar-item ${(activeTab === 'financials' || activeTab === 'reconciliation') ? 'active' : ''}`} onClick={() => setFinanzasExpanded(!finanzasExpanded)}>
                        <i className="fa-solid fa-chart-line"></i> Finanzas
                        <i className={`fa-solid fa-chevron-${finanzasExpanded ? 'up' : 'down'}`} style={{marginLeft:'auto'}}></i>
                    </button>
                    {finanzasExpanded && (
                        <div className="sidebar-sub-menu">
                            <button className={`sidebar-sub-item ${activeTab === 'financials' ? 'active' : ''}`} onClick={() => setActiveTab('financials')}>
                                Reportes Mensuales
                            </button>
                            <button className={`sidebar-sub-item ${activeTab === 'reconciliation' ? 'active' : ''}`} onClick={() => setActiveTab('reconciliation')}>
                                Conciliación Bancaria
                            </button>
                        </div>
                    )}
                    <button className={`sidebar-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>
                        <i className="fa-solid fa-gear"></i> Configuración
                    </button>
                </div>
            </aside>

            <div className="admin-content-area view-section active">

            {activeTab === 'dashboard' && (
                <>
                    {/* ADMIN TOOLBAR */}
                    <div className="admin-toolbar">
                <div className="toolbar-info">
                    <h3><i className="fa-solid fa-gauge-high"></i> Panel General de Administración</h3>
                    <p>Gestión transparente de cobros, aprobaciones y cartelera de gastos</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => onOpenExpensesReportModal(expenses, totalExpenses, totalCollected)}
                >
                    <i className="fa-solid fa-file-pdf"></i> Generar Reporte Mensual PDF
                </button>
            </div>

            {/* METRICAS FINANCIERAS */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="card-icon icon-blue">
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <div className="card-info">
                        <span>Recaudación del Mes</span>
                        <h3 className="text-emerald">${totalCollected.toFixed(2)}</h3>
                        <small>{apartments.length > 0 ? `${apartments.length} unidades registradas` : 'Sin unidades registradas'}</small>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon icon-rose">
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <div className="card-info">
                        <span>Total Cartera en Mora</span>
                        <h3 className="text-rose">${totalInMora.toFixed(2)}</h3>
                        <small>{apartments.filter(a => a.monthsDue > 0).length} Apartamentos pendientes</small>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-icon icon-amber">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div className="card-info">
                        <span>Pagos Por Validar</span>
                        <h3 className="text-amber">{pendingApprovals.length} En Cola</h3>
                        <small>Requieren revisión de comprobante</small>
                    </div>
                </div>
            </div>

                </>
            )}

            {activeTab === 'approvals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                    {/* PAGOS POR APROBAR */}
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3><i className="fa-solid fa-circle-check"></i> Cola de Validación de Pagos</h3>
                            <span className="badge-amber">{pendingApprovals.length} Pendientes</span>
                        </div>

                        <div className="pending-cards-list">
                            {pendingApprovals.length === 0 ? (
                                <p style={{ color: '#64748B', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                                    ✨ ¡Excelente! No hay pagos pendientes por aprobar.
                                </p>
                            ) : (
                                pendingApprovals.map((item) => (
                                    <div key={item.id} className="pending-item-card">
                                        <div className="pending-card-top">
                                            <span className="pending-title">Apto {item.apto} • {item.owner}</span>
                                            <span className="badge-emerald">${item.amount.toFixed(2)}</span>
                                        </div>

                                        <div className="pending-card-details">
                                            <span><strong>Mes:</strong> {item.month}</span>
                                            <span><strong>Ref:</strong> <code>{item.ref}</code></span>
                                            <span><strong>Método:</strong> {item.method}</span>
                                            <span><strong>Fecha:</strong> {item.date}</span>
                                        </div>

                                        <div className="pending-card-actions">
                                            <button
                                                className="btn-sm-outline"
                                                onClick={() => setViewingReceipt(item.photo)}
                                            >
                                                <i className="fa-solid fa-image"></i> Ver Comprobante
                                            </button>
                                            <button
                                                className="btn-sm-rose"
                                                onClick={() => onRejectPayment(item.id)}
                                            >
                                                <i className="fa-solid fa-xmark"></i> Rechazar
                                            </button>
                                            <button
                                                className="btn-sm-emerald"
                                                onClick={() => handleApprove(item)}
                                            >
                                                <i className="fa-solid fa-check"></i> Aprobar Pago
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'expenses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* FORMULARIO DE REGISTRO DE GASTO PUBLICO */}
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3><i className="fa-solid fa-plus-minus"></i> Registrar Gasto de Mantenimiento</h3>
                            <span className="badge-blue">Publicación Automática</span>
                        </div>

                        <form onSubmit={handleAddExpenseSubmit} className="activity-form-box">
                            <div className="form-grid-3">
                                <div className="form-group" style={{ gridColumn: selectedCatalogId ? 'span 1' : 'span 2' }}>
                                    <label>Concepto del Gasto</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            className="form-input"
                                            value={selectedCatalogId}
                                            onChange={handleCatalogSelection}
                                        >
                                            <option value="">-- Otro (Escribir concepto) --</option>
                                            {fixedExpensesCatalog.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {!selectedCatalogId && (
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Escribir Nuevo Concepto (Se guardará en la lista)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Ej: Mantenimiento Tanque"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Beneficiario</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ej: Juan Pérez / Empresa C.A."
                                        value={beneficiary}
                                        onChange={(e) => setBeneficiary(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Monto Gasto ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        placeholder="0.00"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        className="form-input"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Servicios Básicos">Servicios Básicos</option>
                                        <option value="Mantenimiento General">Mantenimiento General</option>
                                        <option value="Personal">Personal / Nómina</option>
                                        <option value="Seguridad y Control">Seguridad y Control</option>
                                        <option value="Reparaciones Mayores">Reparaciones Mayores</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Evento</label>
                                    <select
                                        className="form-input"
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                    >
                                        <option value="Mantenimiento Preventivo">Mantenimiento Preventivo</option>
                                        <option value="Reparación Ocasional">Reparación Ocasional</option>
                                        <option value="Pago de Nómina">Pago de Nómina</option>
                                        <option value="Servicio Mensual">Servicio Mensual</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '30px' }}>
                                        <input
                                            type="checkbox"
                                            checked={impactsAliquota}
                                            onChange={(e) => setImpactsAliquota(e.target.checked)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        ¿Afecta la Alícuota?
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URL Foto de Respaldo Inicial (Opcional)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://..."
                                    value={photo}
                                    onChange={(e) => setPhoto(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descripción del Trabajo Executado</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    placeholder="Detalla los insumos o empresa contratada..."
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn-emerald" style={{ width: '100%' }}>
                                <i className="fa-solid fa-bullhorn"></i> Publicar en Cartelera y Registrar Gasto
                            </button>
                        </form>
                    </div>
                    {/* HISTORIAL DE EGRESOS RECIENTES */}
                    <div className="panel-card">
                        <div className="panel-header">
                            <h3><i className="fa-solid fa-file-signature"></i> Gestión de Recibos y Egresos</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Concepto / Beneficiario</th>
                                        <th>Monto</th>
                                        <th>Recibo Firmado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map(act => (
                                        <tr key={act.id}>
                                            <td>{act.date}</td>
                                            <td>
                                                <strong>{act.title}</strong><br/>
                                                <small style={{color: '#64748b'}}>{act.beneficiary}</small>
                                            </td>
                                            <td>${act.cost.toFixed(2)}</td>
                                            <td>
                                                {act.signedReceiptUrl ? (
                                                    <span className="badge-emerald"><i className="fa-solid fa-check"></i> Subido</span>
                                                ) : (
                                                    <span className="badge-amber"><i className="fa-solid fa-clock"></i> Pendiente</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-sm-outline" onClick={() => onPrintExpenseReceipt(act)} title="Imprimir Recibo PDF">
                                                        <i className="fa-solid fa-print"></i>
                                                    </button>
                                                    {!act.signedReceiptUrl && uploadingReceiptId !== act.id && (
                                                        <button className="btn-sm-outline" onClick={() => setUploadingReceiptId(act.id)} title="Subir Firmado">
                                                            <i className="fa-solid fa-upload"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                {uploadingReceiptId === act.id && (
                                                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                                                        <input 
                                                            type="url" 
                                                            placeholder="URL del recibo firmado..." 
                                                            value={tempReceiptUrl} 
                                                            onChange={(e) => setTempReceiptUrl(e.target.value)}
                                                            style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }}
                                                        />
                                                        <button className="btn-sm-emerald" onClick={() => handleConfirmUpload(act.id)}><i className="fa-solid fa-check"></i></button>
                                                        <button className="btn-sm-rose" onClick={() => setUploadingReceiptId(null)}><i className="fa-solid fa-xmark"></i></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'owners' && (
                <div className="panel-card">
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3><i className="fa-solid fa-city"></i> Estado de Cuenta por Apartamento</h3>
                            <span className="badge-blue">{apartments.length} Unidades</span>
                        </div>
                        <button className="btn-primary" onClick={onIssueBills}>
                            <i className="fa-solid fa-paper-plane"></i> Emitir Recibos del Mes
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Apto</th>
                                    <th>Propietario</th>
                                    <th>Solvencia</th>
                                    <th>Deuda ($)</th>
                                    <th>Acción de Cobro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apartmentsLoading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>Cargando apartamentos...
                                    </td></tr>
                                ) : apartments.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                                        No hay apartamentos registrados. Ve a Configuración para añadir propiedades.
                                    </td></tr>
                                ) : (
                                apartments.map((ap) => (
                                    <tr key={ap.apto}>
                                        <td><strong>{ap.apto}</strong></td>
                                        <td>{ap.owner}</td>
                                        <td>
                                            {ap.monthsDue === 0 ? (
                                                <span className="status-badge status-approved">
                                                    <i className="fa-solid fa-check"></i> Al Día
                                                </span>
                                            ) : (
                                                <span className="status-badge status-rejected">
                                                    <i className="fa-solid fa-triangle-exclamation"></i> {ap.monthsDue}m Mora
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <strong className={ap.debt > 0 ? 'text-rose' : 'text-emerald'}>
                                                ${ap.debt.toFixed(2)}
                                            </strong>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    className="btn-sm-outline"
                                                    onClick={() => onOpenMonthlyBill(ap)}
                                                    title="Generar Recibo Mensual"
                                                >
                                                    <i className="fa-solid fa-file-invoice"></i> Recibo
                                                </button>
                                                {ap.debt > 0 ? (
                                                    <button
                                                        className="btn-whatsapp-cobro"
                                                        onClick={() => openWhatsappMsg(ap)}
                                                    >
                                                        <i className="fa-brands fa-whatsapp"></i> Cobrar
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', alignSelf: 'center', marginLeft: '5px' }}>
                                                        ✓ Al día
                                                    </span>
                                                )}
                                                <button
                                                    className="btn-sm-rose"
                                                    onClick={() => handleDeleteApartment(ap.id)}
                                                    title="Eliminar Apartamento"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'financials' && (
                <FinancialReports 
                    apartments={apartments}
                    expenses={expenses}
                    rentalIncomes={rentalIncomes}
                />
            )}

            {activeTab === 'reconciliation' && (
                <BankReconciliation 
                    bankTransactions={bankTransactions}
                    setBankTransactions={setBankTransactions}
                    expenses={expenses}
                    apartments={apartments}
                    rentalIncomes={rentalIncomes}
                />
            )}

            {activeTab === 'config' && (
                <div className="admin-grid" style={{ gridTemplateColumns: '1fr' }}>
                    
                    <div className="summary-grid">
                        <div className="summary-card">
                            <div className="card-icon icon-blue"><i className="fa-solid fa-building"></i></div>
                            <div className="card-info">
                                <span>Unidades Registradas</span>
                                <h3>{apartments.length} Aptos</h3>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="card-icon icon-emerald"><i className="fa-solid fa-chart-pie"></i></div>
                            <div className="card-info">
                                <span>Total Alícuotas</span>
                                <h3>{apartments.reduce((sum, a) => sum + (a.aliquotPercentage || 0), 0).toFixed(2)}%</h3>
                                <small>Debería sumar 100% idealmente</small>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="card-icon icon-amber"><i className="fa-solid fa-list"></i></div>
                            <div className="card-info">
                                <span>Catálogo de Gastos</span>
                                <h3>{fixedExpensesCatalog.length} Frecuentes</h3>
                            </div>
                        </div>
                    </div>

                    <div className="panel-card">
                        <div className="panel-header">
                            <h3><i className="fa-solid fa-id-card"></i> Datos del Condominio</h3>
                        </div>
                        <div className="activity-form-box">
                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label>Nombre del Edificio / Residencias</label>
                                    <input type="text" className="form-input" value={condoSettings.name} onChange={e => setCondoSettings({...condoSettings, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>RIF</label>
                                    <input type="text" className="form-input" value={condoSettings.rif} onChange={e => setCondoSettings({...condoSettings, rif: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Dirección del Condominio</label>
                                    <input type="text" className="form-input" value={condoSettings.address} onChange={e => setCondoSettings({...condoSettings, address: e.target.value})} placeholder="Ej: Av. Principal, La Florida..." />
                                </div>
                            </div>

                            {/* Map Section */}
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontWeight: '600', color: '#1E293B', fontSize: '14px' }}>Ubicación en el Mapa</label>
                                    <button type="button" className="btn-sm-outline" onClick={handleDetectLocation}>
                                        <i className="fa-solid fa-location-crosshairs"></i> Detectar mi ubicación
                                    </button>
                                </div>
                                <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', zIndex: 0 }}>
                                    {(condoSettings.lat && condoSettings.lng) ? (
                                        <MapContainer center={[condoSettings.lat, condoSettings.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; OpenStreetMap contributors'
                                            />
                                            <LocationMarker 
                                                position={{ lat: condoSettings.lat, lng: condoSettings.lng }} 
                                                setPosition={(pos) => setCondoSettings({ ...condoSettings, lat: pos.lat, lng: pos.lng })} 
                                            />
                                        </MapContainer>
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F1F5F9', color: '#64748B' }}>
                                            Haz clic en "Detectar mi ubicación" para inicializar el mapa
                                        </div>
                                    )}
                                </div>
                                <small style={{ color: '#64748B', display: 'block', marginTop: '8px' }}>
                                    Haz clic en el mapa para ajustar el marcador rojo a la ubicación exacta de las residencias.
                                </small>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div className="panel-card">
                            <div className="panel-header">
                                <h3><i className="fa-solid fa-house-chimney-user"></i> Registrar Apartamento</h3>
                            </div>
                            <form className="activity-form-box" onSubmit={handleAddApartment}>
                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label>Torre (Opcional)</label>
                                        <input type="text" className="form-input" placeholder="Ej: A" value={newApto.torre} onChange={e => setNewApto({...newApto, torre: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>N° Apto*</label>
                                        <input type="text" className="form-input" placeholder="Ej: 1-A" value={newApto.apto} onChange={e => setNewApto({...newApto, apto: e.target.value})} required/>
                                    </div>
                                    <div className="form-group">
                                        <label>% Alícuota*</label>
                                        <input type="number" step="0.01" className="form-input" placeholder="Ej: 2.5" value={newApto.aliquotPercentage} onChange={e => setNewApto({...newApto, aliquotPercentage: e.target.value})} required/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Propietario / Responsable*</label>
                                    <input type="text" className="form-input" placeholder="Nombre completo" value={newApto.owner} onChange={e => setNewApto({...newApto, owner: e.target.value})} required/>
                                </div>
                                <div className="form-group">
                                    <label>Correo Electrónico (Para Login)</label>
                                    <input type="email" className="form-input" placeholder="propietario@email.com (opcional)" value={newApto.email} onChange={e => setNewApto({...newApto, email: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Contraseña (Para Login)</label>
                                    <input type="password" className="form-input" placeholder="Min. 6 caracteres" value={newApto.password} onChange={e => setNewApto({...newApto, password: e.target.value})} minLength={6} disabled={!newApto.email} title={!newApto.email ? 'Primero ingresa un email' : ''} />
                                    <small style={{ color: '#64748B', display: 'block', marginTop: '4px', fontSize: '11px' }}>
                                        Si ingresas email y contraseña, se le creará una cuenta para que pueda ingresar al sistema.
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label>Teléfono (WhatsApp)</label>
                                    <input type="text" className="form-input" placeholder="+584120000000" value={newApto.phone} onChange={e => setNewApto({...newApto, phone: e.target.value})} />
                                </div>
                                <button type="submit" className="btn-primary" style={{width: '100%'}}>Añadir Propiedad</button>
                            </form>
                        </div>

                        <div className="panel-card">
                            <div className="panel-header">
                                <h3><i className="fa-solid fa-list-check"></i> Catálogo de Gastos Frecuentes</h3>
                            </div>
                            <form className="activity-form-box" onSubmit={handleAddCatalogExpense}>
                                <div className="form-group">
                                    <label>Concepto Frecuente</label>
                                    <input type="text" className="form-input" placeholder="Ej: Conserjería, Luz Pasillos..." value={newCatalogExpense.title} onChange={e => setNewCatalogExpense({...newCatalogExpense, title: e.target.value})} required/>
                                </div>
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select className="form-input" value={newCatalogExpense.category} onChange={e => setNewCatalogExpense({...newCatalogExpense, category: e.target.value})}>
                                        <option value="Servicios Básicos">Servicios Básicos</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Mantenimiento General">Mantenimiento General</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Costo Estimado ($)</label>
                                    <input type="number" step="0.01" className="form-input" placeholder="Opcional" value={newCatalogExpense.defaultCost} onChange={e => setNewCatalogExpense({...newCatalogExpense, defaultCost: e.target.value})}/>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '15px', marginBottom: '15px' }}>
                                        <input type="checkbox" checked={newCatalogExpense.impactsAliquota} onChange={(e) => setNewCatalogExpense({...newCatalogExpense, impactsAliquota: e.target.checked})} />
                                        ¿Afecta Alícuota de los Propietarios?
                                    </label>
                                </div>
                                <button type="submit" className="btn-emerald" style={{width: '100%'}}>Añadir al Catálogo</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL VER COMPROBANTE DE PAGO */}
            {viewingReceipt && (
                <div className="modal-backdrop" onClick={() => setViewingReceipt(null)}>
                    <div className="modal-card" style={{ maxWidth: '600px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, color: '#1E293B' }}><i className="fa-solid fa-image text-emerald"></i> Comprobante de Pago</h3>
                            <button onClick={() => setViewingReceipt(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
                        </div>
                        <img src={viewingReceipt} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', objectFit: 'contain' }} />
                        <div style={{ marginTop: '15px' }}>
                            <button className="btn-primary" onClick={() => window.open(viewingReceipt, '_blank')}>
                                <i className="fa-solid fa-arrow-up-right-from-square"></i> Abrir en Pestaña Nueva
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </section>
    );
};
