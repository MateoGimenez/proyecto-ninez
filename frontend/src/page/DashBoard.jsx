import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { obtenerEstadisticas } from '../services/servicesDashboard';
import '../styles/Dashboardpage .css';

const DashboardPage = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerEstadisticas();
      setEstadisticas(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={cargarEstadisticas}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!estadisticas) {
    return <div className="dashboard-container">No hay datos</div>;
  }

  const COLORS = ['#1a3a52', '#4a90b8', '#0066cc', '#1b7a3a', '#d97706', '#c41e3a'];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>📊 Panel de Administración</h1>
          <p>Estadísticas y análisis del sistema</p>
        </div>
        <button className="btn btn-secondary" onClick={cargarEstadisticas}>
          🔄 Actualizar
        </button>
      </div>

      {/* Grid de métricas principales */}
      <div className="metrics-grid">
        {/* Expedientes */}
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <p className="metric-label">Total Expedientes</p>
            <h2 className="metric-value">{estadisticas.expedientes.total}</h2>
          </div>
        </div>

        {/* Niños */}
        <div className="metric-card">
          <div className="metric-icon">👶</div>
          <div className="metric-content">
            <p className="metric-label">Total Niños</p>
            <h2 className="metric-value">{estadisticas.ninos.total}</h2>
          </div>
        </div>

        {/* Dispositivos */}
        <div className="metric-card">
          <div className="metric-icon">🏢</div>
          <div className="metric-content">
            <p className="metric-label">Dispositivos</p>
            <h2 className="metric-value">{estadisticas.dispositivos.total}</h2>
          </div>
        </div>

        {/* Usuarios */}
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <p className="metric-label">Usuarios Activos</p>
            <h2 className="metric-value">{estadisticas.usuarios.activos}</h2>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: EXPEDIENTES */}
      <div className="dashboard-section">
        <h2 className="section-title">📈 Expedientes</h2>

        <div className="grid-2col">
          {/* Gráfico: Expedientes por tipo (Pie) */}
          <div className="chart-card">
            <h3>Expedientes por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadisticas.expedientes.porTipo}
                  dataKey="cantidad"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {estadisticas.expedientes.porTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico: Expedientes últimos 30 días (Area) */}
          <div className="chart-card">
            <h3>Expedientes (Últimos 30 días)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={estadisticas.expedientes.por30Dias}>
                <defs>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a90b8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4a90b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fontSize: 12 }}
                  interval={Math.floor(estadisticas.expedientes.por30Dias.length / 6)}
                />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="expedientes"
                  stroke="#4a90b8"
                  fillOpacity={1}
                  fill="url(#colorExp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico: Top 10 Niños con más expedientes (Bar) */}
        <div className="chart-card full-width">
          <h3>Top 10 Niños con Más Expedientes</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={estadisticas.expedientes.porNino}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nino" 
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expedientes" fill="#4a90b8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECCIÓN 2: NIÑOS */}
      <div className="dashboard-section">
        <h2 className="section-title">👶 Análisis de Niños</h2>

        <div className="grid-3col">
          {/* Tarjetas de datos */}
          <div className="data-card">
            <p className="data-label">Promedio de Edad</p>
            <h3 className="data-value">{estadisticas.ninos.promedioEdad} años</h3>
          </div>

          <div className="data-card">
            <p className="data-label">Con Medidas de Protección</p>
            <h3 className="data-value">{estadisticas.ninos.conMedidaProteccion}</h3>
          </div>

          <div className="data-card">
            <p className="data-label">Expedientes Promedio</p>
            <h3 className="data-value">{estadisticas.ninos.expedientesPromedio}</h3>
          </div>
        </div>

        <div className="grid-2col">
          {/* CUD (Pie) */}
          <div className="chart-card">
            <h3>Niños con/sin CUD</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Con CUD', value: estadisticas.ninos.conCUD },
                    { name: 'Sin CUD', value: estadisticas.ninos.sinCUD }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#1b7a3a" />
                  <Cell fill="#d97706" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Niños por dispositivo (Bar) */}
          <div className="chart-card">
            <h3>Niños por Dispositivo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.ninos.porDispositivo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dispositivo"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="niños" fill="#1a3a52" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: USUARIOS Y ACTIVIDAD */}
      <div className="dashboard-section">
        <h2 className="section-title">👥 Usuarios y Actividad</h2>

        {/* Usuario más activo */}
        {estadisticas.usuarios.masActivo && (
          <div className="activity-card">
            <div className="activity-icon">🏆</div>
            <div className="activity-content">
              <p className="activity-label">Usuario Más Activo</p>
              <h3>{estadisticas.usuarios.masActivo.nombre}</h3>
              <p className="activity-detail">
                {estadisticas.usuarios.masActivo.expedientes} expedientes subidos
              </p>
            </div>
          </div>
        )}

        <div className="grid-2col">
          {/* Actividad por hora (Line) */}
          <div className="chart-card">
            <h3>Actividad (Últimas 24 horas)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={estadisticas.usuarios.actividadPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hora"
                  tick={{ fontSize: 12 }}
                  interval={3}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actividad"
                  stroke="#0066cc"
                  strokeWidth={2}
                  dot={{ fill: '#0066cc', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Últimos expedientes */}
          <div className="chart-card">
            <h3>Últimos Expedientes Subidos</h3>
            <div className="recent-list">
              {estadisticas.usuarios.ultimosExpedientes.map((exp, idx) => (
                <div key={idx} className="recent-item">
                  <div className="recent-info">
                    <p className="recent-title">{exp.nombreArchivo}</p>
                    <small className="recent-meta">
                      {exp.nino} • {exp.tipo}
                    </small>
                  </div>
                  <small className="recent-date">
                    {new Date(exp.fecha).toLocaleDateString('es-ES')}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
