import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import usuariosRouter from "./routes/usuarios.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/usuarios", usuariosRouter);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});