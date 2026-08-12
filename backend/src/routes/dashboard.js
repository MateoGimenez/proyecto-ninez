import { Router } from 'express';
import supabase from '../config/supabase.js';
import { verificarToken } from '../middleware/authVerifiacion.js';
import { verificarRol } from '../middleware/authRol.js';

const router = Router();

router.get('/', verificarToken ,  async (req, res) => {
  try {
    const [
      // --- USUARIOS ---
      { count: totalUsuarios },
      { count: usuariosActivos },
      
      // --- NIÑOS ---
      { count: totalNinos },
      { count: ninosEnDispositivo }, // Niños que no han egresado
      { count: ninosConCud },
      
      // --- DISPOSITIVOS Y ACTAS ---
      { count: totalDispositivos },
      { count: dispositivosActivos },
      { count: totalActas }
    ] = await Promise.all([
      // Usuarios
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('active', true),

      // Niños
      supabase.from('ninos').select('*', { count: 'exact', head: true }),
      supabase.from('ninos').select('*', { count: 'exact', head: true }).is('egreso', null),
      supabase.from('ninos').select('*', { count: 'exact', head: true }).eq('cud', true),

      // Dispositivos
      supabase.from('dispositivos').select('*', { count: 'exact', head: true }),
      supabase.from('dispositivos').select('*', { count: 'exact', head: true }).eq('activo', true),

      // Actas
      supabase.from('actas').select('*', { count: 'exact', head: true })
    ]);

    // Respuesta limpia para las tarjetas (KPIs) del frontend
    res.json({
      usuarios: {
        total: totalUsuarios || 0,
        activos: usuariosActivos || 0,
        inactivos: (totalUsuarios || 0) - (usuariosActivos || 0)
      },
      ninos: {
        total: totalNinos || 0,
        actualesEnSistema: ninosEnDispositivo || 0,
        egresados: (totalNinos || 0) - (ninosEnDispositivo || 0),
        conCud: ninosConCud || 0
      },
      dispositivos: {
        total: totalDispositivos || 0,
        activos: dispositivosActivos || 0
      },
      actas: {
        total: totalActas || 0
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
});

export default router;