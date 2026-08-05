import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import usuariosRouter from "./routes/usuarios.js";
import rolesRouter from "./routes/roles.js"
import authRoutes from "./routes/authRoutes.js";
import profesionalesRouter from './routes/profesiones.js'
import dispositivosRouter from "./routes/dispositivos.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin/usuarios", usuariosRouter);
app.use("/api/auth", authRoutes);
app.use("/api/admin/roles", rolesRouter); 
app.use("/api/admin/profesiones", profesionalesRouter); 
app.use("/api/admin/dispositivos" , dispositivosRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});