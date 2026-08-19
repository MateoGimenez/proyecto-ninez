import { useState, useEffect, useMemo } from 'react';
import {
  obtenerNinos,
  obtenerExpedientesPorNino,
  subirExpediente,
  obtenerLinkDescarga,
  eliminarExpediente,
  obtenerTiposExpediente,
} from '../services/expedientesService';
import PreviewExpediente from '../components/PreviewExpediente';
import '../styles/ExpedientesPage.css';

const ExpedientesPage = () => {
  // Estado principal
  const [niños, setNiños] = useState([]);
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const [expedientes, setExpedientes] = useState([]);
  const [tiposExpediente, setTiposExpediente] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Estado de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Estado para upload
  const [mostrarFormUpload, setMostrarFormUpload] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [tipoExpediente, setTipoExpediente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  // Estado para preview
  const [expedientePreview, setExpedientePreview] = useState(null);

  // Cargar niños y tipos de expediente al montar
  useEffect(() => {
    cargarNinos();
    cargarTiposExpediente();
  }, []);

  // Cargar expedientes cuando se selecciona un niño
  useEffect(() => {
    if (ninoSeleccionado) {
      cargarExpedientes(ninoSeleccionado.id);
    }
  }, [ninoSeleccionado]);

  // Filtrar niños por búsqueda
  const ninosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return niños;
    
    const termino = busqueda.toLowerCase();
    return niños.filter(n => 
      `${n.nombre} ${n.apellido}`.toLowerCase().includes(termino)
    );
  }, [niños, busqueda]);

  /**
   * Cargar lista de niños
   */
  const cargarNinos = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerNinos();
      setNiños(datos);
    } catch (err) {
      setError('Error al cargar niños');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Cargar tipos de expediente
   */
  const cargarTiposExpediente = async () => {
    try {
      const datos = await obtenerTiposExpediente();
      setTiposExpediente(datos);
      // Establecer el primer tipo como default
      if (datos.length > 0) {
        setTipoExpediente(datos[0].id.toString());
      }
    } catch (err) {
      console.error('Error cargando tipos:', err);
      // No mostrar error al usuario
    }
  };

  /**
   * Cargar expedientes de un niño
   */
  const cargarExpedientes = async (ninoId) => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerExpedientesPorNino(ninoId);
      setExpedientes(datos.expedientes || []);
    } catch (err) {
      setError('Error al cargar expedientes');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Manejar selección de archivo
   */
  const handleArchivoChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!tiposPermitidos.includes(archivo.type)) {
        setError('Solo se permiten PDF e imágenes (JPEG, PNG)');
        return;
      }
      if (archivo.size > 50 * 1024 * 1024) {
        setError('El archivo no puede superar 50 MB');
        return;
      }
      setArchivoSeleccionado(archivo);
      setError(null);
    }
  };

  /**
   * Subir expediente
   */
  const handleSubirExpediente = async (e) => {
    e.preventDefault();

    if (!archivoSeleccionado) {
      setError('Selecciona un archivo');
      return;
    }

    if (!ninoSeleccionado) {
      setError('Selecciona un niño');
      return;
    }

    if (!tipoExpediente) {
      setError('Selecciona un tipo de expediente');
      return;
    }

    try {
      setSubiendo(true);
      setError(null);

      await subirExpediente(
        archivoSeleccionado,
        ninoSeleccionado.id,
        tipoExpediente,
        descripcion
      );

      setExito(`✅ Expediente "${archivoSeleccionado.name}" subido correctamente`);
      
      setArchivoSeleccionado(null);
      setDescripcion('');
      setMostrarFormUpload(false);

      await cargarExpedientes(ninoSeleccionado.id);

      setTimeout(() => setExito(null), 3000);
    } catch (err) {
      setError('Error al subir el expediente');
      console.error(err);
    } finally {
      setSubiendo(false);
    }
  };

  /**
   * Abrir vista previa
   */
  const handleVerPreview = async (expedienteId, nombreArchivo) => {
    try {
      setError(null);
      const url = await obtenerLinkDescarga(ninoSeleccionado.id, expedienteId);
      
      // Buscar el expediente para obtener todos los datos
      const exp = expedientes.find(e => e.id === expedienteId);
      
      setExpedientePreview({
        ...exp,
        urlPreview: url,
      });
    } catch (err) {
      setError('Error al cargar la vista previa');
      console.error(err);
    }
  };

  /**
   * Descargar expediente
   */
  const handleDescargar = async () => {
    if (!expedientePreview) return;

    try {
      const url = expedientePreview.urlPreview;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = expedientePreview.nombreOriginal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExito(`✅ Descargando: ${expedientePreview.nombreOriginal}`);
      setTimeout(() => setExito(null), 2000);
    } catch (err) {
      setError('Error al descargar el expediente');
      console.error(err);
    }
  };

  /**
   * Eliminar expediente
   */
  const handleEliminar = async (expedienteId, nombreArchivo) => {
    if (!confirm(`¿Eliminar "${nombreArchivo}"?`)) {
      return;
    }

    try {
      setError(null);
      await eliminarExpediente(ninoSeleccionado.id, expedienteId);
      
      setExito(`✅ Expediente eliminado correctamente`);
      
      await cargarExpedientes(ninoSeleccionado.id);
      
      setTimeout(() => setExito(null), 2000);
    } catch (err) {
      setError('Error al eliminar el expediente');
      console.error(err);
    }
  };

  return (
    <div className="expedientes-container">
      {/* Header */}
      <div className="expedientes-header">
        <div className="header-content">
          <h1>📋 Gestión de Expedientes</h1>
          <p>Administra y visualiza los expedientes de los niños</p>
        </div>
      </div>

      {/* Alertas */}
      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="expedientes-layout">
        {/* PANEL IZQUIERDO - Niños */}
        <div className="ninos-sidebar">
          <div className="sidebar-sticky">
            <div className="sidebar-header">
              <h2>Niños</h2>
              <span className="badge">{niños.length}</span>
            </div>

            {/* Buscador */}
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Buscar niño..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {busqueda && (
                <button 
                  className="search-clear"
                  onClick={() => setBusqueda('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Lista de niños */}
            <div className="ninos-grid">
              {cargando && !ninoSeleccionado ? (
                <p className="text-center">Cargando...</p>
              ) : ninosFiltrados.length === 0 ? (
                <p className="text-muted">
                  {busqueda ? 'No se encontraron niños' : 'No hay niños registrados'}
                </p>
              ) : (
                ninosFiltrados.map((nino) => (
                  <div
                    key={nino.id}
                    className={`nino-card ${
                      ninoSeleccionado?.id === nino.id ? 'active' : ''
                    }`}
                    onClick={() => setNinoSeleccionado(nino)}
                  >
                    <div className="nino-avatar">
                      {nino.nombre.charAt(0)}
                    </div>
                    <div className="nino-info">
                      <h3>{nino.nombre} {nino.apellido}</h3>
                      <small>ID: {nino.id}</small>
                    </div>
                    {ninoSeleccionado?.id === nino.id && (
                      <div className="nino-check">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO - Expedientes */}
        <div className="expedientes-main">
          {!ninoSeleccionado ? (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h2>Selecciona un niño</h2>
              <p>Elige un niño de la lista para ver sus expedientes</p>
            </div>
          ) : (
            <>
              {/* Encabezado con opciones */}
              <div className="main-header">
                <div>
                  <h2>{ninoSeleccionado.nombre} {ninoSeleccionado.apellido}</h2>
                  <p className="subtitle">
                    {expedientes.length} expediente{expedientes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => setMostrarFormUpload(!mostrarFormUpload)}
                >
                  {mostrarFormUpload ? '✕ Cancelar' : '⬆️ Subir Expediente'}
                </button>
              </div>

              {/* Formulario de upload */}
              {mostrarFormUpload && (
                <div className="upload-form-container">
                  <form className="upload-form" onSubmit={handleSubirExpediente}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Selecciona un archivo *</label>
                        <div className="file-input-wrapper">
                          <input
                            type="file"
                            onChange={handleArchivoChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={subiendo}
                            id="file-input"
                          />
                          <label htmlFor="file-input" className="file-label">
                            {archivoSeleccionado ? (
                              <>
                                <span>📄 {archivoSeleccionado.name}</span>
                                <small>
                                  {(archivoSeleccionado.size / 1024).toFixed(2)} KB
                                </small>
                              </>
                            ) : (
                              <>
                                <span>📁 Haz clic para seleccionar o arrastra un archivo</span>
                                <small>PDF, JPEG o PNG (máx 50 MB)</small>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Tipo de Expediente *</label>
                        <select
                          value={tipoExpediente}
                          onChange={(e) => setTipoExpediente(e.target.value)}
                          disabled={subiendo || tiposExpediente.length === 0}
                          className="form-select"
                        >
                          <option value="">-- Selecciona un tipo --</option>
                          {tiposExpediente.map((tipo) => (
                            <option key={tipo.id} value={tipo.id}>
                              {tipo.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Descripción (opcional)</label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Añade una descripción de este documento..."
                        disabled={subiendo}
                        className="form-textarea"
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-full"
                      disabled={!archivoSeleccionado || !tipoExpediente || subiendo}
                    >
                      {subiendo ? '⏳ Subiendo...' : '✅ Subir Expediente'}
                    </button>
                  </form>
                </div>
              )}

              {/* Lista de expedientes */}
              {cargando ? (
                <div className="loading-center">
                  <div className="spinner"></div>
                </div>
              ) : expedientes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <h3>Sin expedientes</h3>
                  <p>No hay expedientes aún. Sube el primero!</p>
                </div>
              ) : (
                <div className="expedientes-grid">
                  {expedientes.map((exp) => (
                    <div key={exp.id} className="expediente-card">
                      <div className="card-header">
                        <div className="card-tipo">{exp.tipo}</div>
                        <div className="card-tamaño">{exp.tamanoBytesFormato}</div>
                      </div>

                      <div className="card-body">
                        <h3 className="card-titulo">{exp.nombreOriginal}</h3>
                        {exp.descripcion && (
                          <p className="card-descripcion">{exp.descripcion}</p>
                        )}
                      </div>

                      <div className="card-footer">
                        <small className="card-meta">
                          📤 {exp.subidoPor}
                          <br />
                          {new Date(exp.fechaSubida).toLocaleDateString('es-ES')}
                        </small>
                        <div className="card-acciones">
                          <button
                            className="btn btn-small btn-info"
                            onClick={() => handleVerPreview(exp.id, exp.nombreOriginal)}
                            title="Ver vista previa"
                          >
                            👁️
                          </button>
                          <button
                            className="btn btn-small btn-danger"
                            onClick={() => handleEliminar(exp.id, exp.nombreOriginal)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Preview */}
      {expedientePreview && (
        <PreviewExpediente
          expediente={expedientePreview}
          onClose={() => setExpedientePreview(null)}
          onDescargar={handleDescargar}
        />
      )}
    </div>
  );
};

export default ExpedientesPage;
