import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import ModalCancelarAgendamento from "../../components/ModalCancelarAgendamento";
import ModalConcluirAgendamento from "../../components/ModalConcluirAgendamento";

export default function AgendamentosScreen() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);
  const [mostrarModalConcluir, setMostrarModalConcluir] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDados() {
      try {
        const perfilRes = await api.get("/usuarios/perfil");
        setTipoUsuario(perfilRes.data.tipo_usuario);

        const agendamentosRes = await api.get("/agendamentos/");
        setAgendamentos(agendamentosRes.data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    }

    fetchDados();
  }, []);

  // === CANCELAR ===
  const abrirModalCancelar = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setMostrarModalCancelar(true);
  };

  const confirmarCancelamento = async () => {
    try {
      await api.delete(`/agendamentos/${agendamentoSelecionado.id_agendamento}`);
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id_agendamento === agendamentoSelecionado.id_agendamento
            ? { ...a, status: "cancelado" }
            : a
        )
      );
      setMostrarModalCancelar(false);
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      alert("Erro ao cancelar agendamento.");
    }
  };

  // === CONCLUIR ===
  const abrirModalConcluir = (agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setMostrarModalConcluir(true);
  };

  const confirmarConclusao = async () => {
    try {
      await api.put(`/agendamentos/${agendamentoSelecionado.id_agendamento}`, {
        status: "concluído",
      });
      setAgendamentos((prev) =>
        prev.map((a) =>
          a.id_agendamento === agendamentoSelecionado.id_agendamento
            ? { ...a, status: "concluído" }
            : a
        )
      );
      setMostrarModalConcluir(false);
    } catch (err) {
      console.error("Erro ao concluir:", err);
      alert("Erro ao concluir agendamento.");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Meus Agendamentos</h1>
          {(tipoUsuario === "personal" || tipoUsuario === "nutricionista") && (
            <button
              onClick={() => navigate("/agendamentos/novo")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Novo Agendamento
            </button>
          )}
        </div>

        {agendamentos.length === 0 ? (
          <p className="text-gray-600">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="grid gap-4">
            {agendamentos.map((agendamento) => {
              const status = agendamento.status || "indefinido";
              const statusClass =
                status === "cancelado"
                  ? "text-red-600"
                  : status === "concluído"
                  ? "text-blue-600"
                  : "text-green-600";

              return (
                <div
                  key={agendamento.id_agendamento}
                  className="bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {tipoUsuario === "aluno"
                        ? `Profissional: ${
                            agendamento.nome_profissional || "Indefinido"
                          }`
                        : `Aluno: ${agendamento.nome_aluno || "Indefinido"}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo: {agendamento.tipo_agendamento || "Não especificado"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(agendamento.data_hora_inicio).toLocaleString()} até{" "}
                      {new Date(agendamento.data_hora_fim).toLocaleTimeString()}
                    </p>
                    <p className={`text-sm mt-1 ${statusClass}`}>
                      {status.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                    <button
                      onClick={() =>
                        navigate(`/agendamentos/${agendamento.id_agendamento}`)
                      }
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium"
                    >
                      Detalhes
                    </button>

                    {(tipoUsuario === "personal" || tipoUsuario === "nutricionista") &&
                      (status === "marcado" || status === "remarcado") && (
                        <>
                          <button
                            onClick={() =>
                              navigate(
                                `/agendamentos/${agendamento.id_agendamento}/editar`
                              )
                            }
                            className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => abrirModalConcluir(agendamento)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                          >
                            Concluir
                          </button>
                        </>
                      )}

                    {(status === "marcado" || status === "remarcado") && (
                      <button
                        onClick={() => abrirModalCancelar(agendamento)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostrarModalCancelar && (
        <ModalCancelarAgendamento
          onClose={() => setMostrarModalCancelar(false)}
          onConfirm={confirmarCancelamento}
        />
      )}

      {mostrarModalConcluir && (
        <ModalConcluirAgendamento
          onClose={() => setMostrarModalConcluir(false)}
          onConfirm={confirmarConclusao}
        />
      )}
    </Layout>
  );
}
