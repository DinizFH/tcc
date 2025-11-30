import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/usuarios/perfil");

        setUsuario(res.data);
        setPerfilCompleto(res.data.perfil_completo);

        if (!res.data.perfil_completo) {
          navigate("/completar-perfil");
        } else {
          setCarregando(false);
        }
      } catch (err) {
        console.error("Erro ao verificar perfil:", err);
        navigate("/login");
      }
    };

    verificarPerfil();
  }, [navigate]);

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar user={usuario} />
      <main className="ml-64 w-full p-8">{children}</main>
    </div>
  );
}
