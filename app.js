const { useState, useEffect, createContext, useContext } = React;
const {
    LogIn,
    UserPlus,
    Dumbbell,
    LogOut,
    ArrowLeft,
    PlusCircle,
    Save,
    Trash2,
    User,
    Users,
    ClipboardList,
    DollarSign,
    BookCopy,
    CheckSquare,
    Square,
    Settings,
    ChevronsRight,
    Coffee,
    HeartPulse,
    Repeat,
    Ruler,
    AlertTriangle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Timer,
    Edit,
    Home,
    X,
    Share
} = LucideReact;

// --- GERENCIADOR DE DADOS (LocalStorage) ---
const db = {
    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Erro ao ler do localStorage: ${key}`, error);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Erro ao salvar no localStorage: ${key}`, error);
        }
    }
};

// --- INICIALIZAÇÃO DO BANCO DE DADOS LOCAL ---
const initializeLocalDb = () => {
    if (!db.getItem('gym_users')) db.setItem('gym_users', [{ id: 'admin_user_01', name: 'Admin', email: 'admin@academia.com', password: 'admin123', role: 'admin' }]);
    if (!db.getItem('gym_plans')) db.setItem('gym_plans', [{ id: `plan_${Date.now()}`, name: 'Plano Mensal', value: 100, durationInMonths: 1 }]);
    if (!db.getItem('gym_workouts')) db.setItem('gym_workouts', []);
    if (!db.getItem('gym_training_sheets')) db.setItem('gym_training_sheets', []);
    if (!db.getItem('gym_settings')) db.setItem('gym_settings', { openDays: [1, 2, 3, 4, 5], gymName: 'Academia App' });
    if (!db.getItem('gym_measurements')) db.setItem('gym_measurements', []);
    if (!db.getItem('gym_training_history')) db.setItem('gym_training_history', []);
};

// --- CONTEXTO DE AUTENTICAÇÃO ---
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loggedInUser = db.getItem('gym_current_user');
        if (loggedInUser) setUser(loggedInUser);
        setLoading(false);
    }, []);
    const login = (email, password) => {
        const foundUser = (db.getItem('gym_users') || []).find(u => u.email === email && u.password === password);
        if (foundUser) {
            db.setItem('gym_current_user', foundUser);
            setUser(foundUser);
            return { success: true };
        }
        return { success: false, message: 'Email ou senha inválidos.' };
    };
    const logout = () => {
        db.setItem('gym_current_user', null);
        setUser(null);
    };
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        db.setItem('gym_current_user', updatedUserData);
        const users = db.getItem('gym_users') || [];
        const userIndex = users.findIndex(u => u.id === updatedUserData.id);
        if (userIndex > -1) {
            users[userIndex] = updatedUserData;
            db.setItem('gym_users', users);
        }
    }
    const value = { user, login, logout, loading, updateUser };
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
const useAuth = () => useContext(AuthContext);

// --- COMPONENTES DE UI ---
const Spinner = () => <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
const CustomModal = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
            <p className="mb-4 text-gray-700">{message}</p>
            <button onClick={onClose} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Fechar</button>
        </div>
    </div>
);
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <p className="my-2 text-gray-600">{message}</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
const ProgressBar = ({ value }) => {
    const progress = Math.min(100, Math.max(0, value));
    const colorClass = progress < 40 ? 'bg-blue-500' : progress < 80 ? 'bg-indigo-500' : 'bg-green-500';
    return (<div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner"><div className={`h-4 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${progress}%` }}></div></div>);
};

const TimerModal = ({ isOpen, onClose, initialTime }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (!isOpen) return;
        setTimeLeft(initialTime);
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    playSound();
                    onClose();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, initialTime, onClose]);

    const playSound = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    if (!isOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-full shadow-xl text-center w-64 h-64 flex flex-col justify-center items-center">
                <p className="text-6xl font-mono font-bold text-gray-800">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Parar</button>
            </div>
        </div>
    );
};


// --- EDITOR DE TREINO (Reutilizável) ---
const WorkoutEditor = ({ workoutData, onSave, ownerId }) => {
    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', notes: '', restTime: '' }]);
    const [loading, setLoading] = useState(false);
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });

    useEffect(() => {
        if (workoutData) {
            setWorkoutName(workoutData.name || '');
            setExercises(workoutData.exercises?.length > 0 ? JSON.parse(JSON.stringify(workoutData.exercises)) : [{ name: '', sets: '', reps: '', notes: '', restTime: '' }]);
        }
    }, [workoutData]);

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };
    const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', notes: '', restTime: '' }]);
    const removeExercise = (index) => setExercises(exercises.filter((_, i) => i !== index));

    const handleSave = () => {
        if (!workoutName.trim()) {
            setModalInfo({ show: true, message: 'Por favor, dê um nome para o treino.' });
            return;
        }
        setLoading(true);
        const finalWorkoutData = {
            id: workoutData?.id || `workout_${Date.now()}`,
            name: workoutName,
            exercises: exercises,
            ownerId: ownerId,
            updatedAt: new Date().toISOString()
        };
        onSave(finalWorkoutData);
        setTimeout(() => {
            setLoading(false);
            setModalInfo({ show: true, message: 'Treino salvo com sucesso!' });
        }, 500);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <div className="space-y-4">
                <input type="text" placeholder="Nome do Treino (ex: Treino A - Peito)" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                {exercises.map((ex, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3 relative">
                        <h4 className="font-semibold text-gray-600">Exercício {index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Nome do Exercício" value={ex.name} onChange={e => handleExerciseChange(index, 'name', e.target.value)} className="md:col-span-3 w-full px-3 py-2 border rounded-md" />
                            <input type="text" placeholder="Séries" value={ex.sets} onChange={e => handleExerciseChange(index, 'sets', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            <input type="text" placeholder="Repetições" value={ex.reps} onChange={e => handleExerciseChange(index, 'reps', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" placeholder="Descanso (segundos)" value={ex.restTime} onChange={e => handleExerciseChange(index, 'restTime', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                            <input type="text" placeholder="Observações" value={ex.notes} onChange={e => handleExerciseChange(index, 'notes', e.target.value)} className="md:col-span-3 w-full px-3 py-2 border rounded-md" />
                        </div>
                        <button onClick={() => removeExercise(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button>
                    </div>
                ))}
                <button onClick={addExercise} className="flex items-center text-blue-500 font-medium py-2 px-4 rounded-lg hover:bg-blue-50"><PlusCircle className="h-5 w-5 mr-2" />Adicionar Exercício</button>
                <button onClick={handleSave} disabled={loading} className="w-full flex justify-center items-center bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 shadow disabled:bg-green-300"><Save className="h-5 w-5 mr-2" />{loading ? 'Salvando...' : 'Salvar Treino'}</button>
            </div>
        </div>
    );
};

// --- PÁGINAS DO ADMIN ---
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const handleLogin = (e) => {
        e.preventDefault(); setError('');
        const result = login(email, password);
        if (!result.success) setError(result.message);
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center"><Dumbbell className="h-12 w-12 text-blue-500" /><h2 className="mt-4 text-2xl font-bold text-center">Academia App</h2><p className="text-gray-600">Bem-vindo(a)!</p></div>
                <form onSubmit={handleLogin} className="space-y-6">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
                    <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Entrar</button>
                </form>
            </div>
        </div>
    );
};

const FinancialSummary = () => {
    const [summary, setSummary] = useState({ received: 0, toReceive: 0, activeMembers: 0 });
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);

    useEffect(() => {
        const users = db.getItem('gym_users') || [];
        const plans = db.getItem('gym_plans') || [];
        const members = users.filter(u => u.role === 'member');

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let received = 0, toReceive = 0;
        members.forEach(member => {
            const plan = plans.find(p => p.id === member.planId);
            if (!plan) return;
            const payment = member.paymentHistory?.find(p => p.month === currentMonth && p.year === currentYear);
            if (payment?.status === 'Pago') received += plan.value;
            else toReceive += plan.value;
        });
        setSummary({ received, toReceive, activeMembers: members.length });

        const revenue = {};
        members.forEach(member => {
            const plan = plans.find(p => p.id === member.planId);
            if (!plan) return;
            member.paymentHistory?.forEach(p => {
                if (p.status === 'Pago') {
                    const monthYear = `${p.month + 1}/${p.year}`;
                    revenue[monthYear] = (revenue[monthYear] || 0) + plan.value;
                }
            });
        });
        const sortedRevenue = Object.entries(revenue)
            .sort(([a], [b]) => new Date(a.split('/')[1], a.split('/')[0] - 1) - new Date(b.split('/')[1], b.split('/')[0] - 1))
            .slice(-6);
        setMonthlyRevenue(sortedRevenue);

    }, []);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg shadow"><h4 className="text-sm font-semibold text-green-800">Recebido (Mês Atual)</h4><p className="text-2xl font-bold text-green-900">R$ {summary.received.toFixed(2)}</p></div>
                <div className="bg-yellow-100 p-4 rounded-lg shadow"><h4 className="text-sm font-semibold text-yellow-800">A Receber (Mês Atual)</h4><p className="text-2xl font-bold text-yellow-900">R$ {summary.toReceive.toFixed(2)}</p></div>
                <div className="bg-blue-100 p-4 rounded-lg shadow"><h4 className="text-sm font-semibold text-blue-800">Alunos Ativos</h4><p className="text-2xl font-bold text-blue-900">{summary.activeMembers}</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Receita Mensal (Últimos 6 meses)</h3>
                {monthlyRevenue.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {monthlyRevenue.map(([monthYear, total]) => (
                            <div key={monthYear} className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="font-bold text-gray-800">R$ {total.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{monthYear}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Nenhum histórico de receita encontrado.</p>
                )}
            </div>
        </>
    );
};

const AdminDashboard = ({ setPage, setCurrentMemberId }) => {
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Painel Principal</h2>
            <FinancialSummary />
        </div>
    );
};

const StudentsPage = ({ setPage, setCurrentMemberId }) => {
    const [members, setMembers] = useState([]);
    useEffect(() => { setMembers((db.getItem('gym_users') || []).filter(u => u.role === 'member')); }, []);
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Alunos</h2>
                <button onClick={() => setPage('addMember')} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow"><UserPlus className="h-5 w-5 mr-2" />Adicionar</button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                {members.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum aluno cadastrado ainda.</p>
                ) : (
                    <ul className="space-y-3">{members.map(member => (<li key={member.id} onClick={() => { setCurrentMemberId(member.id); setPage('memberDetails'); }} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"><div><p className="font-semibold">{member.name}</p><p className="text-sm text-gray-500">{member.email}</p></div><span className="text-sm text-blue-500 font-medium">Ver Detalhes</span></li>))}</ul>
                )}
            </div>
        </div>
    );
};

const AddMemberForm = ({ setPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [planId, setPlanId] = useState('');
    const [plans, setPlans] = useState([]);
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });
    useEffect(() => { setPlans(db.getItem('gym_plans') || []); }, []);
    const handleAddMember = (e) => {
        e.preventDefault();
        if (!planId) { setModalInfo({ show: true, message: 'Selecione um plano.' }); return; }
        const users = db.getItem('gym_users') || [];
        if (users.some(u => u.email === email)) { setModalInfo({ show: true, message: 'Email já em uso.' }); return; }
        users.push({
            id: `user_${Date.now()}`, name, email, password, role: 'member',
            planId, joinDate: new Date().toISOString(), paymentHistory: [],
            sheetId: null, currentWorkoutIndex: 0,
            personalSheetId: null, currentPersonalWorkoutIndex: 0, activeTrainingMode: 'assisted'
        });
        db.setItem('gym_users', users);
        setModalInfo({ show: true, message: `Aluno ${name} cadastrado!` });
        setName(''); setEmail(''); setPassword(''); setPlanId('');
    };
    return (
        <div className="p-4 md:p-8">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <button onClick={() => setPage('students')} className="flex items-center text-blue-500 mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Voltar para Alunos</button>
            <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Cadastrar Aluno</h2>
                <form onSubmit={handleAddMember} className="space-y-4">
                    <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    <input type="password" placeholder="Senha Provisória" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    <select value={planId} onChange={e => setPlanId(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-white"><option value="">Selecione um Plano</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.value}</option>)}</select>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

const PlansManagement = () => {
    const [plans, setPlans] = useState([]);
    const [newPlan, setNewPlan] = useState({ name: '', value: '', durationInMonths: '' });
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });
    useEffect(() => { setPlans(db.getItem('gym_plans') || []); }, []);
    const handleAddPlan = (e) => {
        e.preventDefault();
        const updatedPlans = [...plans, { id: `plan_${Date.now()}`, name: newPlan.name, value: parseFloat(newPlan.value), durationInMonths: parseInt(newPlan.durationInMonths, 10) }];
        db.setItem('gym_plans', updatedPlans);
        setPlans(updatedPlans);
        setNewPlan({ name: '', value: '', durationInMonths: '' });
        setModalInfo({ show: true, message: "Plano adicionado!" });
    };
    const handleDeletePlan = (planId) => {
        const updatedPlans = plans.filter(p => p.id !== planId);
        db.setItem('gym_plans', updatedPlans);
        setPlans(updatedPlans);
        setModalInfo({ show: true, message: "Plano removido!" });
    };
    return (
        <div className="p-4 md:p-8">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gerenciamento de Planos</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-lg"><h3 className="text-xl font-semibold mb-4">Adicionar Plano</h3><form onSubmit={handleAddPlan} className="space-y-4"><input type="text" placeholder="Nome do Plano" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} required className="w-full px-3 py-2 border rounded-md" /><input type="number" placeholder="Valor (R$)" value={newPlan.value} onChange={e => setNewPlan({ ...newPlan, value: e.target.value })} required className="w-full px-3 py-2 border rounded-md" /><input type="number" placeholder="Duração (meses)" value={newPlan.durationInMonths} onChange={e => setNewPlan({ ...newPlan, durationInMonths: e.target.value })} required className="w-full px-3 py-2 border rounded-md" /><button type="submit" className="w-full py-2 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Adicionar</button></form></div>
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg"><h3 className="text-xl font-semibold mb-4">Planos Existentes</h3><ul className="space-y-3">{plans.map(plan => (<li key={plan.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><div><p className="font-semibold">{plan.name}</p><p className="text-sm text-gray-600">R$ {plan.value.toFixed(2)} / {plan.durationInMonths} mes(es)</p></div><button onClick={() => handleDeletePlan(plan.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button></li>))}</ul></div>
            </div>
        </div>
    );
};

const FinancialDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchPayments = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const users = db.getItem('gym_users') || [];
        const plans = db.getItem('gym_plans') || [];
        setPayments(users.filter(u => u.role === 'member').map(member => {
            const plan = plans.find(p => p.id === member.planId);
            const payment = member.paymentHistory?.find(p => p.month === month && p.year === year);
            return {
                memberId: member.id,
                memberName: member.name,
                planName: plan?.name || 'N/A',
                status: payment?.status || 'Pendente',
                value: plan?.value || 0,
                paymentDate: payment?.paymentDate
            };
        }));
    };

    useEffect(fetchPayments, [currentDate]);

    const handleMarkAsPaid = (memberId) => {
        const users = db.getItem('gym_users');
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex === -1) return;

        const member = users[userIndex];
        if (!member.paymentHistory) member.paymentHistory = [];

        const newPayment = {
            month: currentDate.getMonth(),
            year: currentDate.getFullYear(),
            status: 'Pago',
            paymentDate: new Date().toISOString()
        };

        member.paymentHistory.push(newPayment);
        db.setItem('gym_users', users);
        fetchPayments();
        setModalInfo({ show: true, message: "Pagamento registrado!" });
    };

    const handleUnmarkAsPaid = (memberId) => {
        const users = db.getItem('gym_users');
        const userIndex = users.findIndex(u => u.id === memberId);
        if (userIndex === -1) return;

        users[userIndex].paymentHistory = users[userIndex].paymentHistory.filter(p =>
            !(p.month === currentDate.getMonth() && p.year === currentDate.getFullYear())
        );

        db.setItem('gym_users', users);
        fetchPayments();
        setModalInfo({ show: true, message: "Pagamento desmarcado!" });
    };

    const goToPreviousMonth = () => {
        const today = new Date();
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        if (currentDate > oneMonthAgo) {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        }
    };

    const goToNextMonth = () => {
        const today = new Date();
        const oneMonthAhead = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        if (currentDate < oneMonthAhead) {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        }
    };

    return (
        <div className="p-4 md:p-8">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Financeiro</h2>
                <div className="flex items-center gap-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                    <span className="text-lg font-semibold capitalize">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                {payments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum registro financeiro para este mês.</p>
                ) : (
                    <ul className="space-y-3">
                        {payments.map(p => (
                            <li key={p.memberId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{p.memberName}</p>
                                    <p className="text-sm text-gray-600">{p.planName} - R$ {p.value.toFixed(2)}</p>
                                    {p.status === 'Pago' && <p className="text-xs text-gray-500">Pago em: {new Date(p.paymentDate).toLocaleDateString('pt-BR')}</p>}
                                </div>
                                {p.status === 'Pago' ? (
                                    <button onClick={() => handleUnmarkAsPaid(p.memberId)} className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600">Desmarcar</button>
                                ) : (
                                    <button onClick={() => handleMarkAsPaid(p.memberId)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Marcar como Pago</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const WorkoutsManagement = ({ ownerId }) => {
    const [workouts, setWorkouts] = useState([]);
    const [editingWorkout, setEditingWorkout] = useState(null);
    useEffect(() => {
        const allWorkouts = db.getItem('gym_workouts') || [];
        setWorkouts(allWorkouts.filter(t => t.ownerId === ownerId));
    }, [ownerId]);

    const handleSaveWorkout = (workoutData) => {
        const allWorkouts = db.getItem('gym_workouts') || [];
        const existingIndex = allWorkouts.findIndex(t => t.id === workoutData.id);
        if (existingIndex > -1) allWorkouts[existingIndex] = workoutData;
        else allWorkouts.push(workoutData);
        db.setItem('gym_workouts', allWorkouts);
        setWorkouts(allWorkouts.filter(t => t.ownerId === ownerId));
        setEditingWorkout(null);
    };
    const handleDeleteWorkout = (workoutId) => {
        const allWorkouts = db.getItem('gym_workouts') || [];
        const updatedWorkouts = allWorkouts.filter(t => t.id !== workoutId);
        db.setItem('gym_workouts', updatedWorkouts);
        setWorkouts(updatedWorkouts.filter(t => t.ownerId === ownerId));
    };
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl md:text-3xl font-bold text-gray-800">Treinos</h2><button onClick={() => setEditingWorkout({})} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow"><PlusCircle className="h-5 w-5 mr-2" />Criar</button></div>
            {editingWorkout ? (<div><button onClick={() => setEditingWorkout(null)} className="flex items-center text-blue-500 mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</button><WorkoutEditor workoutData={editingWorkout} onSave={handleSaveWorkout} ownerId={ownerId} /></div>) : (<div className="bg-white p-6 rounded-xl shadow-lg"><h3 className="text-xl font-semibold mb-4">Treinos Salvos</h3>{workouts.length === 0 ? <p>Nenhum treino criado.</p> : (<ul className="space-y-3">{workouts.map(workout => (<li key={workout.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><p className="font-semibold">{workout.name}</p><div><button onClick={() => setEditingWorkout(workout)} className="text-blue-500 hover:text-blue-700 mr-4">Editar</button><button onClick={() => handleDeleteWorkout(workout.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-5 w-5" /></button></div></li>))}</ul>)}</div>)}
        </div>
    );
};

const TrainingSheetsManagement = ({ ownerId, onAssignSheet, currentAssignedSheetId }) => {
    const [sheets, setSheets] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [editingSheet, setEditingSheet] = useState(null);
    const [sheetName, setSheetName] = useState('');
    const [selectedWorkout, setSelectedWorkout] = useState('');
    const [sheetWorkouts, setSheetWorkouts] = useState([]);
    const [cardioDuration, setCardioDuration] = useState('');

    const specialDays = [{ id: 'REST_DAY', name: 'Dia de Descanso' }, { id: 'CARDIO_DAY', name: 'Dia de Cardio' }];

    useEffect(() => {
        const allSheets = db.getItem('gym_training_sheets') || [];
        const allWorkouts = db.getItem('gym_workouts') || [];
        if (ownerId === 'admin_user_01') {
            setSheets(allSheets.filter(r => r.ownerId === ownerId));
            setWorkouts(allWorkouts.filter(t => t.ownerId === ownerId));
        } else {
            setSheets(allSheets.filter(r => r.ownerId === ownerId));
            setWorkouts(allWorkouts.filter(t => t.ownerId === 'admin_user_01' || t.ownerId === ownerId));
        }
    }, [ownerId]);

    const startEditing = (sheet) => {
        setEditingSheet(sheet);
        setSheetName(sheet.name || '');
        setSheetWorkouts(sheet.workouts || []);
    };
    const handleAddWorkoutToSheet = () => {
        if (selectedWorkout) {
            let workoutToAdd = { id: selectedWorkout };
            if (selectedWorkout === 'CARDIO_DAY') {
                if (!cardioDuration) {
                    alert('Por favor, defina a duração do cardio.');
                    return;
                }
                workoutToAdd.duration = cardioDuration;
            }
            setSheetWorkouts([...sheetWorkouts, workoutToAdd]);
            setCardioDuration('');
        }
    };
    const handleRemoveWorkoutFromSheet = (index) => {
        const newSheetWorkouts = [...sheetWorkouts];
        newSheetWorkouts.splice(index, 1);
        setSheetWorkouts(newSheetWorkouts);
    };
    const handleSaveSheet = () => {
        const allSheets = db.getItem('gym_training_sheets') || [];
        const newSheet = { id: editingSheet?.id || `sheet_${Date.now()}`, name: sheetName, workouts: sheetWorkouts, ownerId };
        const existingIndex = allSheets.findIndex(r => r.id === newSheet.id);
        if (existingIndex > -1) allSheets[existingIndex] = newSheet;
        else allSheets.push(newSheet);
        db.setItem('gym_training_sheets', allSheets);
        setSheets(allSheets.filter(r => r.ownerId === ownerId));
        setEditingSheet(null);
    };
    const handleDeleteSheet = (sheetId) => {
        const allSheets = db.getItem('gym_training_sheets') || [];
        const updatedSheets = allSheets.filter(r => r.id !== sheetId);
        db.setItem('gym_training_sheets', updatedSheets);
        setSheets(updatedSheets.filter(r => r.ownerId === ownerId));
    };
    const getWorkoutName = (workout) => {
        const special = specialDays.find(d => d.id === workout.id);
        if (special) return special.name + (workout.duration ? ` (${workout.duration} min)` : '');
        return workouts.find(t => t.id === workout.id)?.name || 'Treino não encontrado';
    }

    if (editingSheet) {
        return (
            <div className="p-4 md:p-8">
                <button onClick={() => setEditingSheet(null)} className="flex items-center text-blue-500 mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</button>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Editando Ficha</h3>
                    <input type="text" placeholder="Nome da Ficha" value={sheetName} onChange={e => setSheetName(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-4" />
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Sequência de Treinos</h4>
                        <ul className="space-y-2 mb-4">{sheetWorkouts.map((workout, index) => (<li key={index} className="flex justify-between items-center p-2 bg-white rounded-md border"><span>{index + 1}. {getWorkoutName(workout)}</span><button onClick={() => handleRemoveWorkoutFromSheet(index)} className="text-red-500"><Trash2 size={18} /></button></li>))}</ul>
                        <div className="flex gap-2 items-end">
                            <div className="flex-grow">
                                <label className="text-sm">Item</label>
                                <select value={selectedWorkout} onChange={e => setSelectedWorkout(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white"><option value="">-- Selecione --</option><optgroup label="Dias Especiais">{specialDays.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</optgroup><optgroup label="Treinos">{workouts.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup></select>
                            </div>
                            {selectedWorkout === 'CARDIO_DAY' && (
                                <div>
                                    <label className="text-sm">Duração (min)</label>
                                    <input type="number" value={cardioDuration} onChange={e => setCardioDuration(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="ex: 30" />
                                </div>
                            )}
                            <button onClick={handleAddWorkoutToSheet} className="bg-blue-500 text-white px-4 py-2 rounded-md self-end">Adicionar</button>
                        </div>
                    </div>
                    <button onClick={handleSaveSheet} className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md">Salvar Ficha</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl md:text-3xl font-bold">Fichas de Treino</h2><button onClick={() => startEditing({})} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow"><PlusCircle className="h-5 w-5 mr-2" />Criar</button></div>
            <div className="bg-white p-6 rounded-xl shadow-lg"><h3 className="text-xl font-semibold mb-4">Fichas Salvas</h3>{sheets.length === 0 ? <p>Nenhuma ficha criada.</p> : (<ul className="space-y-3">{sheets.map(sheet => (<li key={sheet.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"><div><p className="font-semibold">{sheet.name}</p>{onAssignSheet && <button onClick={() => onAssignSheet(sheet.id)} className={`mt-1 text-sm px-2 py-1 rounded ${currentAssignedSheetId === sheet.id ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>{currentAssignedSheetId === sheet.id ? 'Ativa' : 'Definir como ativa'}</button>}</div><div><button onClick={() => startEditing(sheet)} className="text-blue-500 mr-4">Editar</button><button onClick={() => handleDeleteSheet(sheet.id)} className="text-red-500"><Trash2 className="h-5 w-5" /></button></div></li>))}</ul>)}</div>
        </div>
    );
};

const SettingsPage = ({ gymName, setGymName }) => {
    const { user, updateUser, logout } = useAuth();
    const [settings, setSettings] = useState({ openDays: [], gymName: '' });
    const [adminEmail, setAdminEmail] = useState(user.email);
    const [adminPassword, setAdminPassword] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    const daysOfWeek = [{ id: 1, name: 'Segunda' }, { id: 2, name: 'Terça' }, { id: 3, name: 'Quarta' }, { id: 4, name: 'Quinta' }, { id: 5, name: 'Sexta' }, { id: 6, name: 'Sábado' }, { id: 0, name: 'Domingo' }];

    useEffect(() => {
        const currentSettings = db.getItem('gym_settings') || { openDays: [], gymName: 'Academia App' };
        setSettings(currentSettings);
    }, []);

    const handleDayToggle = (dayId) => {
        const openDays = settings.openDays.includes(dayId)
            ? settings.openDays.filter(d => d !== dayId)
            : [...settings.openDays, dayId];
        setSettings({ ...settings, openDays });
    };

    const handleSaveSettings = () => {
        db.setItem('gym_settings', settings);
        setGymName(settings.gymName);
        setModalInfo({ show: true, message: 'Configurações gerais salvas!' });
    };

    const handleUpdateCredentials = (e) => {
        e.preventDefault();
        const users = db.getItem('gym_users');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
            users[userIndex].email = adminEmail;
            if (adminPassword) {
                users[userIndex].password = adminPassword;
            }
            db.setItem('gym_users', users);
            updateUser(users[userIndex]);
            setAdminPassword('');
            setModalInfo({ show: true, message: 'Credenciais atualizadas! Pode ser necessário fazer login novamente.' });
        }
    };

    const openConfirmModal = (action, title, message) => {
        setConfirmModalState({ isOpen: true, onConfirm: action, title, message });
    };

    const closeConfirmModal = () => {
        setConfirmModalState({ isOpen: false, onConfirm: null, title: '', message: '' });
    };

    const handleDeleteAllStudents = () => {
        const users = db.getItem('gym_users');
        const remainingUsers = users.filter(u => u.role !== 'member');
        db.setItem('gym_users', remainingUsers);
        setModalInfo({ show: true, message: 'Todos os alunos foram removidos!' });
        closeConfirmModal();
    };

    const handleDeleteAllWorkouts = () => {
        db.setItem('gym_workouts', []);
        setModalInfo({ show: true, message: 'Todos os treinos foram removidos!' });
        closeConfirmModal();
    };

    const handleDeleteAllSheets = () => {
        db.setItem('gym_training_sheets', []);
        setModalInfo({ show: true, message: 'Todas as fichas foram removidas!' });
        closeConfirmModal();
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <ConfirmationModal {...confirmModalState} onClose={closeConfirmModal} />

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Configurações</h2>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Configurações Gerais</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome da Academia</label>
                        <input type="text" value={settings.gymName} onChange={e => setSettings({ ...settings, gymName: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Dias de Funcionamento</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {daysOfWeek.map(day => (<label key={day.id} className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={settings.openDays.includes(day.id)} onChange={() => handleDayToggle(day.id)} className="h-5 w-5 rounded" /><span>{day.name}</span></label>))}
                        </div>
                    </div>
                    <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Salvar Configurações</button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Credenciais de Administrador</h3>
                <form onSubmit={handleUpdateCredentials} className="space-y-4">
                    <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md" />
                    <input type="password" placeholder="Digite a nova senha (deixe em branco para não alterar)" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Atualizar Credenciais</button>
                </form>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-lg">
                <h3 className="text-xl font-bold text-red-800 flex items-center"><AlertTriangle className="mr-2" />Zona de Perigo</h3>
                <p className="text-red-700 mt-2 mb-4">As ações abaixo são permanentes e não podem ser desfeitas. Tenha certeza do que está fazendo.</p>
                <div className="flex flex-col md:flex-row gap-4">
                    <button onClick={() => openConfirmModal(handleDeleteAllStudents, 'Apagar Alunos?', 'Isso removerá permanentemente todos os alunos cadastrados.')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Apagar Todos os Alunos</button>
                    <button onClick={() => openConfirmModal(handleDeleteAllWorkouts, 'Apagar Treinos?', 'Isso removerá permanentemente todos os treinos criados.')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Apagar Todos os Treinos</button>
                    <button onClick={() => openConfirmModal(handleDeleteAllSheets, 'Apagar Fichas?', 'Isso removerá permanentemente todas as fichas criadas.')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Apagar Todas as Fichas</button>
                </div>
            </div>
        </div>
    );
};

const MemberDetails = ({ setPage, memberId }) => {
    const [member, setMember] = useState(null);
    const [sheets, setSheets] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '', planId: '' });
    const [modalInfo, setModalInfo] = useState({ show: false, message: '' });
    const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    useEffect(() => {
        if (memberId) {
            const allUsers = db.getItem('gym_users') || [];
            const foundMember = allUsers.find(u => u.id === memberId);
            setMember(foundMember);
            setEditForm({ name: foundMember.name, email: foundMember.email, password: '', planId: foundMember.planId });

            const allSheets = db.getItem('gym_training_sheets') || [];
            setSheets(allSheets.filter(r => r.ownerId === 'admin_user_01'));

            setPlans(db.getItem('gym_plans') || []);
        }
    }, [memberId]);

    const handleAssignSheet = (sheetId) => {
        const allUsers = db.getItem('gym_users');
        const userIndex = allUsers.findIndex(u => u.id === memberId);
        if (userIndex > -1) {
            allUsers[userIndex].sheetId = sheetId;
            allUsers[userIndex].currentWorkoutIndex = 0;
            db.setItem('gym_users', allUsers);
            setMember(allUsers[userIndex]);
            setModalInfo({ show: true, message: 'Ficha atribuída com sucesso!' });
        }
    };

    const handleUpdateMember = (e) => {
        e.preventDefault();
        const allUsers = db.getItem('gym_users');
        const userIndex = allUsers.findIndex(u => u.id === memberId);
        if (userIndex > -1) {
            allUsers[userIndex] = {
                ...allUsers[userIndex],
                name: editForm.name,
                email: editForm.email,
                planId: editForm.planId,
                password: editForm.password ? editForm.password : allUsers[userIndex].password
            };
            db.setItem('gym_users', allUsers);
            setMember(allUsers[userIndex]);
            setIsEditing(false);
            setModalInfo({ show: true, message: 'Dados do aluno atualizados!' });
        }
    };

    const handleDeleteMember = () => {
        // Remove o aluno
        let allUsers = db.getItem('gym_users') || [];
        allUsers = allUsers.filter(u => u.id !== memberId);
        db.setItem('gym_users', allUsers);

        // Remove dados associados
        let allMeasurements = db.getItem('gym_measurements') || [];
        allMeasurements = allMeasurements.filter(m => m.userId !== memberId);
        db.setItem('gym_measurements', allMeasurements);

        let allHistory = db.getItem('gym_training_history') || [];
        allHistory = allHistory.filter(h => h.userId !== memberId);
        db.setItem('gym_training_history', allHistory);

        setModalInfo({ show: true, message: 'Aluno e todos os seus dados foram removidos.' });
        setPage('students');
    };

    if (!member) return <div className="p-8"><Spinner /></div>;
    const currentSheet = sheets.find(r => r.id === member.sheetId);

    return (
        <div className="p-4 md:p-8">
            {modalInfo.show && <CustomModal message={modalInfo.message} onClose={() => setModalInfo({ show: false, message: '' })} />}
            <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false })}
                onConfirm={handleDeleteMember}
                title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir ${member.name}? Todos os seus dados (histórico, medidas) serão perdidos.`}
            />

            <button onClick={() => setPage('students')} className="flex items-center text-blue-500 mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Voltar para Alunos</button>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <User className="mr-3 h-8 w-8 text-blue-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
                            <p className="text-gray-600">{member.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"><Edit className="h-5 w-5 text-gray-600" /></button>
                        <button onClick={() => setConfirmModalState({ isOpen: true })} className="p-2 bg-red-100 rounded-lg hover:bg-red-200"><Trash2 className="h-5 w-5 text-red-600" /></button>
                    </div>
                </div>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <h3 className="text-xl font-semibold mb-4">Editar Aluno</h3>
                    <form onSubmit={handleUpdateMember} className="space-y-4">
                        <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Nome" />
                        <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Email" />
                        <input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="w-full px-3 py-2 border rounded-md" placeholder="Nova senha (opcional)" />
                        <select value={editForm.planId} onChange={e => setEditForm({ ...editForm, planId: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white">
                            {plans.map(p => <option key={p.id} value={p.id}>{p.name} - R$ {p.value}</option>)}
                        </select>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setIsEditing(false)} className="w-full py-2 rounded-md bg-gray-200">Cancelar</button>
                            <button type="submit" className="w-full py-2 rounded-md bg-green-500 text-white">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg"><h3 className="text-xl font-semibold mb-4">Atribuir Ficha (Assistida)</h3><p className="mb-2">Ficha Atual: <span className="font-bold">{currentSheet?.name || 'Nenhuma'}</span></p><div className="flex gap-2"><select onChange={(e) => handleAssignSheet(e.target.value)} value={member.sheetId || ''} className="flex-grow px-3 py-2 border rounded-md bg-white"><option value="">-- Selecione uma ficha --</option>{sheets.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div></div>
        </div>
    );
};

// --- PÁGINAS DO ALUNO ---
const MeasurementsPage = () => {
    const { user } = useAuth();
    const [measurements, setMeasurements] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [currentMeasurement, setCurrentMeasurement] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '', arm: '', thigh: '', waist: '', chest: '', hip: ''
    });

    useEffect(() => {
        const allMeasurements = db.getItem('gym_measurements') || [];
        setMeasurements(allMeasurements.filter(m => m.userId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, [user.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentMeasurement(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const allMeasurements = db.getItem('gym_measurements') || [];
        const newRecord = { ...currentMeasurement, userId: user.id, id: `m_${Date.now()}` };

        const otherUserMeasurements = allMeasurements.filter(m => m.userId !== user.id);
        const thisUserMeasurements = allMeasurements.filter(m => m.userId === user.id);

        const updatedMeasurements = [...otherUserMeasurements, newRecord, ...thisUserMeasurements];

        db.setItem('gym_measurements', updatedMeasurements);
        setMeasurements([newRecord, ...thisUserMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date)));
        setIsFormVisible(false);
        setCurrentMeasurement({ date: new Date().toISOString().split('T')[0], weight: '', arm: '', thigh: '', waist: '', chest: '', hip: '' });
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Minhas Medidas</h2>
                <button onClick={() => setIsFormVisible(!isFormVisible)} className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow">
                    <PlusCircle className="h-5 w-5 mr-2" />{isFormVisible ? 'Fechar' : 'Adicionar Registro'}
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="date" name="date" value={currentMeasurement.date} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="weight" placeholder="Peso (kg)" value={currentMeasurement.weight} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="chest" placeholder="Peitoral (cm)" value={currentMeasurement.chest} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="arm" placeholder="Braço (cm)" value={currentMeasurement.arm} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="waist" placeholder="Cintura (cm)" value={currentMeasurement.waist} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="hip" placeholder="Quadril (cm)" value={currentMeasurement.hip} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" step="0.1" name="thigh" placeholder="Coxa (cm)" value={currentMeasurement.thigh} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">Salvar Registro</button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {measurements.length === 0 ? <p className="text-center text-gray-500">Nenhum registro de medida encontrado.</p> :
                    measurements.map(m => (
                        <div key={m.id} className="bg-white p-4 rounded-xl shadow-lg">
                            <h3 className="font-bold text-lg text-blue-600 mb-2">{new Date(m.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Peso</p><p className="font-semibold">{m.weight} kg</p></div>
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Peitoral</p><p className="font-semibold">{m.chest} cm</p></div>
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Braço</p><p className="font-semibold">{m.arm} cm</p></div>
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Cintura</p><p className="font-semibold">{m.waist} cm</p></div>
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Quadril</p><p className="font-semibold">{m.hip} cm</p></div>
                                <div className="bg-gray-50 p-2 rounded-md"><p className="text-sm text-gray-500">Coxa</p><p className="font-semibold">{m.thigh} cm</p></div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

const MyTrainingPage = ({ setPage }) => {
    const { user, updateUser } = useAuth();
    const [subPage, setSubPage] = useState('sheets'); // 'sheets' or 'workouts'

    const handleAssignPersonalSheet = (sheetId) => {
        const updatedUser = { ...user, personalSheetId: sheetId, currentPersonalWorkoutIndex: 0 };
        updateUser(updatedUser);
    };

    return (
        <div>
            <div className="p-4 md:p-8 border-b bg-white">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Meu Treino</h2>
                    <div className="flex space-x-2 rounded-lg bg-gray-200 p-1">
                        <button onClick={() => setSubPage('sheets')} className={`px-3 py-1 text-sm font-medium rounded-md ${subPage === 'sheets' ? 'bg-white shadow' : ''}`}>Minhas Fichas</button>
                        <button onClick={() => setSubPage('workouts')} className={`px-3 py-1 text-sm font-medium rounded-md ${subPage === 'workouts' ? 'bg-white shadow' : ''}`}>Meus Treinos</button>
                    </div>
                </div>
            </div>
            {subPage === 'sheets' ? (
                <TrainingSheetsManagement ownerId={user.id} onAssignSheet={handleAssignPersonalSheet} currentAssignedSheetId={user.personalSheetId} />
            ) : (
                <WorkoutsManagement ownerId={user.id} />
            )}
        </div>
    );
};

const MemberDashboard = ({ setPage }) => {
    const { user, updateUser } = useAuth();
    const [todayWorkout, setTodayWorkout] = useState(null);
    const [completedIndices, setCompletedIndices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isGymOpen, setIsGymOpen] = useState(true);
    const [trainingMode, setTrainingMode] = useState(user.activeTrainingMode || 'assisted');
    const [isTimerOpen, setIsTimerOpen] = useState(false);
    const [timerInitialTime, setTimerInitialTime] = useState(60);

    const todayKey = `gym_progress_${user.id}_${trainingMode}_${new Date().toISOString().split('T')[0]}`;

    useEffect(() => {
        const settings = db.getItem('gym_settings');
        const today = new Date().getDay();
        setIsGymOpen(settings?.openDays.includes(today));

        const sheets = db.getItem('gym_training_sheets') || [];
        const workouts = db.getItem('gym_workouts') || [];

        let sheetId, workoutIndex;
        if (trainingMode === 'assisted') {
            sheetId = user.sheetId;
            workoutIndex = user.currentWorkoutIndex || 0;
        } else {
            sheetId = user.personalSheetId;
            workoutIndex = user.currentPersonalWorkoutIndex || 0;
        }

        if (sheetId) {
            const currentSheet = sheets.find(r => r.id === sheetId);
            if (currentSheet && currentSheet.workouts.length > 0) {
                const workoutInfo = currentSheet.workouts[workoutIndex];
                if (workoutInfo.id === 'REST_DAY') setTodayWorkout({ id: 'REST_DAY', name: 'Dia de Descanso' });
                else if (workoutInfo.id === 'CARDIO_DAY') setTodayWorkout({ id: 'CARDIO_DAY', name: 'Dia de Cardio', duration: workoutInfo.duration });
                else setTodayWorkout(workouts.find(t => t.id === workoutInfo.id));
            } else {
                setTodayWorkout(null);
            }
        } else {
            setTodayWorkout(null);
        }

        const savedProgress = db.getItem(todayKey) || [];
        setCompletedIndices(savedProgress);
        setLoading(false);
    }, [user, todayKey, trainingMode]);

    const handleToggleExercise = (index) => {
        const newCompletedIndices = completedIndices.includes(index) ? completedIndices.filter(i => i !== index) : [...completedIndices, index];
        setCompletedIndices(newCompletedIndices);
        db.setItem(todayKey, newCompletedIndices);
    };

    const handleFinishDay = () => {
        const allHistory = db.getItem('gym_training_history') || [];
        allHistory.push({ userId: user.id, date: new Date().toISOString().split('T')[0], workoutName: todayWorkout.name });
        db.setItem('gym_training_history', allHistory);

        const sheets = db.getItem('gym_training_sheets') || [];
        let sheetId, currentIndex, updatedUser;

        if (trainingMode === 'assisted') {
            sheetId = user.sheetId;
            currentIndex = user.currentWorkoutIndex || 0;
            const currentSheet = sheets.find(r => r.id === sheetId);
            if (!currentSheet) return;
            let nextIndex = currentIndex + 1;
            if (nextIndex >= currentSheet.workouts.length) nextIndex = 0;
            updatedUser = { ...user, currentWorkoutIndex: nextIndex };
        } else {
            sheetId = user.personalSheetId;
            currentIndex = user.currentPersonalWorkoutIndex || 0;
            const currentSheet = sheets.find(r => r.id === sheetId);
            if (!currentSheet) return;
            let nextIndex = currentIndex + 1;
            if (nextIndex >= currentSheet.workouts.length) nextIndex = 0;
            updatedUser = { ...user, currentPersonalWorkoutIndex: nextIndex };
        }

        updateUser(updatedUser);
        db.setItem(todayKey, []);
        setCompletedIndices([]);
        setTodayWorkout(null);
    };

    const handleModeChange = (mode) => {
        setTrainingMode(mode);
        updateUser({ ...user, activeTrainingMode: mode });
    };

    const startTimer = (seconds) => {
        setTimerInitialTime(seconds);
        setIsTimerOpen(true);
    };

    if (loading) return <div className="p-8"><Spinner /></div>;
    if (!isGymOpen) return <div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4">Academia fechada hoje. Bom descanso!</h2></div>

    const totalExercises = todayWorkout?.exercises?.length || 0;
    const progressPercentage = totalExercises > 0 ? (completedIndices.length / totalExercises) * 100 : 0;

    return (
        <div className="p-4 md:p-8">
            <TimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} initialTime={timerInitialTime} />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Olá, {user.name}!</h2>
                <div className="flex space-x-1 rounded-lg bg-gray-200 p-1">
                    <button onClick={() => handleModeChange('assisted')} className={`px-3 py-1 text-sm font-medium rounded-md ${trainingMode === 'assisted' ? 'bg-white shadow' : ''}`}>Treino Assistido</button>
                    <button onClick={() => handleModeChange('personal')} className={`px-3 py-1 text-sm font-medium rounded-md ${trainingMode === 'personal' ? 'bg-white shadow' : ''}`}>Meu Treino</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Seu Treino de Hoje</h3>
                {!todayWorkout ? (
                    <p>{!user.sheetId && trainingMode === 'assisted' ? 'Nenhuma ficha assistida atribuída.' : !user.personalSheetId && trainingMode === 'personal' ? 'Você não selecionou uma ficha pessoal. Crie uma em "Meu Treino".' : 'Dia finalizado com sucesso! Bom descanso! 💪'}</p>
                ) : (
                    <div>
                        {todayWorkout.id === 'REST_DAY' ? <div className="text-center p-8"><Coffee size={64} className="mx-auto text-blue-500 mb-4" /><h4 className="text-2xl font-bold">Dia de Descanso</h4><p className="mt-2">Aproveite para recuperar as energias.</p><button onClick={handleFinishDay} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg">Finalizar Dia</button></div>
                            : todayWorkout.id === 'CARDIO_DAY' ? <div className="text-center p-8"><HeartPulse size={64} className="mx-auto text-red-500 mb-4" /><h4 className="text-2xl font-bold">{todayWorkout.name}</h4><p className="mt-2">Duração: {todayWorkout.duration} minutos</p><button onClick={() => startTimer(todayWorkout.duration * 60)} className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg">Iniciar Cardio</button><button onClick={handleFinishDay} className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg">Finalizar Dia</button></div>
                                : (
                                    <div>
                                        <h4 className="text-2xl font-bold text-blue-600 mb-2">{todayWorkout.name}</h4>
                                        <p className="text-gray-600 mb-4">Progresso: {completedIndices.length} de {totalExercises} exercícios</p>
                                        <ProgressBar value={progressPercentage} />
                                        <div className="space-y-4 mt-6">{todayWorkout.exercises.map((ex, index) => {
                                            const isCompleted = completedIndices.includes(index);
                                            return (
                                                <div key={index} className={`p-4 rounded-lg border ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <h5 className={`font-bold text-lg ${isCompleted ? 'line-through' : ''}`}>{ex.name}</h5>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 mt-2 text-center">
                                                                <div><p className="text-sm">Séries</p><p className="font-semibold">{ex.sets}</p></div>
                                                                <div><p className="text-sm">Reps</p><p className="font-semibold">{ex.reps}</p></div>
                                                                <div><p className="text-sm">Descanso</p><p className="font-semibold">{ex.restTime ? `${ex.restTime}s` : 'N/A'}</p></div>
                                                            </div>
                                                            <div className="mt-2 text-left"><p className="text-sm">Obs.</p><p className="font-semibold">{ex.notes || 'N/A'}</p></div>
                                                        </div>
                                                        <button onClick={() => handleToggleExercise(index)} className={`flex-shrink-0 p-2 rounded-md ${isCompleted ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}>{isCompleted ? <CheckSquare /> : <Square />}</button>
                                                    </div>
                                                </div>);
                                        })}</div>
                                        {progressPercentage === 100 && <button onClick={handleFinishDay} className="w-full mt-6 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-lg">Finalizar Treino do Dia <ChevronsRight /></button>}
                                    </div>
                                )}
                    </div>
                )}
            </div>
        </div>
    );
};

const TrainingHistoryPage = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [history, setHistory] = useState([]);
    const [calendarGrid, setCalendarGrid] = useState([]);
    const [tooltip, setTooltip] = useState(null);

    useEffect(() => {
        const allHistory = db.getItem('gym_training_history') || [];
        setHistory(allHistory.filter(h => h.userId === user.id));
    }, [user.id]);

    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajusta para Segunda = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid = [];
        for (let i = 0; i < adjustedFirstDay; i++) {
            grid.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const historyEntry = history.find(h => h.date === dateStr);
            grid.push({ day, historyEntry });
        }
        setCalendarGrid(grid);
    }, [currentDate, history]);

    const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDayClick = (dayData, e) => {
        if (dayData && dayData.historyEntry) {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
                content: dayData.historyEntry.workoutName,
                top: rect.top - rect.height,
                left: rect.left + rect.width / 2,
            });
        } else {
            setTooltip(null);
        }
    };

    const today = new Date();

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Histórico de Treinos</h2>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg relative">
                {tooltip && (
                    <div
                        className="absolute z-10 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg"
                        style={{ top: `${tooltip.top - 50}px`, left: `${tooltip.left}px`, transform: 'translateX(-50%)' }}
                    >
                        {tooltip.content}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-800 transform rotate-45"></div>
                    </div>
                )}
                <div className="flex justify-between items-center mb-4">
                    <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft /></button>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 capitalize">
                        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm text-gray-500 font-medium">
                    <div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div><div>Dom</div>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {calendarGrid.map((dayData, index) => (
                        <div key={index} className={`aspect-square p-1.5 border rounded-lg flex flex-col items-center justify-between transition-colors ${dayData ? 'bg-white' : 'bg-gray-50'}`} onClick={(e) => handleDayClick(dayData, e)}>
                            {dayData && (
                                <>
                                    <span className={`text-sm sm:text-base font-medium ${dayData.day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700'}`}>
                                        {dayData.day}
                                    </span>
                                    {dayData.historyEntry && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DO APP ---
const App = () => {
    useEffect(() => {
        initializeLocalDb();
    }, []);

    return (<AuthProvider><MainApp /></AuthProvider>);
};

const MainApp = () => {
    const { user, logout, loading } = useAuth();
    const [page, setPage] = useState('login');
    const [currentMemberId, setCurrentMemberId] = useState(null);
    const [gymName, setGymName] = useState('Academia App');

    useEffect(() => {
        const settings = db.getItem('gym_settings');
        if (settings && settings.gymName) {
            setGymName(settings.gymName);
        }
        if (!loading) {
            if (user) setPage(user.role === 'admin' ? 'adminDashboard' : 'memberDashboard');
            else setPage('login');
        }
    }, [user, loading]);

    const AdminNav = ({ activePage, setPage }) => (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] h-16 flex justify-around items-center z-20">
            <NavButton active={activePage === 'adminDashboard'} onClick={() => setPage('adminDashboard')} icon={<Home />} label="Painel" />
            <NavButton active={activePage === 'students'} onClick={() => setPage('students')} icon={<Users />} label="Alunos" />
            <NavButton active={activePage === 'workouts'} onClick={() => setPage('workouts')} icon={<BookCopy />} label="Treinos" />
            <NavButton active={activePage === 'sheets'} onClick={() => setPage('sheets')} icon={<ClipboardList />} label="Fichas" />
            <NavButton active={activePage === 'plans'} onClick={() => setPage('plans')} icon={<ClipboardList />} label="Planos" />
            <NavButton active={activePage === 'financial'} onClick={() => setPage('financial')} icon={<DollarSign />} label="Financeiro" />
            <NavButton active={activePage === 'settings'} onClick={() => setPage('settings')} icon={<Settings />} label="Ajustes" />
        </nav>
    );

    const MemberNav = ({ activePage, setPage }) => (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] h-16 flex justify-around items-center z-20">
            <NavButton active={activePage === 'memberDashboard'} onClick={() => setPage('memberDashboard')} icon={<Dumbbell />} label="Hoje" />
            <NavButton active={activePage === 'myTraining'} onClick={() => setPage('myTraining')} icon={<Repeat />} label="Meu Treino" />
            <NavButton active={activePage === 'measurements'} onClick={() => setPage('measurements')} icon={<Ruler />} label="Medidas" />
            <NavButton active={activePage === 'history'} onClick={() => setPage('history')} icon={<Calendar />} label="Histórico" />
        </nav>
    );

    const NavButton = ({ active, onClick, icon, label }) => (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
            {icon}
            <span className="text-xs mt-1 hidden sm:inline">{label}</span>
        </button>
    );

    const renderPage = () => {
        if (loading) return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
        if (!user) return <LoginPage />;
        if (user.role === 'admin') {
            switch (page) {
                case 'adminDashboard': return <AdminDashboard />;
                case 'students': return <StudentsPage setPage={setPage} setCurrentMemberId={setCurrentMemberId} />;
                case 'addMember': return <AddMemberForm setPage={setPage} />;
                case 'memberDetails': return <MemberDetails setPage={setPage} memberId={currentMemberId} />;
                case 'workouts': return <WorkoutsManagement ownerId="admin_user_01" />;
                case 'sheets': return <TrainingSheetsManagement ownerId="admin_user_01" />;
                case 'plans': return <PlansManagement />;
                case 'financial': return <FinancialDashboard />;
                case 'settings': return <SettingsPage gymName={gymName} setGymName={setGymName} />;
                default: return <AdminDashboard />;
            }
        }
        // Member pages
        switch (page) {
            case 'memberDashboard': return <MemberDashboard />;
            case 'myTraining': return <MyTrainingPage />;
            case 'measurements': return <MeasurementsPage />;
            case 'history': return <TrainingHistoryPage />;
            default: return <MemberDashboard />;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col font-sans">
            {user && (
                <header className="bg-white shadow-md sticky top-0 z-10 w-full">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center"><Dumbbell className="h-8 w-8 text-blue-500" /><span className="font-bold text-xl ml-2 hidden sm:inline">{gymName}</span></div>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2 hidden sm:inline">Olá, {user.name}</span>
                                <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700 p-2 rounded-md"><LogOut className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                </header>
            )}
            <main className="flex-grow overflow-y-auto bg-gray-100 pb-20">
                {renderPage()}
            </main>
            {user && (user.role === 'admin' ? <AdminNav activePage={page} setPage={setPage} /> : <MemberNav activePage={page} setPage={setPage} />)}
            <InstallPWA />
        </div>
    );
};

const InstallPWA = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showIosInstall, setShowIosInstall] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

        if (isIos() && !isInStandaloneMode()) {
            setShowIosInstall(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => {
            setInstallPrompt(null);
        });
    };

    if (installPrompt) {
        return (
            <div className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
                <span>Instale o App!</span>
                <button onClick={handleInstallClick} className="bg-white text-blue-600 font-bold px-4 py-2 rounded">Instalar</button>
                <button onClick={() => setInstallPrompt(null)}><X size={20} /></button>
            </div>
        );
    }

    if (showIosInstall) {
        return (
            <div className="fixed bottom-20 left-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
                <button onClick={() => setShowIosInstall(false)} className="absolute top-2 right-2"><X size={20} /></button>
                <p className="text-center text-sm">Para instalar, toque no ícone <Share className="inline-block mx-1" /> e depois em "Adicionar à Tela de Início".</p>
            </div>
        );
    }

    return null;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
