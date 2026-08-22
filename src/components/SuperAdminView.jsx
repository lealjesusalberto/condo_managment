import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export const SuperAdminView = ({ onLogout, exchangeRate, exchangeLoading }) => {
    // Mock data for condos registered in the SaaS
    const [condos, setCondos] = useState([
        { id: 101, name: 'Residencias Palmas del Valle', admin: 'Luis Pérez', status: 'approved', apts: 120, plan: 'Pro', lat: 10.4806, lng: -66.9036 },
        { id: 102, name: 'Torre Empresarial Centro', admin: 'María Gómez', status: 'approved', apts: 45, plan: 'Basic', lat: 10.4900, lng: -66.8800 },
        { id: 103, name: 'Condominio Los Robles', admin: 'Carlos Ruiz', status: 'pending', apts: 80, plan: 'Trial', lat: 10.4500, lng: -66.9500 },
        { id: 104, name: 'Edificio El Mirador', admin: 'Ana Silva', status: 'pending', apts: 24, plan: 'Trial', lat: 10.4750, lng: -66.9200 }
    ]);

    const handleApprove = (id) => {
        setCondos(condos.map(c => c.id === id ? { ...c, status: 'approved' } : c));
        window.appAlert('✅ Administrador y condominio aprobados exitosamente.');
    };

    const handleReject = (id) => {
        setCondos(condos.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    };

    return (
        <section className="view-section active">
            <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="summary-card">
                    <div className="card-icon icon-emerald"><i className="fa-solid fa-money-bill-trend-up"></i></div>
                    <div className="card-info">
                        <span>Tasa BCV Oficial</span>
                        <h3 className="text-emerald">{exchangeLoading ? 'Cargando...' : `Bs. ${exchangeRate?.toFixed(2) || '36.50'}`}</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon icon-emerald"><i className="fa-solid fa-server"></i></div>
                    <div className="card-info">
                        <span>Estado SaaS</span>
                        <h3 className="text-emerald">Operativo</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon icon-blue"><i className="fa-solid fa-building"></i></div>
                    <div className="card-info">
                        <span>Total Condominios</span>
                        <h3>{condos.filter(c => c.status === 'approved').length} Activos</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon icon-amber"><i className="fa-solid fa-user-clock"></i></div>
                    <div className="card-info">
                        <span>Pendientes Aprobación</span>
                        <h3>{condos.filter(c => c.status === 'pending').length} Solicitudes</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon icon-emerald"><i className="fa-solid fa-money-bill-trend-up"></i></div>
                    <div className="card-info">
                        <span>Ingreso Mensual (MRR)</span>
                        <h3>$1,250.00</h3>
                    </div>
                </div>
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                <div className="panel-card">
                    <div className="panel-header">
                        <h3><i className="fa-solid fa-earth-americas"></i> Mapa Global de Operaciones</h3>
                    </div>
                    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', zIndex: 0 }}>
                        <MapContainer center={[10.4806, -66.9036]} zoom={12} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                            {condos.map(c => c.lat && c.lng && (
                                <Marker key={c.id} position={[c.lat, c.lng]} icon={customIcon}>
                                    <Popup>
                                        <strong>{c.name}</strong><br/>
                                        <small>Admin: {c.admin}</small><br/>
                                        <span className={`status-badge ${c.status === 'approved' ? 'status-approved' : 'status-pending'}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                                            {c.plan} ({c.apts} apts)
                                        </span>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>

            <div className="admin-grid" style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
                <div className="panel-card">
                    <div className="panel-header">
                        <h3><i className="fa-solid fa-list-check"></i> Gestión de Condominios y Administradores</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre del Condominio</th>
                                    <th>Administrador Responsable</th>
                                    <th>Unidades</th>
                                    <th>Plan SaaS</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {condos.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>#{c.id}</strong></td>
                                        <td>{c.name}</td>
                                        <td>{c.admin}</td>
                                        <td>{c.apts}</td>
                                        <td><span className="badge-blue">{c.plan}</span></td>
                                        <td>
                                            {c.status === 'approved' && <span className="status-badge status-approved">Aprobado</span>}
                                            {c.status === 'pending' && <span className="status-badge status-pending">En Revisión</span>}
                                            {c.status === 'rejected' && <span className="status-badge status-rejected">Rechazado</span>}
                                        </td>
                                        <td>
                                            {c.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-sm-emerald" onClick={() => handleApprove(c.id)}>
                                                        <i className="fa-solid fa-check"></i>
                                                    </button>
                                                    <button className="btn-sm-rose" onClick={() => handleReject(c.id)}>
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-sm-outline">
                                                    <i className="fa-solid fa-eye"></i> Ver Detalles
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button className="btn-sm-outline" onClick={onLogout}>Cerrar Sesión (Volver al Landing)</button>
            </div>
        </section>
    );
};
