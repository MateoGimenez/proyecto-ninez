import { useEffect, useState } from "react"
import "../styles/homePage.css"
import { useAuth } from "../context/AuthContext.jsx"
import { getStats } from "../services/servicesStats.js"

const quickLinks = [
  {
    title: "Actas",
    description: "Consultá y gestioná las actas registradas.",
    href: "/actas",
    icon: "📄",
  },
  {
    title: "Dispositivos",
    description: "Administrá los dispositivos del sistema.",
    href: "/dispositivos",
    icon: "📱",
  },
  {
    title: "Expedientes",
    description: "Consultá y gestioná los expedientes activos.",
    href: "/expedientes",
    icon: "🗂️",
  },
]

// Config de las tarjetas de estadísticas: cómo leer cada valor del JSON
// que devuelve /api/admin/dashboard/stats y cómo mostrar su "split" visual.
const statCardsConfig = [
  {
    key: "usuarios",
    label: "Usuarios",
    icon: "👤",
    total: (d) => d.usuarios.total,
    parts: (d) => [
      { label: "Activos", value: d.usuarios.activos, tone: "positive" },
      { label: "Inactivos", value: d.usuarios.inactivos, tone: "muted" },
    ],
  },
  {
    key: "ninos",
    label: "Niños",
    icon: "🧒",
    total: (d) => d.ninos.total,
    parts: (d) => [
      { label: "En sistema", value: d.ninos.actualesEnSistema, tone: "positive" },
      { label: "Egresados", value: d.ninos.egresados, tone: "muted" },
    ],
    footnote: (d) => `${d.ninos.conCud} con CUD`,
  },
  {
    key: "dispositivos",
    label: "Dispositivos",
    icon: "📱",
    total: (d) => d.dispositivos.total,
    parts: (d) => [
      { label: "Activos", value: d.dispositivos.activos, tone: "positive" },
      {
        label: "Inactivos",
        value: d.dispositivos.total - d.dispositivos.activos,
        tone: "muted",
      },
    ],
  },
  {
    key: "actas",
    label: "Actas",
    icon: "📄",
    total: (d) => d.actas.total,
    parts: null,
  },
]

const StatCard = ({ config, data }) => {
  const total = config.total(data)
  const parts = config.parts ? config.parts(data) : null
  const footnote = config.footnote ? config.footnote(data) : null

  return (
    <article className="stat-card">
      <div className="stat-card-head">
        <span className="stat-card-icon" aria-hidden="true">
          {config.icon}
        </span>
        <span className="stat-card-label">{config.label}</span>
      </div>

      <p className="stat-card-total">{total.toLocaleString("es-AR")}</p>

      {parts && total > 0 && (
        <>
          <div className="stat-card-bar" role="img" aria-label={`${config.label}: ${parts.map(p => `${p.label} ${p.value}`).join(", ")}`}>
            {parts.map((part) => (
              <span
                key={part.label}
                className={`stat-card-bar-segment stat-card-bar-segment--${part.tone}`}
                style={{ width: `${(part.value / total) * 100}%` }}
              />
            ))}
          </div>
          <ul className="stat-card-legend">
            {parts.map((part) => (
              <li key={part.label} className={`stat-card-legend-item stat-card-legend-item--${part.tone}`}>
                <span className="stat-card-legend-dot" />
                {part.label}
                <strong>{part.value.toLocaleString("es-AR")}</strong>
              </li>
            ))}
          </ul>
        </>
      )}

      {footnote && <p className="stat-card-footnote">{footnote}</p>}
    </article>
  )
}

const StatCardSkeleton = () => (
  <article className="stat-card stat-card--loading" aria-hidden="true">
    <div className="stat-card-head">
      <span className="skeleton skeleton-icon" />
      <span className="skeleton skeleton-label" />
    </div>
    <span className="skeleton skeleton-total" />
    <span className="skeleton skeleton-bar" />
  </article>
)

export const HomePage = () => {
  const { user } = useAuth()
  const nombre = user?.usuario?.nombre ?? ""
  const token = user?.token

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getStats(token)
        setStats(data)
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al obtener estadísticas:", err)
          setError("No se pudieron cargar las estadísticas.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    return () => controller.abort()
  }, [])

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-container">
          <span className="home-eyebrow">Panel de gestión</span>
          <h1 className="home-title">
            {nombre ? `Bienvenido, ${nombre}` : "Bienvenido a la página de inicio"}
          </h1>
          <p className="home-subtitle">
            Desde acá podés seguir el estado del sistema y acceder a la gestión.
          </p>
        </div>
      </section>

      <section className="home-container home-stats-section">
        <h2 className="home-section-label">Resumen general</h2>

        {error && <p className="home-stats-error">{error}</p>}

        <div className="home-stats-grid">
          {loading
            ? statCardsConfig.map((c) => <StatCardSkeleton key={c.key} />)
            : stats &&
              statCardsConfig.map((config) => (
                <StatCard key={config.key} config={config} data={stats} />
              ))}
        </div>
      </section>

      <section className="home-container home-links-section">
        <h2 className="home-section-label">Accesos rápidos</h2>

        <div className="home-grid">
          {quickLinks.map(({ title, description, href, icon }) => (
            <a key={title} href={href} className="home-card">
              <div className="home-card-icon">{icon}</div>
              <h3 className="home-card-title">{title}</h3>
              <p className="home-card-description">{description}</p>
              <span className="home-card-cta">
                Ir a {title.toLowerCase()}
                <span className="home-card-arrow">→</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
