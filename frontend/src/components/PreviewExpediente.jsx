import { useState, useEffect } from 'react';
import '../styles/PreviewExpediente.css';

const PreviewExpediente = ({ expediente, onClose, onDescargar }) => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simular carga de la vista previa
    const timer = setTimeout(() => {
      setCargando(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const esPDF = expediente.mimeType === 'application/pdf';
  const esImagen = expediente.mimeType?.startsWith('image/');

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="preview-header">
          <div>
            <h2>{expediente.nombreOriginal}</h2>
            <p className="preview-tipo">{expediente.tipo}</p>
          </div>
          <button className="preview-close" onClick={onClose}>✕</button>
        </div>

        {/* Contenido */}
        <div className="preview-content">
          {cargando ? (
            <div className="preview-loading">
              <div className="spinner"></div>
              <p>Cargando vista previa...</p>
            </div>
          ) : error ? (
            <div className="preview-error">
              <p>⚠️ {error}</p>
            </div>
          ) : esPDF ? (
            <iframe
              src={expediente.urlPreview}
              className="preview-iframe"
              title="PDF Preview"
              onError={() => setError('No se pudo cargar el PDF')}
            />
          ) : esImagen ? (
            <img 
              src={expediente.urlPreview} 
              alt="Preview" 
              className="preview-image"
              onError={() => setError('No se pudo cargar la imagen')}
            />
          ) : (
            <div className="preview-error">
              <p>⚠️ Tipo de archivo no soportado para vista previa</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="preview-footer">
          <div className="preview-info">
            <small>
              📤 {expediente.subidoPor} • {new Date(expediente.fechaSubida).toLocaleDateString('es-ES')}
            </small>
          </div>
          <div className="preview-acciones">
            <button className="btn btn-outline" onClick={onClose}>
              ✕ Cerrar
            </button>
            <button className="btn btn-primary" onClick={() => {
              onDescargar();
              onClose();
            }}>
              ⬇️ Descargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewExpediente;
