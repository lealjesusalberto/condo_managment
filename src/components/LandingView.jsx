import React from 'react';

export const LandingView = ({ setRole }) => {
    return (
        <div className="landing-page fade-in">
            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-badge slide-up">🚀 El Software #1 en Gestión de Propiedades</div>
                    <h1 className="hero-title slide-up" style={{ animationDelay: '0.1s' }}>
                        La nueva era en la <span className="text-emerald">Administración de Condominios</span>
                    </h1>
                    <p className="hero-subtitle slide-up" style={{ animationDelay: '0.2s' }}>
                        Plataforma SaaS integral para gestionar edificios, automatizar recibos, y brindar total transparencia a los propietarios. Todo en la nube.
                    </p>
                    <div className="hero-cta slide-up" style={{ animationDelay: '0.3s' }}>
                        <button className="btn-emerald-lg" onClick={() => setRole('login')}>
                            Ingresar a mi Cuenta
                        </button>
                        <button className="btn-outline-light-lg" onClick={() => setRole('register')}>
                            Registrar mi Edificio
                        </button>
                    </div>
                    
                    {/* MOCKUP IMAGE (ANIMATED) */}
                    <div className="hero-mockup slide-up" style={{ animationDelay: '0.5s', marginTop: '60px' }}>
                        <img src="/mockup.png" alt="Dashboard Preview" className="mockup-img" />
                    </div>
                </div>
            </section>

            {/* STATISTICS SECTION */}
            <section className="stats-section">
                <div className="stat-card fade-in" style={{ animationDelay: '0.4s' }}>
                    <i className="fa-solid fa-building"></i>
                    <h2>+500</h2>
                    <p>Condominios Activos</p>
                </div>
                <div className="stat-card fade-in" style={{ animationDelay: '0.5s' }}>
                    <i className="fa-solid fa-users"></i>
                    <h2>+15,000</h2>
                    <p>Propietarios Felices</p>
                </div>
                <div className="stat-card fade-in" style={{ animationDelay: '0.6s' }}>
                    <i className="fa-solid fa-file-invoice-dollar"></i>
                    <h2>100%</h2>
                    <p>Transparencia Financiera</p>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Todo lo que necesitas para tu comunidad</h2>
                    <p>Funcionalidades diseñadas para administradores y propietarios.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fa-solid fa-money-check-dollar"></i></div>
                        <h3>Conciliación Bancaria</h3>
                        <p>Vincula pagos y recibos automáticamente, dile adiós a las hojas de cálculo.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fa-solid fa-chart-pie"></i></div>
                        <h3>Cálculo de Alícuotas</h3>
                        <p>Generación de deuda mensual dinámica basada en porcentajes de propiedad y gastos.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fa-solid fa-bullhorn"></i></div>
                        <h3>Cartelera de Transparencia</h3>
                        <p>Muro digital para que todos los vecinos vean facturas y obras en tiempo real.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><i className="fa-solid fa-file-pdf"></i></div>
                        <h3>Recibos PDF Automáticos</h3>
                        <p>Genera comprobantes oficiales listos para imprimir y firmar con un solo clic.</p>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="pricing-section">
                <div className="section-header">
                    <h2>Planes transparentes, sin sorpresas</h2>
                    <p>Elige el plan que mejor se adapte al tamaño de tu condominio.</p>
                </div>
                <div className="pricing-grid">
                    <div className="pricing-card">
                        <h3>Básico</h3>
                        <div className="price"><span>$</span>49<span>/mes</span></div>
                        <p className="pricing-desc">Para edificios pequeños.</p>
                        <ul>
                            <li><i className="fa-solid fa-check"></i> Hasta 30 apartamentos</li>
                            <li><i className="fa-solid fa-check"></i> Conciliación bancaria</li>
                            <li><i className="fa-solid fa-check"></i> Cartelera virtual</li>
                            <li><i className="fa-solid fa-check"></i> Soporte prioritario</li>
                        </ul>
                        <button className="btn-outline-primary-lg" onClick={() => setRole('register')}>Empezar Gratis</button>
                    </div>
                    <div className="pricing-card featured">
                        <div className="popular-badge">MÁS POPULAR</div>
                        <h3>Profesional</h3>
                        <div className="price"><span>$</span>149<span>/mes</span></div>
                        <p className="pricing-desc">Ideal para conjuntos residenciales medianos.</p>
                        <ul>
                            <li><i className="fa-solid fa-check"></i> Hasta 120 apartamentos</li>
                            <li><i className="fa-solid fa-check"></i> Conciliación bancaria</li>
                            <li><i className="fa-solid fa-check"></i> Cartelera virtual</li>
                            <li><i className="fa-solid fa-check"></i> Soporte prioritario</li>
                        </ul>
                        <button className="btn-primary-lg" onClick={() => setRole('register')}>Prueba Pro</button>
                    </div>
                    <div className="pricing-card">
                        <h3>Enterprise</h3>
                        <div className="price">A Medida</div>
                        <p className="pricing-desc">Para inmobiliarias y mega-conjuntos.</p>
                        <ul>
                            <li><i className="fa-solid fa-check"></i> Apartamentos ilimitados</li>
                            <li><i className="fa-solid fa-check"></i> Múltiples administradores</li>
                            <li><i className="fa-solid fa-check"></i> API y marca blanca</li>
                        </ul>
                        <button className="btn-outline-primary-lg">Contactar Ventas</button>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="testimonials-section">
                <div className="section-header" style={{ color: 'white' }}>
                    <h2 style={{ color: 'white' }}>Historias de Éxito</h2>
                    <p style={{ color: '#cbd5e1' }}>Lo que dicen nuestros clientes.</p>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <div className="stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p>"HabitApp redujo nuestra morosidad en un 40% en solo dos meses. La conciliación es mágica."</p>
                        <div className="author">
                            <div className="author-avatar">CM</div>
                            <div>
                                <strong>Carlos Medina</strong>
                                <span>Administrador, Torre Horizonte</span>
                            </div>
                        </div>
                    </div>
                    <div className="testimonial-card">
                        <div className="stars">
                            <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                        </div>
                        <p>"Como propietario, por fin entiendo qué estoy pagando. La transparencia me da mucha tranquilidad."</p>
                        <div className="author">
                            <div className="author-avatar">LV</div>
                            <div>
                                <strong>Laura Vargas</strong>
                                <span>Residente, Villas del Mar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="landing-footer">
                <div className="footer-brand">
                    <i className="fa-solid fa-building-user text-emerald" style={{ fontSize: '24px' }}></i>
                    <h2>Habit<span style={{ color: '#10B981' }}>App</span></h2>
                </div>
                <p>&copy; 2026 HabitApp SaaS. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};
