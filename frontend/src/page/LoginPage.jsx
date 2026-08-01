import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/login.css";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result.ok) {
        setError(result.error || 'Credenciales incorrectas');
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-login">
      {/* Resplandor suave de fondo en verde esmeralda */}
      <div className="login-bg-glow"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="tech-badge">ACCESO SEGURO</div>
          <h1>Iniciar Sesión</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email"
              className="form-control" 
              id="email" 
              placeholder="correo@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-badge">
              <span>⚠️</span> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner"></span> : 'Ingresar →'}
          </button>
        </form>
      </div>
    </div> 
  );
}

export default LoginPage;