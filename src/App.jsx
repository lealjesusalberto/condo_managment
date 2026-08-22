import React, { useState } from 'react';
import { Header } from './components/Header';
import { OwnerView } from './components/OwnerView';
import { AdminView } from './components/AdminView';
import { ReportPaymentModal } from './components/ReportPaymentModal';
import { OfficialReceiptModal } from './components/OfficialReceiptModal';
import { ExpenseReceiptModal } from './components/ExpenseReceiptModal';
import { MonthlyBillModal } from './components/MonthlyBillModal';
import { LandingView } from './components/LandingView';
import { SuperAdminView } from './components/SuperAdminView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useEffect } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './styles.css';
import './landing.css';
import './sidebar.css';

export function App() {
    const [currentRole, setCurrentRole] = useState('landing'); // 'landing', 'login', 'register', 'superadmin', 'admin', 'owner'
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { rate: exchangeRate, loading: exchangeLoading } = useExchangeRate();
    const [globalAlert, setGlobalAlert] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        window.appAlert = (message, type = 'info') => {
            setGlobalAlert({ show: true, message, type });
        };

        // Inicializar Super Admin si no existe
        const initSuperAdmin = async () => {
            try {
                const res = await createUserWithEmailAndPassword(auth, 'lealjesusalberto@gmail.com', 'condo.adminpass.uio');
                await setDoc(doc(db, 'users', res.user.uid), {
                    email: 'lealjesusalberto@gmail.com',
                    role: 'superadmin',
                    name: 'Súper Administrador',
                    status: 'approved'
                });
            } catch (e) {
                // Si ya existe (auth/email-already-in-use), se ignora
            }
        };
        initSuperAdmin();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        setCurrentRole(data.role);
                    } else {
                        // Fallback
                        if (currentUser.email === 'lealjesusalberto@gmail.com') {
                            setCurrentRole('superadmin');
                        } else {
                            setCurrentRole('owner');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user role from Firestore:", error);
                    // Fallback in case of permission error
                    if (currentUser.email === 'lealjesusalberto@gmail.com') {
                        setCurrentRole('superadmin');
                    } else {
                        setCurrentRole('owner');
                    }
                }
            } else {
                setUser(null);
                setUserData(null);
                if (currentRole !== 'landing' && currentRole !== 'register') {
                    setCurrentRole('landing');
                }
            }
            setLoadingAuth(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        setCurrentRole('landing');
    };

    // Official Receipt Modal state
    const [receiptModal, setReceiptModal] = useState({
        isOpen: false,
        type: 'single', // 'single' or 'expenses'
        data: null
    });

    const [billsIssued, setBillsIssued] = useState(false);

    const [monthlyBillModal, setMonthlyBillModal] = useState({
        isOpen: false,
        data: null
    });


    const [condoSettings, setCondoSettings] = useState({
        name: 'Residencias Palmas del Valle',
        rif: 'J-40192841-0',
        address: 'Av. Principal, La Florida',
        lat: 10.4806,
        lng: -66.9036
    });

    const [fixedExpensesCatalog, setFixedExpensesCatalog] = useState([]);

    // Current Owner Context
    const [currentOwner] = useState({
        apto: '',
        torre: '',
        name: '',
        phone: '',
        aliquotPercentage: 0,
        monthsDue: 0,
        status: 'ok'
    });

    // Roster of Apartments
    const [apartments, setApartments] = useState([]);

    // Payment History for Owner (Apto 4B)
    const [ownerPayments, setOwnerPayments] = useState([]);

    // Pending Approvals Queue (Admin)
    const [pendingApprovals, setPendingApprovals] = useState([]);

    // Transparency Feed (Activities & Works)
    const [activities, setActivities] = useState([]);

    // Expenses List for Admin Reports
    const [expenses, setExpenses] = useState([]);

    // Rental Incomes
    const [rentalIncomes, setRentalIncomes] = useState([]);

    // Bank Transactions (For Reconciliation)
    const [bankTransactions, setBankTransactions] = useState([]);

    // Expense Receipt Modal
    const [expenseReceiptModal, setExpenseReceiptModal] = useState({
        isOpen: false,
        data: null
    });


    // Open Single Payment Receipt Modal
    const handleOpenSingleReceiptModal = (payment) => {
        setReceiptModal({
            isOpen: true,
            type: 'single',
            data: {
                payment,
                ownerInfo: currentOwner
            }
        });
    };

    // Open Monthly Expenses Report Modal
    const handleOpenExpensesReportModal = (expensesList, totalExpenses, totalIncome) => {
        setReceiptModal({
            isOpen: true,
            type: 'expenses',
            data: {
                expenses: expensesList,
                totalExpenses,
                totalIncome
            }
        });
    };

    // Open Expense Receipt Print Modal
    const handleOpenExpenseReceiptPrint = (expense) => {
        setExpenseReceiptModal({
            isOpen: true,
            data: expense
        });
    };

    // Handle new payment reported by owner
    const handleNewPaymentReported = (newPayment) => {
        setOwnerPayments([newPayment, ...ownerPayments]);
        const pendingItem = {
            id: newPayment.id,
            apto: currentOwner.apto,
            owner: currentOwner.name,
            month: newPayment.month,
            amount: newPayment.amount,
            date: newPayment.date,
            ref: newPayment.ref,
            method: newPayment.method,
            photo: newPayment.photo
        };
        setPendingApprovals([pendingItem, ...pendingApprovals]);
        window.appAlert('✅ ¡Pago enviado exitosamente a la Junta de Condominio para su validación!');
    };

    // Handle Admin Approving a Payment
    const handleApprovePayment = (item) => {
        setPendingApprovals(pendingApprovals.filter(p => p.id !== item.id));
        setApartments(apartments.map(ap => {
            if (ap.apto === item.apto) {
                const newMonthsDue = Math.max(0, ap.monthsDue - 1);
                const newDebt = Math.max(0, ap.debt - item.amount);
                return { ...ap, monthsDue: newMonthsDue, debt: newDebt };
            }
            return ap;
        }));
        setOwnerPayments(ownerPayments.map(p => {
            if (p.id === item.id) {
                return { ...p, status: 'approved' };
            }
            return p;
        }));
    };

    // Handle Admin Rejecting a Payment
    const handleRejectPayment = (itemId) => {
        setPendingApprovals(pendingApprovals.filter(p => p.id !== itemId));
        setOwnerPayments(ownerPayments.map(p => {
            if (p.id === itemId) {
                return { ...p, status: 'rejected' };
            }
            return p;
        }));
    };

    // Handle Adding New Maintenance Expense
    const handleAddExpense = (newExp) => {
        setExpenses([newExp, ...expenses]);
        setActivities([{
            id: newExp.id,
            title: newExp.title,
            category: newExp.category,
            date: newExp.date,
            cost: newExp.cost,
            desc: newExp.desc,
            photo: newExp.photo,
            beneficiary: newExp.beneficiary,
            eventType: newExp.eventType,
            impactsAliquota: newExp.impactsAliquota,
            signedReceiptUrl: newExp.signedReceiptUrl
        }, ...activities]);
    };

    const handleUploadExpenseReceipt = (expenseId, fileUrl) => {
        setActivities(activities.map(act => act.id === expenseId ? { ...act, signedReceiptUrl: fileUrl, photo: fileUrl } : act));
        // The photo field is also updated so it can be shown in the transparency feed if preferred.
    };

    const handleOpenMonthlyBill = (apto) => {
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.cost, 0);
        setMonthlyBillModal({
            isOpen: true,
            data: {
                ownerInfo: apto,
                expenses: expenses,
                totalExpenses: totalExpenses
            }
        });
    };

    // Calculated Monthly Fee based on dynamic aliquots
    const totalExpensesAliquota = expenses.filter(e => e.impactsAliquota).reduce((acc, curr) => acc + curr.cost, 0);
    const calculatedMonthlyFee = totalExpensesAliquota * (currentOwner.aliquotPercentage / 100);

    const renderGlobalAlert = () => {
        if (!globalAlert.show) return null;
        return (
            <div className="modal-backdrop" style={{ zIndex: 9999 }}>
                <div className="modal-card">
                    <button className="modal-close" onClick={() => setGlobalAlert({ ...globalAlert, show: false })}>×</button>
                    <div className="modal-header">
                        {globalAlert.type === 'success' || globalAlert.message.includes('✅') ? (
                            <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', color: '#10B981', marginBottom: '15px' }}></i>
                        ) : globalAlert.message.includes('Error') ? (
                            <i className="fa-solid fa-circle-xmark" style={{ fontSize: '48px', color: '#EF4444', marginBottom: '15px' }}></i>
                        ) : (
                            <i className="fa-solid fa-circle-info" style={{ fontSize: '48px', color: '#1E40AF', marginBottom: '15px' }}></i>
                        )}
                        <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)' }}>
                            {globalAlert.type === 'success' || globalAlert.message.includes('✅') ? 'Éxito' : 'Aviso'}
                        </h3>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '16px', color: '#475569', lineHeight: '1.5' }}>
                        {globalAlert.message.replace('✅ ', '')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                        <button className="btn-primary" onClick={() => setGlobalAlert({ ...globalAlert, show: false })}>Aceptar</button>
                    </div>
                </div>
            </div>
        );
    };

    if (loadingAuth) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
                <p>Cargando aplicación...</p>
            </div>
        );
    }

    if (currentRole === 'landing') {
        return (
            <>
                <LandingView setRole={setCurrentRole} />
                {renderGlobalAlert()}
            </>
        );
    }

    if (currentRole === 'login') {
        return (
            <div className="auth-layout">
                <LoginView setRole={setCurrentRole} />
                {renderGlobalAlert()}
            </div>
        );
    }

    if (currentRole === 'register') {
        return (
            <div className="auth-layout">
                <RegisterView setRole={setCurrentRole} />
                {renderGlobalAlert()}
            </div>
        );
    }

    if (currentRole === 'superadmin') {
        return (
            <div className="app-layout">
                <header className="topbar">
                    <div className="brand">
                        <div className="brand-icon">
                            <i className="fa-solid fa-server"></i>
                        </div>
                        <div className="brand-info">
                            <h1>HabitApp SaaS</h1>
                            <p>Súper Administrador Global</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-sm-outline" style={{ border: '1px solid #E2E8F0', color: '#64748B', backgroundColor: 'white' }}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Salir
                    </button>
                </header>
                <main className="main-content">
                    <SuperAdminView 
                        onLogout={handleLogout} 
                        exchangeRate={exchangeRate}
                        exchangeLoading={exchangeLoading}
                    />
                </main>
                {renderGlobalAlert()}
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Header
                currentRole={currentRole}
                setRole={setCurrentRole}
                condoName={condoSettings.name}
                currentOwner={currentOwner}
                exchangeRate={exchangeRate}
                exchangeLoading={exchangeLoading}
                onLogout={handleLogout}
                userData={userData}
            />

            <main className="main-content">
                {currentRole === 'owner' ? (
                    <OwnerView
                        currentOwner={currentOwner}
                        fullOwnerData={apartments.find(a => a.apto === currentOwner.apto) || currentOwner}
                        ownerPayments={ownerPayments}
                        activities={activities}
                        monthlyFee={calculatedMonthlyFee}
                        totalExpensesAliquota={totalExpensesAliquota}
                        onOpenReportModal={() => setIsReportModalOpen(true)}
                        onOpenReceiptModal={handleOpenSingleReceiptModal}
                        billsIssued={billsIssued}
                        onOpenMonthlyBill={handleOpenMonthlyBill}
                    />
                ) : (
                    <AdminView
                        apartments={apartments}
                        setApartments={setApartments}
                        condoSettings={condoSettings}
                        setCondoSettings={setCondoSettings}
                        fixedExpensesCatalog={fixedExpensesCatalog}
                        setFixedExpensesCatalog={setFixedExpensesCatalog}
                        pendingApprovals={pendingApprovals}
                        onApprovePayment={handleApprovePayment}
                        onRejectPayment={handleRejectPayment}
                        onAddExpense={handleAddExpense}
                        activities={activities}
                        onUploadExpenseReceipt={handleUploadExpenseReceipt}
                        onPrintExpenseReceipt={handleOpenExpenseReceiptPrint}
                        expenses={expenses}
                        rentalIncomes={rentalIncomes}
                        bankTransactions={bankTransactions}
                        setBankTransactions={setBankTransactions}
                        condoName={condoSettings.name}
                        onOpenExpensesReportModal={handleOpenExpensesReportModal}
                        onOpenMonthlyBill={handleOpenMonthlyBill}
                        onIssueBills={() => {
                            setBillsIssued(true);
                            window.appAlert('✅ Todos los recibos del mes han sido emitidos a los propietarios.');
                        }}
                        userData={userData}
                        onLogout={handleLogout}
                    />
                )}
            </main>

            <ReportPaymentModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleNewPaymentReported}
                monthlyFee={calculatedMonthlyFee}
            />

            <OfficialReceiptModal
                isOpen={receiptModal.isOpen}
                onClose={() => setReceiptModal({ ...receiptModal, isOpen: false })}
                type={receiptModal.type}
                data={receiptModal.data}
                condoName={condoSettings.name}
            />

            <ExpenseReceiptModal
                isOpen={expenseReceiptModal.isOpen}
                onClose={() => setExpenseReceiptModal({ ...expenseReceiptModal, isOpen: false })}
                data={expenseReceiptModal.data}
                condoName={condoSettings.name}
            />

            <MonthlyBillModal
                isOpen={monthlyBillModal.isOpen}
                onClose={() => setMonthlyBillModal({ ...monthlyBillModal, isOpen: false })}
                data={monthlyBillModal.data}
                condoName={condoSettings.name}
            />
        </div>
    );
}

export default App;
