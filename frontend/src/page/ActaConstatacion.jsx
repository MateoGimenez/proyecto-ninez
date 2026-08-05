import React, { useState, useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';
import html2pdf from 'html2pdf.js';
import { saveAs } from 'file-saver';
import "../styles/actaConstatacion.css"
const ActaConstatacion = () => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    dia: '5',
    mes: 'julio',
    anio: '2026',
    cargo: 'Coordinadora',
    descripcion: 'Se constató la entrega de indumentaria escolar al grupo familiar conviviente en el domicilio declarado, en presencia de la Sra. referente familiar.'
  });

  // Estados para las imágenes de las firmas guardadas
  const [firma1Url, setFirma1Url] = useState('');
  const [firma2Url, setFirma2Url] = useState('');

  // Referencias a los elementos Canvas y la Vista Previa
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const pad1Ref = useRef(null);
  const pad2Ref = useRef(null);
  const actaRef = useRef(null);

  // Inicializar pads de firmas al montar el componente
  useEffect(() => {
    const initPad = (canvasEl) => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvasEl.width = canvasEl.offsetWidth * ratio;
      canvasEl.height = canvasEl.offsetHeight * ratio;
      canvasEl.getContext('2d').scale(ratio, ratio);
      return new SignaturePad(canvasEl, {
        penColor: '#1a1a1a',
        backgroundColor: 'rgba(255,255,255,0)'
      });
    };

    if (canvas1Ref.current) pad1Ref.current = initPad(canvas1Ref.current);
    if (canvas2Ref.current) pad2Ref.current = initPad(canvas2Ref.current);
  }, []);

  // Manejo de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Borrar firma
  const handleClearPad = (padRef, setFirmaUrl) => {
    if (padRef.current) {
      padRef.current.clear();
      setFirmaUrl('');
    }
  };

  // Convertir canvas a imagen si no están vacíos
  const volcarFirmas = () => {
    if (pad1Ref.current && !pad1Ref.current.isEmpty()) {
      setFirma1Url(pad1Ref.current.toDataURL('image/png'));
    }
    if (pad2Ref.current && !pad2Ref.current.isEmpty()) {
      setFirma2Url(pad2Ref.current.toDataURL('image/png'));
    }
  };

  // Exportar PDF
  const exportarPDF = () => {
    volcarFirmas();
    const elemento = actaRef.current;
    const opciones = {
      margin: 0,
      filename: 'acta-de-constatacion.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opciones).from(elemento).save();
  };

  return (
    <div className="acta-container">
      <h1 className="acta-title">Acta de Constatación — demo de generación de documentos</h1>
      <p className="subtitle">
        Formulario a la izquierda → vista previa fiel al modelo a la derecha → exportar PDF ya firmado.
      </p>

      <div className="layout">
        {/* ============ FORMULARIO ============ */}
        <div className="panel">
          <h2>Datos del acta</h2>

          <label htmlFor="dia">Fecha del acto</label>
          <div className="row3">
            <input
              type="number"
              id="dia"
              name="dia"
              placeholder="Día"
              min="1"
              max="31"
              value={formData.dia}
              onChange={handleChange}
              className="input-field"
            />
            <select
              id="mes"
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              className="input-field"
            >
              <option value="enero">enero</option>
              <option value="febrero">febrero</option>
              <option value="marzo">marzo</option>
              <option value="abril">abril</option>
              <option value="mayo">mayo</option>
              <option value="junio">junio</option>
              <option value="julio">julio</option>
              <option value="agosto">agosto</option>
              <option value="septiembre">septiembre</option>
              <option value="octubre">octubre</option>
              <option value="noviembre">noviembre</option>
              <option value="diciembre">diciembre</option>
            </select>
            <input
              type="number"
              id="anio"
              name="anio"
              value={formData.anio}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <label htmlFor="cargo">Carácter del funcionario que suscribe</label>
          <input
            type="text"
            id="cargo"
            name="cargo"
            placeholder="Ej: Coordinador/a"
            value={formData.cargo}
            onChange={handleChange}
            className="input-field"
          />

          <label htmlFor="descripcion">Descripción del acto</label>
          <textarea
            id="descripcion"
            name="descripcion"
            placeholder="Detalle lo constatado..."
            value={formData.descripcion}
            onChange={handleChange}
            className="input-field"
          />

          <div className="sig-block">
            <label style={{ marginTop: '20px' }}>Firma del interesado/a</label>
            <canvas ref={canvas1Ref}></canvas>
            <div className="sig-actions">
              <button onClick={() => handleClearPad(pad1Ref, setFirma1Url)}>
                Borrar firma
              </button>
            </div>
          </div>

          <div className="sig-block">
            <label>Firma del profesional interviniente</label>
            <canvas ref={canvas2Ref}></canvas>
            <div className="sig-actions">
              <button onClick={() => handleClearPad(pad2Ref, setFirma2Url)}>
                Borrar firma
              </button>
            </div>
          </div>

          <div className="export-actions">
            <button id="btn-pdf" onClick={exportarPDF}>Descargar PDF</button>
          </div>
        </div>

        {/* ============ VISTA PREVIA / DOCUMENTO A EXPORTAR ============ */}
        <div className="panel panel-transparent">
          <div id="acta" ref={actaRef}>
            <div className="membrete">
              <div className="logo"><img src="/src/public/gobiernoRioja.jpg" alt="Logo Institucional" /><br />INSTITUCIONAL</div>
              <div className="texto">
                <strong>Dirección General de Gestión y Promoción de la Familia</strong>
                Subsecretaría de Niñez, Adolescencia y Familia
              </div>
            </div>

            <div className="titulo">ACTA DE CONSTATACIÓN</div>

            <div className="cuerpo">
              En la ciudad de La Rioja, a los <span className="blank">{formData.dia || '…'}</span> días
              del mes de <span className="blank">{formData.mes || '…'}</span> del año{' '}
              <span className="blank">{formData.anio || '…'}</span>, quien suscribe en carácter de{' '}
              <span className="blank">{formData.cargo || '…'}</span> de la Dirección General de Gestión
              y Promoción de la Familia, dependiente de la Subsecretaría de Niñez,
              Adolescencia y Familia, deja constancia del siguiente acto:

              <div className="descripcion">{formData.descripcion}</div>
            </div>

            <div className="firmas">
              <div className="firma-col">
                {firma1Url && <img src={firma1Url} alt="Firma del interesado" />}
                <div className="linea">FIRMA DEL INTERESADO/A</div>
              </div>
              <div className="firma-col">
                {firma2Url && <img src={firma2Url} alt="Firma del profesional interviniente" />}
                <div className="linea">FIRMA DEL PROF. INTERVINIENTE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActaConstatacion;