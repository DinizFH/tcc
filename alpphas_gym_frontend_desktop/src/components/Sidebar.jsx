import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser } from "react-icons/fi";
import logo from "../assets/alpphas_logo.png";

const API_URL = import.meta.env.VITE_API_URL;

export default function Sidebar() {
  const navigate = useNavigate();

  const nome = localStorage.getItem("perfil_nome");
  const tipo = localStorage.getItem("perfil_tipo");
  const foto = localStorage.getItem("perfil_foto");
  const perfilCompleto = !!nome;

  const handleLogout = () => {
    ["token", "perfil_nome", "perfil_tipo", "perfil_foto", "perfil_email"].forEach((chave) =>
      localStorage.removeItem(chave)
    );
    navigate("/login");
  };

  const getLinks = () => {
    if (!tipo) return [];

    const base = [{ to: tipo === "admin" ? "/admin" : `/dashboard/${tipo}`, label: "Dashboard" }];

    if (tipo === "admin") {
      return [
        ...base,
        { to: "/admin/usuarios", label: "Usuários" },
        { to: "/admin/estatisticas", label: "Estatísticas" },
        { to: "/admin/backups", label: "Back-ups" },
        { to: "/admin/logs", label: "Logs de Envio" },
        { to: "/admin/config", label: "Configurações" },
      ];
    }

    if (tipo === "aluno") {
      return [
        ...base,
        { to: "/treinos", label: "Treinos" },
        { to: "/registrostreino", label: "Registros de Treino" },
        { to: "/planos", label: "Plano Alimentar" },
        { to: "/agendamentos-aluno", label: "Meus Agendamentos" },
        { to: "/progresso/aluno", label: "Progresso" },
      ];
    }

    if (tipo === "personal") {
      return [
        ...base,
        { to: "/avaliacoes", label: "Avaliações" },
        { to: "/agendamentos", label: "Agendamentos" },
        { to: "/treinos", label: "Treinos" },
        { to: "/exercicios", label: "Exercícios" },
        { to: "/registrostreino", label: "Registros de Treino" },
        { to: "/progresso", label: "Progresso" },
      ];
    }

    if (tipo === "nutricionista") {
      return [
        ...base,
        { to: "/avaliacoes", label: "Avaliações" },
        { to: "/agendamentos", label: "Agendamentos" },
        { to: "/planos", label: "Plano Alimentar" },
        { to: "/progresso", label: "Progresso" },
      ];
    }

    return base;
  };

  const links = getLinks();

  return (
    <div className="h-screen w-64 bg-white shadow-lg flex flex-col fixed no-print">
      {/* Área rolável para conteúdo */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 pt-6">
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-32 mb-8" />

        {/* Foto de Perfil */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={foto ? `${API_URL}/static/uploads/${foto}` : "/icons/avatar.png"}
            alt="Perfil"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <p className="mt-2 text-sm font-semibold text-center">
            {nome || "Usuário"}
          </p>

          {tipo !== "admin" && (
            <Link
              to="/completar-perfil"
              className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
              <FiUser /> Editar perfil
            </Link>
          )}
        </div>

        {/* Links */}
        {perfilCompleto && (
          <nav className="w-full flex flex-col gap-4 text-sm font-medium text-center">
            {links.map((link, index) => (
              <Link key={index} to={link.to} className="hover:text-blue-600">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Botão de Sair fixo */}
      <div className="px-4 py-4 border-t bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-all"
        >
          <FiLogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  );
}
