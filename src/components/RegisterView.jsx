import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export const RegisterView = ({ setRole }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [condoName, setCondoName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Guardar en Firestore con rol admin y estado pendiente
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                role: 'admin',
                status: 'pending',
                condoName,
                createdAt: new Date()
            });

            window.appAlert('✅ Registro exitoso. Tu cuenta está pendiente de aprobación por un Super Administrador.');
            // Opcionalmente cerrar sesión automáticamente o dejarlo que intente entrar y vea su estado
            setRole('login');
        } catch (err) {
            console.error(err);
            setError('Error al registrar. Intenta con otra contraseña o correo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="view-section active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div className="panel-card" style={{ maxWidth: '500px', width: '100%', padding: '30px', position: 'relative' }}>
                <button 
                    onClick={() => setRole('landing')}
                    style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '500' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Volver al Inicio
                </button>
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '30px' }}>
                    <i className="fa-solid fa-file-contract text-blue" style={{ fontSize: '36px', marginBottom: '10px' }}></i>
                    <h2>Solicitar Registro</h2>
                    <p style={{ color: '#64748B' }}>Crea una cuenta para administrar tu condominio con HabitApp.</p>
                </div>
                
                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="Ej. Luis Pérez"
                        />
                    </div>
                    <div className="form-group">
                        <label>Nombre del Condominio</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={condoName} 
                            onChange={(e) => setCondoName(e.target.value)} 
                            required 
                            placeholder="Ej. Residencias Palmas del Valle"
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Registrando...' : 'Solicitar Acceso'}
                    </button>
                </form>
                
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    <p>¿Ya tienes una cuenta?</p>
                    <button className="btn-sm-outline" onClick={() => setRole('login')} style={{ marginTop: '5px' }}>
                        Inicia Sesión
                    </button>
                </div>
            </div>
        </section>
    );
};
