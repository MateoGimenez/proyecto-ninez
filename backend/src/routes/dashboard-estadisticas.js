import { Router } from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';

const router = Router();

/**
 * Middleware para verificar que es admin
 */
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  }
  next();
};

/**
 * GET /api/dashboard/estadisticas
 * Obtiene todas las estadísticas para el dashboard
 */
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // 1. EXPEDIENTES
    const { data: expedientes, error: errorExp } = await supabase
      .from('expedientes')
      .select('*, tipos_expediente(nombre), ninos(nombre, apellido)');

    if (errorExp) throw errorExp;

    // 2. NIÑOS
    const { data: ninos, error: errorNinos } = await supabase
      .from('ninos')
      .select('*, dispositivos(nombre)');

    if (errorNinos) throw errorNinos;

    // 3. DISPOSITIVOS
    const { data: dispositivos, error: errorDis } = await supabase
      .from('dispositivos')
      .select('*');

    if (errorDis) throw errorDis;

    // 4. USUARIOS
    const { data: usuarios, error: errorUsu } = await supabase
      .from('usuarios')
      .select('*, rol(nombre)')
      .eq('active', true);

    if (errorUsu) throw errorUsu;

    // ===== PROCESAMIENTO DE DATOS =====

    // EXPEDIENTES - Estadísticas
    const totalExpedientes = expedientes.length;
    
    // Expedientes por tipo
    const expedientesPorTipo = {};
    expedientes.forEach(exp => {
      const tipo = exp.tipos_expediente?.nombre || 'Sin tipo';
      expedientesPorTipo[tipo] = (expedientesPorTipo[tipo] || 0) + 1;
    });

    // Expedientes últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const expedientesPor30Dias = {};
    for (let i = 0; i < 30; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      expedientesPor30Dias[fechaStr] = 0;
    }

    expedientes.forEach(exp => {
      const fechaExp = exp.created.split('T')[0];
      if (expedientesPor30Dias.hasOwnProperty(fechaExp)) {
        expedientesPor30Dias[fechaExp]++;
      }
    });

    const expedientesPor30DiasArray = Object.entries(expedientesPor30Dias)
      .reverse()
      .map(([fecha, count]) => ({ fecha, expedientes: count }));

    // Expedientes por niño
    const expedientesPorNino = {};
    expedientes.forEach(exp => {
      const ninoNombre = `${exp.ninos?.nombre} ${exp.ninos?.apellido}`;
      expedientesPorNino[ninoNombre] = (expedientesPorNino[ninoNombre] || 0) + 1;
    });

    const expedientesPorNinoArray = Object.entries(expedientesPorNino)
      .map(([nino, count]) => ({ nino, expedientes: count }))
      .sort((a, b) => b.expedientes - a.expedientes)
      .slice(0, 10); // Top 10

    // NIÑOS - Estadísticas
    const totalNinos = ninos.length;

    // Niños por dispositivo
    const ninosPorDispositivo = {};
    ninos.forEach(nino => {
      const dispositivo = nino.dispositivos?.nombre || 'Sin dispositivo';
      ninosPorDispositivo[dispositivo] = (ninosPorDispositivo[dispositivo] || 0) + 1;
    });

    const ninosPorDispositivoArray = Object.entries(ninosPorDispositivo)
      .map(([dispositivo, count]) => ({ dispositivo, niños: count }));

    // Niños con/sin CUD
    const ninosConCUD = ninos.filter(n => n.cud === true).length;
    const ninosSinCUD = ninos.filter(n => n.cud !== true).length;

    // Promedio de edad
    const edades = ninos
      .filter(n => n.nacimiento)
      .map(n => {
        const hoy = new Date();
        const nacimiento = new Date(n.nacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0) edad--;
        return edad;
      });

    const promedioEdad = edades.length > 0 
      ? (edades.reduce((a, b) => a + b, 0) / edades.length).toFixed(1)
      : 0;

    // Niños con medidas de protección
    const ninosConMedida = ninos.filter(n => n.medida && n.medida.trim() !== '').length;

    // Expedientes promedio por niño
    const expedientesPorNinoPromedio = totalNinos > 0 
      ? (totalExpedientes / totalNinos).toFixed(2)
      : 0;

    // DISPOSITIVOS
    const totalDispositivos = dispositivos.filter(d => d.activo !== false).length;
    const promedioNinosPorDispositivo = totalDispositivos > 0
      ? (totalNinos / totalDispositivos).toFixed(2)
      : 0;

    // USUARIOS
    const usuariosActivos = usuarios.length;
    
    // Usuario más activo (más expedientes subidos)
    const expedientesPorusuario = {};
    expedientes.forEach(exp => {
      const usuarioId = exp.usuario_id;
      expedientesPorusuario[usuarioId] = (expedientesPorusuario[usuarioId] || 0) + 1;
    });

    let usuarioMasActivo = null;
    let maxExpedientes = 0;
    Object.entries(expedientesPorusuario).forEach(([usuarioId, count]) => {
      if (count > maxExpedientes) {
        maxExpedientes = count;
        const usuario = usuarios.find(u => u.id === parseInt(usuarioId));
        if (usuario) {
          usuarioMasActivo = {
            nombre: `${usuario.nombre} ${usuario.apellido}`,
            expedientes: count
          };
        }
      }
    });

    // Últimos expedientes subidos
    const ultimosExpedientes = expedientes
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 5)
      .map(exp => ({
        id: exp.id,
        nombreArchivo: exp.nombre_original,
        nino: `${exp.ninos?.nombre} ${exp.ninos?.apellido}`,
        fecha: exp.created,
        tipo: exp.tipos_expediente?.nombre
      }));

    // Actividad por hora (últimas 24 horas)
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);

    const actividadPorHora = {};
    for (let i = 0; i < 24; i++) {
      const hora = i.toString().padStart(2, '0') + ':00';
      actividadPorHora[hora] = 0;
    }

    expedientes
      .filter(exp => new Date(exp.created) > hace24Horas)
      .forEach(exp => {
        const hora = new Date(exp.created).getHours().toString().padStart(2, '0') + ':00';
        actividadPorHora[hora]++;
      });

    const actividadPorHoraArray = Object.entries(actividadPorHora)
      .map(([hora, count]) => ({ hora, actividad: count }));

    // ===== RESPUESTA =====
    return res.status(200).json({
      mensaje: 'Estadísticas obtenidas correctamente',
      expedientes: {
        total: totalExpedientes,
        porTipo: Object.entries(expedientesPorTipo).map(([tipo, count]) => ({ tipo, cantidad: count })),
        por30Dias: expedientesPor30DiasArray,
        porNino: expedientesPorNinoArray
      },
      ninos: {
        total: totalNinos,
        porDispositivo: ninosPorDispositivoArray,
        conCUD: ninosConCUD,
        sinCUD: ninosSinCUD,
        promedioEdad: parseFloat(promedioEdad),
        conMedidaProteccion: ninosConMedida,
        expedientesPromedio: parseFloat(expedientesPorNinoPromedio)
      },
      dispositivos: {
        total: totalDispositivos,
        promedioNinos: parseFloat(promedioNinosPorDispositivo)
      },
      usuarios: {
        activos: usuariosActivos,
        masActivo: usuarioMasActivo,
        ultimosExpedientes: ultimosExpedientes,
        actividadPorHora: actividadPorHoraArray
      }
    });

  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;