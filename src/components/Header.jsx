import React from 'react';

export const Header = ({ currentRole, setRole, condoName, currentOwner, exchangeRate, exchangeLoading, onLogout, userData, apartmentsCount }) => {
    return (
        <header className="topbar">
            <div className="brand">
                <div className="brand-icon">
                    <i className="fa-solid fa-building-user"></i>
                </div>
                <div className="brand-info">
                    <h1>Habit<span className="brand-highlight">App</span></h1>
                    <p>{userData?.condoName || condoName} • {apartmentsCount} Apartamentos</p>
                </div>
            </div>
            
            {/* TASA BCV INDICATOR */}
            <div className="bcv-indicator" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <i className="fa-solid fa-money-bill-trend-up text-emerald" style={{ marginRight: '8px' }}></i>
                <div>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: '1' }}>Tasa BCV Oficial</span>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>
                        {exchangeLoading ? 'Cargando...' : `Bs. ${exchangeRate?.toFixed(2) || '36.50'}`}
                    </strong>
                </div>
            </div>

            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar">
                        {currentRole === 'owner' ? 'PR' : currentRole === 'superadmin' ? 'SA' : (userData?.name?.substring(0, 2).toUpperCase() || 'AD')}
                    </div>
                    <div className="user-details">
                        <strong>
                            {currentRole === 'owner' ? currentOwner.name : currentRole === 'superadmin' ? 'Super Admin' : (userData?.name || 'Junta de Condominio')}
                        </strong>
                        <span>
                            {currentRole === 'owner' ? `Apto ${currentOwner.apto}` : currentRole === 'superadmin' ? 'SaaS Management' : 'Administrador'}
                        </span>
                    </div>
                </div>
                
                <button 
                    onClick={onLogout}
                    className="btn-sm-outline" 
                    style={{ border: '1px solid #E2E8F0', color: '#64748B', backgroundColor: 'white' }}
                >
                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
                </button>
            </div>
        </header>
    );
};
