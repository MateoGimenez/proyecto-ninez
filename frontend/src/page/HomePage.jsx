import "../styles/homePage.css"
import { useAuth } from "../context/AuthContext.jsx"

const quickLinks = [
  {
    title: 'Actas',
    description: 'Consultá y gestioná las actas registradas.',
    href: '/actas',
    icon: '📄',
  },
  {
    title: 'Dispositivos',
    description: 'Administrá los dispositivos del sistema.',
    href: '/dispositivos',
    icon: '📱',
  },
  {
    title: 'Expedientes',
    description: 'Consultá y gestioná los expedientes activos.',
    href: '/expedientes',
    icon: '🗂️',
  },
]

export const HomePage = () => {
  const { user } = useAuth()

  console.log('user del useAuth:', user)

  const nombre = user?.usuario?.nombre ?? ''


  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-container">
          <h1 className="home-title">
            {nombre ? `Bienvenido, ${nombre} a la página de inicio` : 'Bienvenido a la página de inicio'}
          </h1>
          <p className="home-subtitle">
            Desde acá podés acceder a la gestión del sistema.
          </p>
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