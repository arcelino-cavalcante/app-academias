function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useEffect,
  createContext,
  useContext
} = React;
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
const firebaseAuth = firebase.auth();
const firebaseDb = firebase.firestore();

// --- GERENCIADOR DE DADOS (LocalStorage) ---
const db = {
  getItem: key => {
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
  if (!db.getItem('gym_users')) db.setItem('gym_users', [{
    id: 'admin_user_01',
    name: 'Admin',
    email: 'admin@academia.com',
    password: 'admin123',
    role: 'admin'
  }]);
  if (!db.getItem('gym_plans')) db.setItem('gym_plans', [{
    id: `plan_${Date.now()}`,
    name: 'Plano Mensal',
    value: 100,
    durationInMonths: 1
  }]);
  if (!db.getItem('gym_workouts')) db.setItem('gym_workouts', []);
  if (!db.getItem('gym_training_sheets')) db.setItem('gym_training_sheets', []);
  if (!db.getItem('gym_settings')) db.setItem('gym_settings', {
    openDays: [1, 2, 3, 4, 5],
    gymName: 'Academia App'
  });
  if (!db.getItem('gym_measurements')) db.setItem('gym_measurements', []);
  if (!db.getItem('gym_training_history')) db.setItem('gym_training_history', []);
};

// --- CONTEXTO DE AUTENTICAÇÃO ---
const AuthContext = createContext(null);
const AuthProvider = ({
  children
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loggedInUser = db.getItem('gym_current_user');
    if (loggedInUser) setUser(loggedInUser);
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    try {
      const cred = await firebaseAuth.signInWithEmailAndPassword(email, password);
      const userData = {
        id: cred.user.uid,
        email: cred.user.email,
        role: 'admin'
      };
      db.setItem('gym_current_user', userData);
      setUser(userData);
      return {
        success: true
      };
    } catch (err) {
      return {
        success: false,
        message: 'Email ou senha inválidos.'
      };
    }
  };
  const logout = () => {
    db.setItem('gym_current_user', null);
    setUser(null);
  };
  const updateUser = updatedUserData => {
    setUser(updatedUserData);
    db.setItem('gym_current_user', updatedUserData);
    const users = db.getItem('gym_users') || [];
    const userIndex = users.findIndex(u => u.id === updatedUserData.id);
    if (userIndex > -1) {
      users[userIndex] = updatedUserData;
      db.setItem('gym_users', users);
    }
  };
  const value = {
    user,
    login,
    logout,
    loading,
    updateUser
  };
  return /*#__PURE__*/React.createElement(AuthContext.Provider, {
    value: value
  }, !loading && children);
};
const useAuth = () => useContext(AuthContext);

// --- COMPONENTES DE UI ---
const Spinner = () => /*#__PURE__*/React.createElement("div", {
  className: "flex justify-center items-center h-full"
}, /*#__PURE__*/React.createElement("div", {
  className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
}));
const CustomModal = ({
  message,
  onClose
}) => /*#__PURE__*/React.createElement("div", {
  className: "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
}, /*#__PURE__*/React.createElement("div", {
  className: "bg-white p-6 rounded-lg shadow-xl text-center max-w-sm"
}, /*#__PURE__*/React.createElement("p", {
  className: "mb-4 text-gray-700"
}, message), /*#__PURE__*/React.createElement("button", {
  onClick: onClose,
  className: "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
}, "Fechar")));
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-lg shadow-xl text-center max-w-sm"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "mx-auto h-12 w-12 text-red-500 mb-4"
  }), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-gray-800"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "my-2 text-gray-600"
  }, message), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-center gap-4 mt-6"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: onConfirm,
    className: "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
  }, "Confirmar"))));
};
const ProgressBar = ({
  value
}) => {
  const progress = Math.min(100, Math.max(0, value));
  const colorClass = progress < 40 ? 'bg-blue-500' : progress < 80 ? 'bg-indigo-500' : 'bg-green-500';
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: `h-4 rounded-full transition-all duration-500 ${colorClass}`,
    style: {
      width: `${progress}%`
    }
  }));
};
const TimerModal = ({
  isOpen,
  onClose,
  initialTime
}) => {
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
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 rounded-full shadow-xl text-center w-64 h-64 flex flex-col justify-center items-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-6xl font-mono font-bold text-gray-800"
  }, String(minutes).padStart(2, '0'), ":", String(seconds).padStart(2, '0')), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    className: "mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
  }, "Parar")));
};

// --- EDITOR DE TREINO (Reutilizável) ---
const WorkoutEditor = ({
  workoutData,
  onSave,
  ownerId
}) => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState([{
    name: '',
    sets: '',
    reps: '',
    notes: '',
    restTime: ''
  }]);
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
  useEffect(() => {
    if (workoutData) {
      setWorkoutName(workoutData.name || '');
      setExercises(workoutData.exercises?.length > 0 ? JSON.parse(JSON.stringify(workoutData.exercises)) : [{
        name: '',
        sets: '',
        reps: '',
        notes: '',
        restTime: ''
      }]);
    }
  }, [workoutData]);
  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };
  const addExercise = () => setExercises([...exercises, {
    name: '',
    sets: '',
    reps: '',
    notes: '',
    restTime: ''
  }]);
  const removeExercise = index => setExercises(exercises.filter((_, i) => i !== index));
  const handleSave = () => {
    if (!workoutName.trim()) {
      setModalInfo({
        show: true,
        message: 'Por favor, dê um nome para o treino.'
      });
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
      setModalInfo({
        show: true,
        message: 'Treino salvo com sucesso!'
      });
    }, 500);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nome do Treino (ex: Treino A - Peito)",
    value: workoutName,
    onChange: e => setWorkoutName(e.target.value),
    className: "w-full px-3 py-2 border rounded-md"
  }), exercises.map((ex, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    className: "p-4 border rounded-lg space-y-3 relative"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-semibold text-gray-600"
  }, "Exerc\xEDcio ", index + 1), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nome do Exerc\xEDcio",
    value: ex.name,
    onChange: e => handleExerciseChange(index, 'name', e.target.value),
    className: "md:col-span-3 w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "S\xE9ries",
    value: ex.sets,
    onChange: e => handleExerciseChange(index, 'sets', e.target.value),
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Repeti\xE7\xF5es",
    value: ex.reps,
    onChange: e => handleExerciseChange(index, 'reps', e.target.value),
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Descanso (segundos)",
    value: ex.restTime,
    onChange: e => handleExerciseChange(index, 'restTime', e.target.value),
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Observa\xE7\xF5es",
    value: ex.notes,
    onChange: e => handleExerciseChange(index, 'notes', e.target.value),
    className: "md:col-span-3 w-full px-3 py-2 border rounded-md"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeExercise(index),
    className: "absolute top-2 right-2 text-red-500 hover:text-red-700"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "h-5 w-5"
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: addExercise,
    className: "flex items-center text-blue-500 font-medium py-2 px-4 rounded-lg hover:bg-blue-50"
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    className: "h-5 w-5 mr-2"
  }), "Adicionar Exerc\xEDcio"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: loading,
    className: "w-full flex justify-center items-center bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 shadow disabled:bg-green-300"
  }, /*#__PURE__*/React.createElement(Save, {
    className: "h-5 w-5 mr-2"
  }), loading ? 'Salvando...' : 'Salvar Treino')));
};

// --- PÁGINAS DO ADMIN ---
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {
    login
  } = useAuth();
  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) setError(result.message);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen flex items-center justify-center bg-gray-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center"
  }, /*#__PURE__*/React.createElement(Dumbbell, {
    className: "h-12 w-12 text-blue-500"
  }), /*#__PURE__*/React.createElement("h2", {
    className: "mt-4 text-2xl font-bold text-center"
  }, "Academia App"), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600"
  }, "Bem-vindo(a)!")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleLogin,
    className: "space-y-6"
  }, error && /*#__PURE__*/React.createElement("p", {
    className: "text-red-500 text-sm text-center"
  }, error), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "Email",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true,
    className: "w-full px-3 py-2 mt-1 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "Senha",
    value: password,
    onChange: e => setPassword(e.target.value),
    required: true,
    className: "w-full px-3 py-2 mt-1 border rounded-md"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
  }, "Entrar"))));
};
const FinancialSummary = () => {
  const [summary, setSummary] = useState({
    received: 0,
    toReceive: 0,
    activeMembers: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  useEffect(() => {
    const users = db.getItem('gym_users') || [];
    const plans = db.getItem('gym_plans') || [];
    const members = users.filter(u => u.role === 'member');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let received = 0,
      toReceive = 0;
    members.forEach(member => {
      const plan = plans.find(p => p.id === member.planId);
      if (!plan) return;
      const payment = member.paymentHistory?.find(p => p.month === currentMonth && p.year === currentYear);
      if (payment?.status === 'Pago') received += plan.value;else toReceive += plan.value;
    });
    setSummary({
      received,
      toReceive,
      activeMembers: members.length
    });
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
    const sortedRevenue = Object.entries(revenue).sort(([a], [b]) => new Date(a.split('/')[1], a.split('/')[0] - 1) - new Date(b.split('/')[1], b.split('/')[0] - 1)).slice(-6);
    setMonthlyRevenue(sortedRevenue);
  }, []);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-green-100 p-4 rounded-lg shadow"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-semibold text-green-800"
  }, "Recebido (M\xEAs Atual)"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-green-900"
  }, "R$ ", summary.received.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    className: "bg-yellow-100 p-4 rounded-lg shadow"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-semibold text-yellow-800"
  }, "A Receber (M\xEAs Atual)"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-yellow-900"
  }, "R$ ", summary.toReceive.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-100 p-4 rounded-lg shadow"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-semibold text-blue-800"
  }, "Alunos Ativos"), /*#__PURE__*/React.createElement("p", {
    className: "text-2xl font-bold text-blue-900"
  }, summary.activeMembers))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold text-gray-700 mb-4"
  }, "Receita Mensal (\xDAltimos 6 meses)"), monthlyRevenue.length > 0 ? /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
  }, monthlyRevenue.map(([monthYear, total]) => /*#__PURE__*/React.createElement("div", {
    key: monthYear,
    className: "bg-gray-50 p-4 rounded-lg text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-gray-800"
  }, "R$ ", total.toFixed(2)), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, monthYear)))) : /*#__PURE__*/React.createElement("p", {
    className: "text-gray-500"
  }, "Nenhum hist\xF3rico de receita encontrado.")));
};
const AdminDashboard = ({
  setPage,
  setCurrentMemberId
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800 mb-4"
  }, "Painel Principal"), /*#__PURE__*/React.createElement(FinancialSummary, null));
};
const StudentsPage = ({
  setPage,
  setCurrentMemberId
}) => {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    setMembers((db.getItem('gym_users') || []).filter(u => u.role === 'member'));
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Alunos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPage('addMember'),
    className: "flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow"
  }, /*#__PURE__*/React.createElement(UserPlus, {
    className: "h-5 w-5 mr-2"
  }), "Adicionar")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, members.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-center text-gray-500 py-8"
  }, "Nenhum aluno cadastrado ainda.") : /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, members.map(member => /*#__PURE__*/React.createElement("li", {
    key: member.id,
    onClick: () => {
      setCurrentMemberId(member.id);
      setPage('memberDetails');
    },
    className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, member.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, member.email)), /*#__PURE__*/React.createElement("span", {
    className: "text-sm text-blue-500 font-medium"
  }, "Ver Detalhes"))))));
};
const AddMemberForm = ({
  setPage
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState('');
  const [plans, setPlans] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
  useEffect(() => {
    setPlans(db.getItem('gym_plans') || []);
  }, []);
  const handleAddMember = async e => {
    e.preventDefault();
    if (!planId) {
      setModalInfo({
        show: true,
        message: 'Selecione um plano.'
      });
      return;
    }
    const users = db.getItem('gym_users') || [];
    if (users.some(u => u.email === email)) {
      setModalInfo({
        show: true,
        message: 'Email já em uso.'
      });
      return;
    }
    const newMember = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'member',
      planId,
      joinDate: new Date().toISOString(),
      paymentHistory: [],
      sheetId: null,
      currentWorkoutIndex: 0,
      personalSheetId: null,
      currentPersonalWorkoutIndex: 0,
      activeTrainingMode: 'assisted'
    };
    users.push(newMember);
    db.setItem('gym_users', users);
    try {
      await firebaseDb.collection('members').doc(newMember.id).set(newMember);
    } catch (err) {
      console.error('Erro ao salvar no Firebase', err);
    }
    setModalInfo({
      show: true,
      message: `Aluno ${name} cadastrado!`
    });
    setName('');
    setEmail('');
    setPassword('');
    setPlanId('');
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPage('students'),
    className: "flex items-center text-blue-500 mb-6"
  }, /*#__PURE__*/React.createElement(ArrowLeft, {
    className: "h-4 w-4 mr-2"
  }), "Voltar para Alunos"), /*#__PURE__*/React.createElement("div", {
    className: "max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold mb-6"
  }, "Cadastrar Aluno"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAddMember,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nome Completo",
    value: name,
    onChange: e => setName(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "email",
    placeholder: "Email",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "Senha Provis\xF3ria",
    value: password,
    onChange: e => setPassword(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("select", {
    value: planId,
    onChange: e => setPlanId(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border rounded-md bg-white"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Selecione um Plano"), plans.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name, " - R$ ", p.value))), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
  }, "Cadastrar"))));
};
const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    name: '',
    value: '',
    durationInMonths: ''
  });
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
  useEffect(() => {
    setPlans(db.getItem('gym_plans') || []);
  }, []);
  const handleAddPlan = e => {
    e.preventDefault();
    const updatedPlans = [...plans, {
      id: `plan_${Date.now()}`,
      name: newPlan.name,
      value: parseFloat(newPlan.value),
      durationInMonths: parseInt(newPlan.durationInMonths, 10)
    }];
    db.setItem('gym_plans', updatedPlans);
    setPlans(updatedPlans);
    setNewPlan({
      name: '',
      value: '',
      durationInMonths: ''
    });
    setModalInfo({
      show: true,
      message: "Plano adicionado!"
    });
  };
  const handleDeletePlan = planId => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    db.setItem('gym_plans', updatedPlans);
    setPlans(updatedPlans);
    setModalInfo({
      show: true,
      message: "Plano removido!"
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800 mb-6"
  }, "Gerenciamento de Planos"), /*#__PURE__*/React.createElement("div", {
    className: "grid md:grid-cols-3 gap-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-1 bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Adicionar Plano"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleAddPlan,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nome do Plano",
    value: newPlan.name,
    onChange: e => setNewPlan({
      ...newPlan,
      name: e.target.value
    }),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Valor (R$)",
    value: newPlan.value,
    onChange: e => setNewPlan({
      ...newPlan,
      value: e.target.value
    }),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "Dura\xE7\xE3o (meses)",
    value: newPlan.durationInMonths,
    onChange: e => setNewPlan({
      ...newPlan,
      durationInMonths: e.target.value
    }),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
  }, "Adicionar"))), /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2 bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Planos Existentes"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, plans.map(plan => /*#__PURE__*/React.createElement("li", {
    key: plan.id,
    className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, plan.name), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, "R$ ", plan.value.toFixed(2), " / ", plan.durationInMonths, " mes(es)")), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeletePlan(plan.id),
    className: "text-red-500 hover:text-red-700"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "h-5 w-5"
  }))))))));
};
const FinancialDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
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
  const handleMarkAsPaid = memberId => {
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
    setModalInfo({
      show: true,
      message: "Pagamento registrado!"
    });
  };
  const handleUnmarkAsPaid = memberId => {
    const users = db.getItem('gym_users');
    const userIndex = users.findIndex(u => u.id === memberId);
    if (userIndex === -1) return;
    users[userIndex].paymentHistory = users[userIndex].paymentHistory.filter(p => !(p.month === currentDate.getMonth() && p.year === currentDate.getFullYear()));
    db.setItem('gym_users', users);
    fetchPayments();
    setModalInfo({
      show: true,
      message: "Pagamento desmarcado!"
    });
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
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Financeiro"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: goToPreviousMonth,
    className: "p-2 rounded-full hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement(ChevronLeft, null)), /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-semibold capitalize"
  }, currentDate.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })), /*#__PURE__*/React.createElement("button", {
    onClick: goToNextMonth,
    className: "p-2 rounded-full hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement(ChevronRight, null)))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, payments.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-center text-gray-500 py-8"
  }, "Nenhum registro financeiro para este m\xEAs.") : /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, payments.map(p => /*#__PURE__*/React.createElement("li", {
    key: p.memberId,
    className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, p.memberName), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-600"
  }, p.planName, " - R$ ", p.value.toFixed(2)), p.status === 'Pago' && /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "Pago em: ", new Date(p.paymentDate).toLocaleDateString('pt-BR'))), p.status === 'Pago' ? /*#__PURE__*/React.createElement("button", {
    onClick: () => handleUnmarkAsPaid(p.memberId),
    className: "bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
  }, "Desmarcar") : /*#__PURE__*/React.createElement("button", {
    onClick: () => handleMarkAsPaid(p.memberId),
    className: "bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
  }, "Marcar como Pago"))))));
};
const WorkoutsManagement = ({
  ownerId
}) => {
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  useEffect(() => {
    const allWorkouts = db.getItem('gym_workouts') || [];
    setWorkouts(allWorkouts.filter(t => t.ownerId === ownerId));
  }, [ownerId]);
  const handleSaveWorkout = workoutData => {
    const allWorkouts = db.getItem('gym_workouts') || [];
    const existingIndex = allWorkouts.findIndex(t => t.id === workoutData.id);
    if (existingIndex > -1) allWorkouts[existingIndex] = workoutData;else allWorkouts.push(workoutData);
    db.setItem('gym_workouts', allWorkouts);
    setWorkouts(allWorkouts.filter(t => t.ownerId === ownerId));
    setEditingWorkout(null);
  };
  const handleDeleteWorkout = workoutId => {
    const allWorkouts = db.getItem('gym_workouts') || [];
    const updatedWorkouts = allWorkouts.filter(t => t.id !== workoutId);
    db.setItem('gym_workouts', updatedWorkouts);
    setWorkouts(updatedWorkouts.filter(t => t.ownerId === ownerId));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Treinos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditingWorkout({}),
    className: "flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow"
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    className: "h-5 w-5 mr-2"
  }), "Criar")), editingWorkout ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditingWorkout(null),
    className: "flex items-center text-blue-500 mb-4"
  }, /*#__PURE__*/React.createElement(ArrowLeft, {
    className: "h-4 w-4 mr-2"
  }), "Voltar"), /*#__PURE__*/React.createElement(WorkoutEditor, {
    workoutData: editingWorkout,
    onSave: handleSaveWorkout,
    ownerId: ownerId
  })) : /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Treinos Salvos"), workouts.length === 0 ? /*#__PURE__*/React.createElement("p", null, "Nenhum treino criado.") : /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, workouts.map(workout => /*#__PURE__*/React.createElement("li", {
    key: workout.id,
    className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, workout.name), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditingWorkout(workout),
    className: "text-blue-500 hover:text-blue-700 mr-4"
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteWorkout(workout.id),
    className: "text-red-500 hover:text-red-700"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "h-5 w-5"
  }))))))));
};
const TrainingSheetsManagement = ({
  ownerId,
  onAssignSheet,
  currentAssignedSheetId
}) => {
  const [sheets, setSheets] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [editingSheet, setEditingSheet] = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState('');
  const [sheetWorkouts, setSheetWorkouts] = useState([]);
  const [cardioDuration, setCardioDuration] = useState('');
  const specialDays = [{
    id: 'REST_DAY',
    name: 'Dia de Descanso'
  }, {
    id: 'CARDIO_DAY',
    name: 'Dia de Cardio'
  }];
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
  const startEditing = sheet => {
    setEditingSheet(sheet);
    setSheetName(sheet.name || '');
    setSheetWorkouts(sheet.workouts || []);
  };
  const handleAddWorkoutToSheet = () => {
    if (selectedWorkout) {
      let workoutToAdd = {
        id: selectedWorkout
      };
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
  const handleRemoveWorkoutFromSheet = index => {
    const newSheetWorkouts = [...sheetWorkouts];
    newSheetWorkouts.splice(index, 1);
    setSheetWorkouts(newSheetWorkouts);
  };
  const handleSaveSheet = () => {
    const allSheets = db.getItem('gym_training_sheets') || [];
    const newSheet = {
      id: editingSheet?.id || `sheet_${Date.now()}`,
      name: sheetName,
      workouts: sheetWorkouts,
      ownerId
    };
    const existingIndex = allSheets.findIndex(r => r.id === newSheet.id);
    if (existingIndex > -1) allSheets[existingIndex] = newSheet;else allSheets.push(newSheet);
    db.setItem('gym_training_sheets', allSheets);
    setSheets(allSheets.filter(r => r.ownerId === ownerId));
    setEditingSheet(null);
  };
  const handleDeleteSheet = sheetId => {
    const allSheets = db.getItem('gym_training_sheets') || [];
    const updatedSheets = allSheets.filter(r => r.id !== sheetId);
    db.setItem('gym_training_sheets', updatedSheets);
    setSheets(updatedSheets.filter(r => r.ownerId === ownerId));
  };
  const getWorkoutName = workout => {
    const special = specialDays.find(d => d.id === workout.id);
    if (special) return special.name + (workout.duration ? ` (${workout.duration} min)` : '');
    return workouts.find(t => t.id === workout.id)?.name || 'Treino não encontrado';
  };
  if (editingSheet) {
    return /*#__PURE__*/React.createElement("div", {
      className: "p-4 md:p-8"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setEditingSheet(null),
      className: "flex items-center text-blue-500 mb-4"
    }, /*#__PURE__*/React.createElement(ArrowLeft, {
      className: "h-4 w-4 mr-2"
    }), "Voltar"), /*#__PURE__*/React.createElement("div", {
      className: "bg-white p-6 rounded-xl shadow-lg"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xl font-semibold mb-4"
    }, "Editando Ficha"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Nome da Ficha",
      value: sheetName,
      onChange: e => setSheetName(e.target.value),
      className: "w-full px-3 py-2 border rounded-md mb-4"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bg-gray-50 p-4 rounded-lg"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "font-semibold mb-2"
    }, "Sequ\xEAncia de Treinos"), /*#__PURE__*/React.createElement("ul", {
      className: "space-y-2 mb-4"
    }, sheetWorkouts.map((workout, index) => /*#__PURE__*/React.createElement("li", {
      key: index,
      className: "flex justify-between items-center p-2 bg-white rounded-md border"
    }, /*#__PURE__*/React.createElement("span", null, index + 1, ". ", getWorkoutName(workout)), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleRemoveWorkoutFromSheet(index),
      className: "text-red-500"
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 18
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 items-end"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-grow"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-sm"
    }, "Item"), /*#__PURE__*/React.createElement("select", {
      value: selectedWorkout,
      onChange: e => setSelectedWorkout(e.target.value),
      className: "w-full px-3 py-2 border rounded-md bg-white"
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-- Selecione --"), /*#__PURE__*/React.createElement("optgroup", {
      label: "Dias Especiais"
    }, specialDays.map(d => /*#__PURE__*/React.createElement("option", {
      key: d.id,
      value: d.id
    }, d.name))), /*#__PURE__*/React.createElement("optgroup", {
      label: "Treinos"
    }, workouts.map(t => /*#__PURE__*/React.createElement("option", {
      key: t.id,
      value: t.id
    }, t.name))))), selectedWorkout === 'CARDIO_DAY' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "text-sm"
    }, "Dura\xE7\xE3o (min)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: cardioDuration,
      onChange: e => setCardioDuration(e.target.value),
      className: "w-full px-3 py-2 border rounded-md",
      placeholder: "ex: 30"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: handleAddWorkoutToSheet,
      className: "bg-blue-500 text-white px-4 py-2 rounded-md self-end"
    }, "Adicionar"))), /*#__PURE__*/React.createElement("button", {
      onClick: handleSaveSheet,
      className: "mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md"
    }, "Salvar Ficha")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold"
  }, "Fichas de Treino"), /*#__PURE__*/React.createElement("button", {
    onClick: () => startEditing({}),
    className: "flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow"
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    className: "h-5 w-5 mr-2"
  }), "Criar")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Fichas Salvas"), sheets.length === 0 ? /*#__PURE__*/React.createElement("p", null, "Nenhuma ficha criada.") : /*#__PURE__*/React.createElement("ul", {
    className: "space-y-3"
  }, sheets.map(sheet => /*#__PURE__*/React.createElement("li", {
    key: sheet.id,
    className: "flex justify-between items-center p-4 bg-gray-50 rounded-lg"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, sheet.name), onAssignSheet && /*#__PURE__*/React.createElement("button", {
    onClick: () => onAssignSheet(sheet.id),
    className: `mt-1 text-sm px-2 py-1 rounded ${currentAssignedSheetId === sheet.id ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`
  }, currentAssignedSheetId === sheet.id ? 'Ativa' : 'Definir como ativa')), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => startEditing(sheet),
    className: "text-blue-500 mr-4"
  }, "Editar"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteSheet(sheet.id),
    className: "text-red-500"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "h-5 w-5"
  }))))))));
};
const SettingsPage = ({
  gymName,
  setGymName
}) => {
  const {
    user,
    updateUser,
    logout
  } = useAuth();
  const [settings, setSettings] = useState({
    openDays: [],
    gymName: ''
  });
  const [adminEmail, setAdminEmail] = useState(user.email);
  const [adminPassword, setAdminPassword] = useState('');
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    onConfirm: null,
    title: '',
    message: ''
  });
  const daysOfWeek = [{
    id: 1,
    name: 'Segunda'
  }, {
    id: 2,
    name: 'Terça'
  }, {
    id: 3,
    name: 'Quarta'
  }, {
    id: 4,
    name: 'Quinta'
  }, {
    id: 5,
    name: 'Sexta'
  }, {
    id: 6,
    name: 'Sábado'
  }, {
    id: 0,
    name: 'Domingo'
  }];
  useEffect(() => {
    const currentSettings = db.getItem('gym_settings') || {
      openDays: [],
      gymName: 'Academia App'
    };
    setSettings(currentSettings);
  }, []);
  const handleDayToggle = dayId => {
    const openDays = settings.openDays.includes(dayId) ? settings.openDays.filter(d => d !== dayId) : [...settings.openDays, dayId];
    setSettings({
      ...settings,
      openDays
    });
  };
  const handleSaveSettings = () => {
    db.setItem('gym_settings', settings);
    setGymName(settings.gymName);
    setModalInfo({
      show: true,
      message: 'Configurações gerais salvas!'
    });
  };
  const handleUpdateCredentials = e => {
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
      setModalInfo({
        show: true,
        message: 'Credenciais atualizadas! Pode ser necessário fazer login novamente.'
      });
    }
  };
  const openConfirmModal = (action, title, message) => {
    setConfirmModalState({
      isOpen: true,
      onConfirm: action,
      title,
      message
    });
  };
  const closeConfirmModal = () => {
    setConfirmModalState({
      isOpen: false,
      onConfirm: null,
      title: '',
      message: ''
    });
  };
  const handleDeleteAllStudents = () => {
    const users = db.getItem('gym_users');
    const remainingUsers = users.filter(u => u.role !== 'member');
    db.setItem('gym_users', remainingUsers);
    setModalInfo({
      show: true,
      message: 'Todos os alunos foram removidos!'
    });
    closeConfirmModal();
  };
  const handleDeleteAllWorkouts = () => {
    db.setItem('gym_workouts', []);
    setModalInfo({
      show: true,
      message: 'Todos os treinos foram removidos!'
    });
    closeConfirmModal();
  };
  const handleDeleteAllSheets = () => {
    db.setItem('gym_training_sheets', []);
    setModalInfo({
      show: true,
      message: 'Todas as fichas foram removidas!'
    });
    closeConfirmModal();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8 space-y-8"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement(ConfirmationModal, _extends({}, confirmModalState, {
    onClose: closeConfirmModal
  })), /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Configura\xE7\xF5es"), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Configura\xE7\xF5es Gerais"), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-sm font-medium text-gray-700"
  }, "Nome da Academia"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: settings.gymName,
    onChange: e => setSettings({
      ...settings,
      gymName: e.target.value
    }),
    className: "mt-1 w-full px-3 py-2 border rounded-md"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-medium text-gray-700 mb-2"
  }, "Dias de Funcionamento"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-4 gap-4"
  }, daysOfWeek.map(day => /*#__PURE__*/React.createElement("label", {
    key: day.id,
    className: "flex items-center space-x-2 cursor-pointer"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: settings.openDays.includes(day.id),
    onChange: () => handleDayToggle(day.id),
    className: "h-5 w-5 rounded"
  }), /*#__PURE__*/React.createElement("span", null, day.name))))), /*#__PURE__*/React.createElement("button", {
    onClick: handleSaveSettings,
    className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
  }, "Salvar Configura\xE7\xF5es"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Credenciais de Administrador"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleUpdateCredentials,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: adminEmail,
    onChange: e => setAdminEmail(e.target.value),
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    placeholder: "Digite a nova senha (deixe em branco para n\xE3o alterar)",
    value: adminPassword,
    onChange: e => setAdminPassword(e.target.value),
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
  }, "Atualizar Credenciais"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-red-800 flex items-center"
  }, /*#__PURE__*/React.createElement(AlertTriangle, {
    className: "mr-2"
  }), "Zona de Perigo"), /*#__PURE__*/React.createElement("p", {
    className: "text-red-700 mt-2 mb-4"
  }, "As a\xE7\xF5es abaixo s\xE3o permanentes e n\xE3o podem ser desfeitas. Tenha certeza do que est\xE1 fazendo."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openConfirmModal(handleDeleteAllStudents, 'Apagar Alunos?', 'Isso removerá permanentemente todos os alunos cadastrados.'),
    className: "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
  }, "Apagar Todos os Alunos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => openConfirmModal(handleDeleteAllWorkouts, 'Apagar Treinos?', 'Isso removerá permanentemente todos os treinos criados.'),
    className: "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
  }, "Apagar Todos os Treinos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => openConfirmModal(handleDeleteAllSheets, 'Apagar Fichas?', 'Isso removerá permanentemente todas as fichas criadas.'),
    className: "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
  }, "Apagar Todas as Fichas"))));
};
const MemberDetails = ({
  setPage,
  memberId
}) => {
  const [member, setMember] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    planId: ''
  });
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: ''
  });
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    onConfirm: null,
    title: '',
    message: ''
  });
  useEffect(() => {
    if (memberId) {
      const allUsers = db.getItem('gym_users') || [];
      const foundMember = allUsers.find(u => u.id === memberId);
      setMember(foundMember);
      setEditForm({
        name: foundMember.name,
        email: foundMember.email,
        password: '',
        planId: foundMember.planId
      });
      const allSheets = db.getItem('gym_training_sheets') || [];
      setSheets(allSheets.filter(r => r.ownerId === 'admin_user_01'));
      setPlans(db.getItem('gym_plans') || []);
    }
  }, [memberId]);
  const handleAssignSheet = sheetId => {
    const allUsers = db.getItem('gym_users');
    const userIndex = allUsers.findIndex(u => u.id === memberId);
    if (userIndex > -1) {
      allUsers[userIndex].sheetId = sheetId;
      allUsers[userIndex].currentWorkoutIndex = 0;
      db.setItem('gym_users', allUsers);
      setMember(allUsers[userIndex]);
      setModalInfo({
        show: true,
        message: 'Ficha atribuída com sucesso!'
      });
    }
  };
  const handleUpdateMember = e => {
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
      setModalInfo({
        show: true,
        message: 'Dados do aluno atualizados!'
      });
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
    setModalInfo({
      show: true,
      message: 'Aluno e todos os seus dados foram removidos.'
    });
    setPage('students');
  };
  if (!member) return /*#__PURE__*/React.createElement("div", {
    className: "p-8"
  }, /*#__PURE__*/React.createElement(Spinner, null));
  const currentSheet = sheets.find(r => r.id === member.sheetId);
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, modalInfo.show && /*#__PURE__*/React.createElement(CustomModal, {
    message: modalInfo.message,
    onClose: () => setModalInfo({
      show: false,
      message: ''
    })
  }), /*#__PURE__*/React.createElement(ConfirmationModal, {
    isOpen: confirmModalState.isOpen,
    onClose: () => setConfirmModalState({
      isOpen: false
    }),
    onConfirm: handleDeleteMember,
    title: "Confirmar Exclus\xE3o",
    message: `Tem certeza que deseja excluir ${member.name}? Todos os seus dados (histórico, medidas) serão perdidos.`
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPage('students'),
    className: "flex items-center text-blue-500 mb-6"
  }, /*#__PURE__*/React.createElement(ArrowLeft, {
    className: "h-4 w-4 mr-2"
  }), "Voltar para Alunos"), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement(User, {
    className: "mr-3 h-8 w-8 text-blue-500"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-gray-800"
  }, member.name), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600"
  }, member.email))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsEditing(!isEditing),
    className: "p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
  }, /*#__PURE__*/React.createElement(Edit, {
    className: "h-5 w-5 text-gray-600"
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setConfirmModalState({
      isOpen: true
    }),
    className: "p-2 bg-red-100 rounded-lg hover:bg-red-200"
  }, /*#__PURE__*/React.createElement(Trash2, {
    className: "h-5 w-5 text-red-600"
  }))))), isEditing && /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg mb-6"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Editar Aluno"), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleUpdateMember,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: editForm.name,
    onChange: e => setEditForm({
      ...editForm,
      name: e.target.value
    }),
    className: "w-full px-3 py-2 border rounded-md",
    placeholder: "Nome"
  }), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: editForm.email,
    onChange: e => setEditForm({
      ...editForm,
      email: e.target.value
    }),
    className: "w-full px-3 py-2 border rounded-md",
    placeholder: "Email"
  }), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: editForm.password,
    onChange: e => setEditForm({
      ...editForm,
      password: e.target.value
    }),
    className: "w-full px-3 py-2 border rounded-md",
    placeholder: "Nova senha (opcional)"
  }), /*#__PURE__*/React.createElement("select", {
    value: editForm.planId,
    onChange: e => setEditForm({
      ...editForm,
      planId: e.target.value
    }),
    className: "w-full px-3 py-2 border rounded-md bg-white"
  }, plans.map(p => /*#__PURE__*/React.createElement("option", {
    key: p.id,
    value: p.id
  }, p.name, " - R$ ", p.value))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setIsEditing(false),
    className: "w-full py-2 rounded-md bg-gray-200"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full py-2 rounded-md bg-green-500 text-white"
  }, "Salvar Altera\xE7\xF5es")))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Atribuir Ficha (Assistida)"), /*#__PURE__*/React.createElement("p", {
    className: "mb-2"
  }, "Ficha Atual: ", /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, currentSheet?.name || 'Nenhuma')), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("select", {
    onChange: e => handleAssignSheet(e.target.value),
    value: member.sheetId || '',
    className: "flex-grow px-3 py-2 border rounded-md bg-white"
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "-- Selecione uma ficha --"), sheets.map(r => /*#__PURE__*/React.createElement("option", {
    key: r.id,
    value: r.id
  }, r.name))))));
};

// --- PÁGINAS DO ALUNO ---
const MeasurementsPage = () => {
  const {
    user
  } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    arm: '',
    thigh: '',
    waist: '',
    chest: '',
    hip: ''
  });
  useEffect(() => {
    const allMeasurements = db.getItem('gym_measurements') || [];
    setMeasurements(allMeasurements.filter(m => m.userId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [user.id]);
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setCurrentMeasurement(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSave = e => {
    e.preventDefault();
    const allMeasurements = db.getItem('gym_measurements') || [];
    const newRecord = {
      ...currentMeasurement,
      userId: user.id,
      id: `m_${Date.now()}`
    };
    const otherUserMeasurements = allMeasurements.filter(m => m.userId !== user.id);
    const thisUserMeasurements = allMeasurements.filter(m => m.userId === user.id);
    const updatedMeasurements = [...otherUserMeasurements, newRecord, ...thisUserMeasurements];
    db.setItem('gym_measurements', updatedMeasurements);
    setMeasurements([newRecord, ...thisUserMeasurements].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setIsFormVisible(false);
    setCurrentMeasurement({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      arm: '',
      thigh: '',
      waist: '',
      chest: '',
      hip: ''
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Minhas Medidas"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsFormVisible(!isFormVisible),
    className: "flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow"
  }, /*#__PURE__*/React.createElement(PlusCircle, {
    className: "h-5 w-5 mr-2"
  }), isFormVisible ? 'Fechar' : 'Adicionar Registro')), isFormVisible && /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg mb-6"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSave,
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("input", {
    type: "date",
    name: "date",
    value: currentMeasurement.date,
    onChange: handleInputChange,
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "weight",
    placeholder: "Peso (kg)",
    value: currentMeasurement.weight,
    onChange: handleInputChange,
    required: true,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "chest",
    placeholder: "Peitoral (cm)",
    value: currentMeasurement.chest,
    onChange: handleInputChange,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "arm",
    placeholder: "Bra\xE7o (cm)",
    value: currentMeasurement.arm,
    onChange: handleInputChange,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "waist",
    placeholder: "Cintura (cm)",
    value: currentMeasurement.waist,
    onChange: handleInputChange,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "hip",
    placeholder: "Quadril (cm)",
    value: currentMeasurement.hip,
    onChange: handleInputChange,
    className: "w-full px-3 py-2 border rounded-md"
  }), /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.1",
    name: "thigh",
    placeholder: "Coxa (cm)",
    value: currentMeasurement.thigh,
    onChange: handleInputChange,
    className: "w-full px-3 py-2 border rounded-md"
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
  }, "Salvar Registro"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, measurements.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "text-center text-gray-500"
  }, "Nenhum registro de medida encontrado.") : measurements.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "bg-white p-4 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-lg text-blue-600 mb-2"
  }, new Date(m.date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC'
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Peso"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.weight, " kg")), /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Peitoral"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.chest, " cm")), /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Bra\xE7o"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.arm, " cm")), /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Cintura"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.waist, " cm")), /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Quadril"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.hip, " cm")), /*#__PURE__*/React.createElement("div", {
    className: "bg-gray-50 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-gray-500"
  }, "Coxa"), /*#__PURE__*/React.createElement("p", {
    className: "font-semibold"
  }, m.thigh, " cm")))))));
};
const MyTrainingPage = ({
  setPage
}) => {
  const {
    user,
    updateUser
  } = useAuth();
  const [subPage, setSubPage] = useState('sheets'); // 'sheets' or 'workouts'

  const handleAssignPersonalSheet = sheetId => {
    const updatedUser = {
      ...user,
      personalSheetId: sheetId,
      currentPersonalWorkoutIndex: 0
    };
    updateUser(updatedUser);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8 border-b bg-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Meu Treino"), /*#__PURE__*/React.createElement("div", {
    className: "flex space-x-2 rounded-lg bg-gray-200 p-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPage('sheets'),
    className: `px-3 py-1 text-sm font-medium rounded-md ${subPage === 'sheets' ? 'bg-white shadow' : ''}`
  }, "Minhas Fichas"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSubPage('workouts'),
    className: `px-3 py-1 text-sm font-medium rounded-md ${subPage === 'workouts' ? 'bg-white shadow' : ''}`
  }, "Meus Treinos")))), subPage === 'sheets' ? /*#__PURE__*/React.createElement(TrainingSheetsManagement, {
    ownerId: user.id,
    onAssignSheet: handleAssignPersonalSheet,
    currentAssignedSheetId: user.personalSheetId
  }) : /*#__PURE__*/React.createElement(WorkoutsManagement, {
    ownerId: user.id
  }));
};
const MemberDashboard = ({
  setPage
}) => {
  const {
    user,
    updateUser
  } = useAuth();
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
        if (workoutInfo.id === 'REST_DAY') setTodayWorkout({
          id: 'REST_DAY',
          name: 'Dia de Descanso'
        });else if (workoutInfo.id === 'CARDIO_DAY') setTodayWorkout({
          id: 'CARDIO_DAY',
          name: 'Dia de Cardio',
          duration: workoutInfo.duration
        });else setTodayWorkout(workouts.find(t => t.id === workoutInfo.id));
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
  const handleToggleExercise = index => {
    const newCompletedIndices = completedIndices.includes(index) ? completedIndices.filter(i => i !== index) : [...completedIndices, index];
    setCompletedIndices(newCompletedIndices);
    db.setItem(todayKey, newCompletedIndices);
  };
  const handleFinishDay = () => {
    const allHistory = db.getItem('gym_training_history') || [];
    allHistory.push({
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      workoutName: todayWorkout.name
    });
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
      updatedUser = {
        ...user,
        currentWorkoutIndex: nextIndex
      };
    } else {
      sheetId = user.personalSheetId;
      currentIndex = user.currentPersonalWorkoutIndex || 0;
      const currentSheet = sheets.find(r => r.id === sheetId);
      if (!currentSheet) return;
      let nextIndex = currentIndex + 1;
      if (nextIndex >= currentSheet.workouts.length) nextIndex = 0;
      updatedUser = {
        ...user,
        currentPersonalWorkoutIndex: nextIndex
      };
    }
    updateUser(updatedUser);
    db.setItem(todayKey, []);
    setCompletedIndices([]);
    setTodayWorkout(null);
  };
  const handleModeChange = mode => {
    setTrainingMode(mode);
    updateUser({
      ...user,
      activeTrainingMode: mode
    });
  };
  const startTimer = seconds => {
    setTimerInitialTime(seconds);
    setIsTimerOpen(true);
  };
  if (loading) return /*#__PURE__*/React.createElement("div", {
    className: "p-8"
  }, /*#__PURE__*/React.createElement(Spinner, null));
  if (!isGymOpen) return /*#__PURE__*/React.createElement("div", {
    className: "p-8 text-center"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold mb-4"
  }, "Academia fechada hoje. Bom descanso!"));
  const totalExercises = todayWorkout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? completedIndices.length / totalExercises * 100 : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement(TimerModal, {
    isOpen: isTimerOpen,
    onClose: () => setIsTimerOpen(false),
    initialTime: timerInitialTime
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800"
  }, "Ol\xE1, ", user.name, "!"), /*#__PURE__*/React.createElement("div", {
    className: "flex space-x-1 rounded-lg bg-gray-200 p-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleModeChange('assisted'),
    className: `px-3 py-1 text-sm font-medium rounded-md ${trainingMode === 'assisted' ? 'bg-white shadow' : ''}`
  }, "Treino Assistido"), /*#__PURE__*/React.createElement("button", {
    onClick: () => handleModeChange('personal'),
    className: `px-3 py-1 text-sm font-medium rounded-md ${trainingMode === 'personal' ? 'bg-white shadow' : ''}`
  }, "Meu Treino"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-xl shadow-lg"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-semibold mb-4"
  }, "Seu Treino de Hoje"), !todayWorkout ? /*#__PURE__*/React.createElement("p", null, !user.sheetId && trainingMode === 'assisted' ? 'Nenhuma ficha assistida atribuída.' : !user.personalSheetId && trainingMode === 'personal' ? 'Você não selecionou uma ficha pessoal. Crie uma em "Meu Treino".' : 'Dia finalizado com sucesso! Bom descanso! 💪') : /*#__PURE__*/React.createElement("div", null, todayWorkout.id === 'REST_DAY' ? /*#__PURE__*/React.createElement("div", {
    className: "text-center p-8"
  }, /*#__PURE__*/React.createElement(Coffee, {
    size: 64,
    className: "mx-auto text-blue-500 mb-4"
  }), /*#__PURE__*/React.createElement("h4", {
    className: "text-2xl font-bold"
  }, "Dia de Descanso"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2"
  }, "Aproveite para recuperar as energias."), /*#__PURE__*/React.createElement("button", {
    onClick: handleFinishDay,
    className: "w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg"
  }, "Finalizar Dia")) : todayWorkout.id === 'CARDIO_DAY' ? /*#__PURE__*/React.createElement("div", {
    className: "text-center p-8"
  }, /*#__PURE__*/React.createElement(HeartPulse, {
    size: 64,
    className: "mx-auto text-red-500 mb-4"
  }), /*#__PURE__*/React.createElement("h4", {
    className: "text-2xl font-bold"
  }, todayWorkout.name), /*#__PURE__*/React.createElement("p", {
    className: "mt-2"
  }, "Dura\xE7\xE3o: ", todayWorkout.duration, " minutos"), /*#__PURE__*/React.createElement("button", {
    onClick: () => startTimer(todayWorkout.duration * 60),
    className: "w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-lg"
  }, "Iniciar Cardio"), /*#__PURE__*/React.createElement("button", {
    onClick: handleFinishDay,
    className: "w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-lg"
  }, "Finalizar Dia")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-2xl font-bold text-blue-600 mb-2"
  }, todayWorkout.name), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600 mb-4"
  }, "Progresso: ", completedIndices.length, " de ", totalExercises, " exerc\xEDcios"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: progressPercentage
  }), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4 mt-6"
  }, todayWorkout.exercises.map((ex, index) => {
    const isCompleted = completedIndices.includes(index);
    return /*#__PURE__*/React.createElement("div", {
      key: index,
      className: `p-4 rounded-lg border ${isCompleted ? 'bg-green-50' : 'bg-gray-50'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
      className: `font-bold text-lg ${isCompleted ? 'line-through' : ''}`
    }, ex.name), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-3 gap-x-4 mt-2 text-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-sm"
    }, "S\xE9ries"), /*#__PURE__*/React.createElement("p", {
      className: "font-semibold"
    }, ex.sets)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-sm"
    }, "Reps"), /*#__PURE__*/React.createElement("p", {
      className: "font-semibold"
    }, ex.reps)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-sm"
    }, "Descanso"), /*#__PURE__*/React.createElement("p", {
      className: "font-semibold"
    }, ex.restTime ? `${ex.restTime}s` : 'N/A'))), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 text-left"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm"
    }, "Obs."), /*#__PURE__*/React.createElement("p", {
      className: "font-semibold"
    }, ex.notes || 'N/A'))), /*#__PURE__*/React.createElement("button", {
      onClick: () => handleToggleExercise(index),
      className: `flex-shrink-0 p-2 rounded-md ${isCompleted ? 'bg-gray-300' : 'bg-blue-500 text-white'}`
    }, isCompleted ? /*#__PURE__*/React.createElement(CheckSquare, null) : /*#__PURE__*/React.createElement(Square, null))));
  })), progressPercentage === 100 && /*#__PURE__*/React.createElement("button", {
    onClick: handleFinishDay,
    className: "w-full mt-6 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-lg"
  }, "Finalizar Treino do Dia ", /*#__PURE__*/React.createElement(ChevronsRight, null))))));
};
const TrainingHistoryPage = () => {
  const {
    user
  } = useAuth();
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
      grid.push({
        day,
        historyEntry
      });
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
        left: rect.left + rect.width / 2
      });
    } else {
      setTooltip(null);
    }
  };
  const today = new Date();
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 md:p-8"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl md:text-3xl font-bold text-gray-800 mb-6"
  }, "Hist\xF3rico de Treinos"), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 sm:p-6 rounded-xl shadow-lg relative"
  }, tooltip && /*#__PURE__*/React.createElement("div", {
    className: "absolute z-10 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg",
    style: {
      top: `${tooltip.top - 50}px`,
      left: `${tooltip.left}px`,
      transform: 'translateX(-50%)'
    }
  }, tooltip.content, /*#__PURE__*/React.createElement("div", {
    className: "absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-2 h-2 bg-gray-800 transform rotate-45"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: goToPreviousMonth,
    className: "p-2 rounded-full hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement(ChevronLeft, null)), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg sm:text-xl font-semibold text-gray-700 capitalize"
  }, currentDate.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  })), /*#__PURE__*/React.createElement("button", {
    onClick: goToNextMonth,
    className: "p-2 rounded-full hover:bg-gray-100"
  }, /*#__PURE__*/React.createElement(ChevronRight, null))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-7 gap-1 text-center text-xs sm:text-sm text-gray-500 font-medium"
  }, /*#__PURE__*/React.createElement("div", null, "Seg"), /*#__PURE__*/React.createElement("div", null, "Ter"), /*#__PURE__*/React.createElement("div", null, "Qua"), /*#__PURE__*/React.createElement("div", null, "Qui"), /*#__PURE__*/React.createElement("div", null, "Sex"), /*#__PURE__*/React.createElement("div", null, "S\xE1b"), /*#__PURE__*/React.createElement("div", null, "Dom")), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-7 gap-1 mt-2"
  }, calendarGrid.map((dayData, index) => /*#__PURE__*/React.createElement("div", {
    key: index,
    className: `aspect-square p-1.5 border rounded-lg flex flex-col items-center justify-between transition-colors ${dayData ? 'bg-white' : 'bg-gray-50'}`,
    onClick: e => handleDayClick(dayData, e)
  }, dayData && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: `text-sm sm:text-base font-medium ${dayData.day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear() ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'text-gray-700'}`
  }, dayData.day), dayData.historyEntry && /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 bg-green-500 rounded-full mb-1"
  })))))));
};

// --- COMPONENTE PRINCIPAL DO APP ---
const App = () => {
  useEffect(() => {
    initializeLocalDb();
  }, []);
  return /*#__PURE__*/React.createElement(AuthProvider, null, /*#__PURE__*/React.createElement(MainApp, null));
};
const MainApp = () => {
  const {
    user,
    logout,
    loading
  } = useAuth();
  const [page, setPage] = useState('login');
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [gymName, setGymName] = useState('Academia App');
  useEffect(() => {
    const settings = db.getItem('gym_settings');
    if (settings && settings.gymName) {
      setGymName(settings.gymName);
    }
    if (!loading) {
      if (user) setPage(user.role === 'admin' ? 'adminDashboard' : 'memberDashboard');else setPage('login');
    }
  }, [user, loading]);
  const AdminNav = ({
    activePage,
    setPage
  }) => /*#__PURE__*/React.createElement("nav", {
    className: "fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] h-16 flex justify-around items-center z-20"
  }, /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'adminDashboard',
    onClick: () => setPage('adminDashboard'),
    icon: /*#__PURE__*/React.createElement(Home, null),
    label: "Painel"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'students',
    onClick: () => setPage('students'),
    icon: /*#__PURE__*/React.createElement(Users, null),
    label: "Alunos"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'workouts',
    onClick: () => setPage('workouts'),
    icon: /*#__PURE__*/React.createElement(BookCopy, null),
    label: "Treinos"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'sheets',
    onClick: () => setPage('sheets'),
    icon: /*#__PURE__*/React.createElement(ClipboardList, null),
    label: "Fichas"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'plans',
    onClick: () => setPage('plans'),
    icon: /*#__PURE__*/React.createElement(ClipboardList, null),
    label: "Planos"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'financial',
    onClick: () => setPage('financial'),
    icon: /*#__PURE__*/React.createElement(DollarSign, null),
    label: "Financeiro"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'settings',
    onClick: () => setPage('settings'),
    icon: /*#__PURE__*/React.createElement(Settings, null),
    label: "Ajustes"
  }));
  const MemberNav = ({
    activePage,
    setPage
  }) => /*#__PURE__*/React.createElement("nav", {
    className: "fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] h-16 flex justify-around items-center z-20"
  }, /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'memberDashboard',
    onClick: () => setPage('memberDashboard'),
    icon: /*#__PURE__*/React.createElement(Dumbbell, null),
    label: "Hoje"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'myTraining',
    onClick: () => setPage('myTraining'),
    icon: /*#__PURE__*/React.createElement(Repeat, null),
    label: "Meu Treino"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'measurements',
    onClick: () => setPage('measurements'),
    icon: /*#__PURE__*/React.createElement(Ruler, null),
    label: "Medidas"
  }), /*#__PURE__*/React.createElement(NavButton, {
    active: activePage === 'history',
    onClick: () => setPage('history'),
    icon: /*#__PURE__*/React.createElement(Calendar, null),
    label: "Hist\xF3rico"
  }));
  const NavButton = ({
    active,
    onClick,
    icon,
    label
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: `flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`
  }, icon, /*#__PURE__*/React.createElement("span", {
    className: "text-xs mt-1 hidden sm:inline"
  }, label));
  const renderPage = () => {
    if (loading) return /*#__PURE__*/React.createElement("div", {
      className: "h-screen flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(Spinner, null));
    if (!user) return /*#__PURE__*/React.createElement(LoginPage, null);
    if (user.role === 'admin') {
      switch (page) {
        case 'adminDashboard':
          return /*#__PURE__*/React.createElement(AdminDashboard, null);
        case 'students':
          return /*#__PURE__*/React.createElement(StudentsPage, {
            setPage: setPage,
            setCurrentMemberId: setCurrentMemberId
          });
        case 'addMember':
          return /*#__PURE__*/React.createElement(AddMemberForm, {
            setPage: setPage
          });
        case 'memberDetails':
          return /*#__PURE__*/React.createElement(MemberDetails, {
            setPage: setPage,
            memberId: currentMemberId
          });
        case 'workouts':
          return /*#__PURE__*/React.createElement(WorkoutsManagement, {
            ownerId: "admin_user_01"
          });
        case 'sheets':
          return /*#__PURE__*/React.createElement(TrainingSheetsManagement, {
            ownerId: "admin_user_01"
          });
        case 'plans':
          return /*#__PURE__*/React.createElement(PlansManagement, null);
        case 'financial':
          return /*#__PURE__*/React.createElement(FinancialDashboard, null);
        case 'settings':
          return /*#__PURE__*/React.createElement(SettingsPage, {
            gymName: gymName,
            setGymName: setGymName
          });
        default:
          return /*#__PURE__*/React.createElement(AdminDashboard, null);
      }
    }
    // Member pages
    switch (page) {
      case 'memberDashboard':
        return /*#__PURE__*/React.createElement(MemberDashboard, null);
      case 'myTraining':
        return /*#__PURE__*/React.createElement(MyTrainingPage, null);
      case 'measurements':
        return /*#__PURE__*/React.createElement(MeasurementsPage, null);
      case 'history':
        return /*#__PURE__*/React.createElement(TrainingHistoryPage, null);
      default:
        return /*#__PURE__*/React.createElement(MemberDashboard, null);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "h-screen w-screen flex flex-col font-sans"
  }, user && /*#__PURE__*/React.createElement("header", {
    className: "bg-white shadow-md sticky top-0 z-10 w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-4 sm:px-6 lg:px-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between h-16"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement(Dumbbell, {
    className: "h-8 w-8 text-blue-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-xl ml-2 hidden sm:inline"
  }, gymName)), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-gray-600 mr-2 hidden sm:inline"
  }, "Ol\xE1, ", user.name), /*#__PURE__*/React.createElement("button", {
    onClick: logout,
    className: "flex items-center text-red-500 hover:text-red-700 p-2 rounded-md"
  }, /*#__PURE__*/React.createElement(LogOut, {
    className: "h-5 w-5"
  })))))), /*#__PURE__*/React.createElement("main", {
    className: "flex-grow overflow-y-auto bg-gray-100 pb-20"
  }, renderPage()), user && (user.role === 'admin' ? /*#__PURE__*/React.createElement(AdminNav, {
    activePage: page,
    setPage: setPage
  }) : /*#__PURE__*/React.createElement(MemberNav, {
    activePage: page,
    setPage: setPage
  })), /*#__PURE__*/React.createElement(InstallPWA, null));
};
const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosInstall, setShowIosInstall] = useState(false);
  useEffect(() => {
    const handleBeforeInstallPrompt = e => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = () => 'standalone' in window.navigator && window.navigator.standalone;
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
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50"
    }, /*#__PURE__*/React.createElement("span", null, "Instale o App!"), /*#__PURE__*/React.createElement("button", {
      onClick: handleInstallClick,
      className: "bg-white text-blue-600 font-bold px-4 py-2 rounded"
    }, "Instalar"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setInstallPrompt(null)
    }, /*#__PURE__*/React.createElement(X, {
      size: 20
    })));
  }
  if (showIosInstall) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fixed bottom-20 left-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setShowIosInstall(false),
      className: "absolute top-2 right-2"
    }, /*#__PURE__*/React.createElement(X, {
      size: 20
    })), /*#__PURE__*/React.createElement("p", {
      className: "text-center text-sm"
    }, "Para instalar, toque no \xEDcone ", /*#__PURE__*/React.createElement(Share, {
      className: "inline-block mx-1"
    }), " e depois em \"Adicionar \xE0 Tela de In\xEDcio\"."));
  }
  return null;
};
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));
