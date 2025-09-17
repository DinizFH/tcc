import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import {
  FaCalendarAlt,
  FaDumbbell,
  FaUserCheck,
  FaChartLine,
  FaRunning,
  FaClipboardList,
} from "react-icons/fa";

export default function DashboardPersonal() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    async function fetchDados() {
      try {
        const perfil = await api.get("/usuarios/perfil");
        setNome(perfil.data.nome);

        const res = await api.get("/dashboard");
        const ags = res.data.proximos_atendimentos || [];

        const agsFiltrados = ags
          .filter((a) => a.data_hora_inicio)
          .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));

        setAgendamentos(agsFiltrados);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }
    fetchDados();
  }, []);

  function formatarDataHora(dataStr) {
    const dt = new Date(dataStr);
    return dt.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const cards = [
    {
      title: "Agendamentos",
      icon: <FaCalendarAlt className="text-4xl text-blue-600" />,
      action: () => navigate("/agendamentos"),
      resumo: agendamentos.length > 0 ? (
        <>
          <p className="text-sm text-gray-600 mt-2">
            {agendamentos.length} ativo(s)
          </p>
          <p className="text-xs text-gray-500">
            {formatarDataHora(agendamentos[0].data_hora_inicio)} - {agendamentos[0].tipo_agendamento}
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500 mt-2">Sem agendamentos futuros</p>
      ),
    },
    {
      title: "Treinos",
      icon: <FaDumbbell className="text-4xl text-orange-600" />,
      action: () => navigate("/treinos"),
    },
    {
      title: "Avaliações",
      icon: <FaUserCheck className="text-4xl text-purple-600" />,
      action: () => navigate("/avaliacoes"),
    },
    {
      title: "Progresso",
      icon: <FaChartLine className="text-4xl text-green-600" />,
      action: () => navigate("/progresso"),
    },
    {
      title: "Exercícios",
      icon: <FaRunning className="text-4xl text-red-500" />,
      action: () => navigate("/exercicios"),
    },
    {
      title: "Registro de Treino",
      icon: <FaClipboardList className="text-4xl text-cyan-600" />,
      action: () => navigate("/registrostreino"),
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bem-vindo, {nome}!</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={card.action}
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition"
            >
              {card.icon}
              <h2 className="mt-4 text-xl font-semibold text-center">{card.title}</h2>
              {card.resumo}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
