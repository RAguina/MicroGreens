 INTEGRACIÓN DE AUTENTICACIÓN - Frontend Instructions

  🌐 Base Setup

  const API_BASE = 'https://micro-greens-backend.vercel.app';

  // CRUCIAL: Todas las requests deben incluir credentials para JWT cookies
  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include', // ← CRÍTICO para JWT cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  🔑 Flujo de Autenticación

  1. REGISTER (Crear cuenta)
  const register = async (userData) => {
    return await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password, // Min 8 chars
        name: userData.name
      })
    });
  };

  2. LOGIN (Iniciar sesión)
  const login = async (email, password) => {
    return await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    // ← Automáticamente setea JWT cookie HttpOnly
  };

  3. CHECK AUTH STATUS (Verificar si está logueado)
  const getCurrentUser = async () => {
    try {
      return await apiCall('/api/auth/me');
    } catch (error) {
      // Si falla = no está autenticado
      return null;
    }
  };

  4. LOGOUT
  const logout = async () => {
    return await apiCall('/api/auth/logout', { method: 'POST' });
    // ← Automáticamente borra JWT cookie
  };

  🛡️ Estado de Autenticación en Frontend

  // Estado global de auth (React/Vuex/Zustand/etc)
  const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al cargar la app, verificar si ya está autenticado
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const userData = await getCurrentUser();
          setUser(userData.user);
        } catch (error) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, []);

    const handleLogin = async (email, password) => {
      const response = await login(email, password);
      setUser(response.user);
      return response;
    };

    const handleLogout = async () => {
      await logout();
      setUser(null);
    };

    return {
      user,
      loading,
      isAuthenticated: !!user,
      login: handleLogin,
      logout: handleLogout
    };
  };

  📋 Usuario Demo (Para Testing)

  Si quieres usar el usuario demo existente:
  // Login con usuario demo
  await login('demo@microgreens.com', 'demo123');

  O crea un nuevo usuario:
  await register({
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User'
  });

  🔧 Manejo de Errores Auth

  // En tus API calls, manejar errores 401/403
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        // Token expirado o inválido → redirect a login
        setUser(null);
        router.push('/login');
      }
      throw error;
    }
  };

  ⚙️ Qué Endpoints Requieren Auth

  🔒 REQUIEREN AUTH:
  - POST /api/harvests (crear cosecha)
  - PUT /api/harvests/:id (editar cosecha)
  - DELETE /api/harvests/:id (eliminar cosecha)
  - POST /api/plant-types (solo ADMIN)
  - PUT /api/plant-types/:id (solo ADMIN)
  - DELETE /api/plant-types/:id (solo ADMIN)

  ✅ NO REQUIEREN AUTH:
  - GET /api/plantings (leer siembras)
  - POST /api/plantings (crear siembra)
  - GET /api/harvests (leer cosechas)
  - GET /api/plant-types (leer tipos)

  🚀 Setup Completo Ejemplo

  // 1. Setup inicial
  const auth = useAuth();

  // 2. En tu componente de login
  const handleLoginSubmit = async (formData) => {
    try {
      await auth.login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  // 3. En componentes protegidos
  if (auth.loading) return <Loading />;
  if (!auth.isAuthenticated) return <LoginForm />;

  // 4. Para crear cosechas (requiere auth)
  const createHarvest = async (harvestData) => {
    return await apiCall('/api/harvests', {
      method: 'POST',
      body: JSON.stringify(harvestData)
    });
  };