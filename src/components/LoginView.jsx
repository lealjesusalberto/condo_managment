import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const LoginView = ({ setRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Buscar el rol del usuario en Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setRole(userData.role);
            } else {
                setError('Usuario no tiene un rol asignado en la base de datos.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="view-section active" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="panel-card" style={{ maxWidth: '400px', width: '100%', padding: '30px', position: 'relative' }}>
                <button 
                    onClick={() => setRole('landing')}
                    style={{ position: 'absolute', top: '20px', left: '20px', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '500' }}
                >
                    <i className="fa-solid fa-arrow-left"></i> Volver al Inicio
                </button>
                <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '30px' }}>
                    <i className="fa-solid fa-building-user text-emerald" style={{ fontSize: '36px', marginBottom: '10px' }}></i>
                    <h2>Iniciar Sesión</h2>
                    <p style={{ color: '#64748B' }}>Ingresa a tu cuenta de HabitApp</p>
                </div>
                
                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>
                
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    <p>¿Eres administrador de condominio y no tienes cuenta?</p>
                    <button className="btn-sm-outline" onClick={() => setRole('register')} style={{ marginTop: '5px' }}>
                        Regístrate aquí
                    </button>
                </div>
            </div>
        </section>
    );
};
