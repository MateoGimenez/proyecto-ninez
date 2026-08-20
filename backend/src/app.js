import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import usuariosRouter from "./routes/usuarios.js";
import rolesRouter from "./routes/roles.js"
import authRoutes from "./routes/authRoutes.js";
import profesionalesRouter from './routes/profesiones.js'
import dispositivosRouter from "./routes/dispositivos.js"
import dashboardRouter from "./routes/dashboard.js"
import ninosRouter from "./routes/ninos.js"
import expedientesRouter from "./routes/expedientes.js"
import tiposExpedienteRouter from "./routes/tiposExpedientes.js";
import dashboardEstadisticasRouter from "./routes/dashboard-estadisticas.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin/usuarios", usuariosRouter);
app.use("/api/auth", authRoutes);
app.use("/api/admin/roles", rolesRouter); 
app.use("/api/admin/profesiones", profesionalesRouter); 
app.use("/api/admin/dispositivos" , dispositivosRouter)
app.use("/api/dashboard/stats" , dashboardRouter)
app.use("/api/admin/ninos" , ninosRouter)
app.use("/api/expedientes", expedientesRouter);
app.use("/api/admin/tipos-expediente", tiposExpedienteRouter);
app.use("/api/dashboard/estadisticas", dashboardEstadisticasRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});