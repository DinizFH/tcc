import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../axios";
import ModalSelecionarAluno from "./ModalSelecionarAluno";
import ModalSelecionarPlano from "./ModalSelecionarPlano";
import ModalSelecionarTreino from "./ModalSelecionarTreino";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";

export default function RegistrosTreinoScreen() {
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [tipo, setTipo] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [mostrarModalAluno, setMostrarModalAluno] = useState(false);
  const [mostrarModalPlano, setMostrarModalPlano] = useState(false);
  const [mostrarModalTreino, setMostrarModalTreino] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);

  // 🔹 Modal de exclusão
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);

  // 🔹 Mensagem de sucesso (após criar/editar)
  const location = useLocation();
  const [mensagem, setMensagem] = useState(location.state?.mensagem || "");

  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDados() {
      try {
        const perfil = await api.get("/usuarios/perfil");
        setTipo(perfil.data.tipo_usuario);
        setNomeUsuario(perfil.data.nome);
        setUsuarioId(perfil.data.id_usuario);

        const res =
          perfil.data.tipo_usuario === "aluno"
            ? await api.get("/registrostreino/meus")
            : await api.get("/registrostreino/");

        setRegistros(res.data);
      } catch (err) {
        console.error("Erro ao carregar registros:", err);
        alert("Erro ao carregar registros.");
      }
    }

    carregarDados();

    // 🔹 Limpa mensagem do state depois de exibir
    if (location.state?.mensagem) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const registrosFiltrados = registros.filter((reg) =>
    tipo === "aluno"
      ? true
      : reg.nome_aluno?.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleNovoRegistro = () => {
    if (tipo === "aluno") {
      setMostrarModalPlano(true);
    } else {
      setMostrarModalAluno(true);
    }
  };

  const handleSelecionarAluno = (aluno) => {
    setAlunoSelecionado(aluno);
    setMostrarModalAluno(false);
    setMostrarModalPlano(true);
  };

  const handleSelecionarPlano = (plano) => {
    setPlanoSelecionado(plano);
    setMostrarModalPlano(false);
    setMostrarModalTreino(true);
  };

  const handleSelecionarTreino = (treino) => {
    setMostrarModalTreino(false);
    navigate("/registrostreino/novo", {
      state: {
        id_treino: treino.id_treino,
        id_aluno: alunoSelecionado?.id_usuario || usuarioId,
        id_plano: treino.id_plano,
        nome_treino: treino.nome_treino,
        nome_plano: treino.nome_plano,
      },
    });
  };

  const handleVerDetalhes = (id) => navigate(`/registrostreino/${id}`);
  const handleEditar = (id) => navigate(`/registrostreino/${id}/editar`);

  const abrirModalExcluir = (registro) => {
    setRegistroSelecionado(registro);
    setMostrarModalExcluir(true);
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/registrostreino/${registroSelecionado.id_registro}`);
      setRegistros((prev) =>
        prev.filter((r) => r.id_registro !== registroSelecionado.id_registro)
      );
      setMostrarModalExcluir(false);
    } catch (err) {
      console.error("Erro ao excluir registro:", err);
      alert("Erro ao excluir registro.");
    }
  };

  const formatarDataHora = (data) =>
    new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {tipo === "aluno"
            ? "Meus Registros de Treino"
            : "Registros de Treino dos Alunos"}
        </h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleNovoRegistro}
        >
          Novo Registro de Treino
        </button>
      </div>

      {/* 🔹 Mensagem de sucesso */}
      {mensagem && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
          {mensagem}
        </div>
      )}

      {tipo !== "aluno" && (
        <input
          type="text"
          placeholder="Buscar aluno por nome..."
          className="mb-4 p-2 border border-gray-300 rounded w-full"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      )}

      {registrosFiltrados.length === 0 ? (
        <p className="text-gray-500">Nenhum registro encontrado.</p>
      ) : (
        <div className="grid gap-4">
          {registrosFiltrados.map((registro) => (
            <div
              key={registro.id_registro}
              className="bg-white shadow rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <p className="font-semibold">
                  {tipo === "aluno"
                    ? `${registro.nome_plano ? registro.nome_plano + " — " : ""}${registro.nome_treino}`
                    : `${registro.nome_aluno} - ${registro.nome_plano ? registro.nome_plano + " — " : ""}${registro.nome_treino}`}
                </p>
                <p className="text-gray-600">
                  Registrado em: {formatarDataHora(registro.data_execucao)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                  onClick={() => handleVerDetalhes(registro.id_registro)}
                >
                  Ver Detalhes
                </button>
                {(tipo === "aluno" || tipo === "personal") && (
                  <>
                    <button
                      className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      onClick={() => handleEditar(registro.id_registro)}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => abrirModalExcluir(registro)}
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {mostrarModalAluno && (
        <ModalSelecionarAluno
          onClose={() => setMostrarModalAluno(false)}
          onSelecionar={handleSelecionarAluno}
        />
      )}
      {mostrarModalPlano && (
        <ModalSelecionarPlano
          idAluno={tipo === "aluno" ? usuarioId : alunoSelecionado?.id_usuario}
          onClose={() => setMostrarModalPlano(false)}
          onSelecionar={handleSelecionarPlano}
        />
      )}
      {mostrarModalTreino && (
        <ModalSelecionarTreino
          plano={planoSelecionado}
          onClose={() => setMostrarModalTreino(false)}
          onSelecionar={handleSelecionarTreino}
        />
      )}

      {mostrarModalExcluir && registroSelecionado && (
        <ModalConfirmarExclusao
          titulo="Excluir Registro de Treino"
          mensagem={`Tem certeza que deseja excluir o registro de treino "${registroSelecionado.nome_treino}" do aluno ${registroSelecionado.nome_aluno || "?"}? Essa ação não poderá ser desfeita.`}
          onClose={() => setMostrarModalExcluir(false)}
          onConfirm={confirmarExclusao}
        />
      )}
    </div>
  );
}
