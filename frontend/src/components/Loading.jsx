import React from 'react'
import "../styles/loading.css"
function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
}

export default Loading;
