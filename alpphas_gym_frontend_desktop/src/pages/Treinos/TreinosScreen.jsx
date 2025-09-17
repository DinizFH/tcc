import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";

export default function TreinosScreen() {
  const [usuario, setUsuario] = useState(null);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const res = await api.get("/usuarios/perfil");
        setUsuario(res.data);

        if (res.data.tipo_usuario === "personal") {
          fetchTreinosPersonal();
        } else if (res.data.tipo_usuario === "aluno") {
          fetchTreinosAluno();
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      }
    }
    fetchPerfil();
  }, []);

  async function fetchTreinosPersonal(nome = "") {
    try {
      const res = await api.get(`/treinos/profissional?nome=${nome}`);
      const agrupado = res.data.map((aluno) => {
        const planos = {};
        aluno.treinos.forEach((treino) => {
          const key = treino.nome_plano || "Sem Plano";
          if (!planos[key]) planos[key] = { id_plano: treino.id_plano, treinos: [] };
          planos[key].treinos.push(treino);
        });
        return { ...aluno, planos };
      });
      setResultados(agrupado);
    } catch (err) {
      console.error("Erro ao buscar treinos:", err);
    }
  }

  async function fetchTreinosAluno() {
    try {
      const res = await api.get("/treinos/meus");
      if (Array.isArray(res.data)) {
        const planos = {};
        res.data.forEach((treino) => {
          const key = treino.nome_plano || "Sem Plano";
          if (!planos[key]) planos[key] = { id_plano: treino.id_plano, treinos: [] };
          planos[key].treinos.push(treino);
        });

        setResultados([
          {
            id_usuario: usuario?.id_usuario,
            nome: usuario?.nome,
            cpf: usuario?.cpf,
            planos,
          },
        ]);
      } else {
        setResultados([]);
      }
    } catch (err) {
      console.error("Erro ao buscar treinos do aluno:", err);
      setResultados([]);
    }
  }

  const abrirModalExcluir = (treinos, nome_plano, id_usuario, id_plano) => {
    setPlanoSelecionado({ treinos, nome_plano, id_usuario, id_plano });
    setMostrarModalExcluir(true);
  };

  const fecharModalExcluir = () => {
    setPlanoSelecionado(null);
    setMostrarModalExcluir(false);
  };

  const irParaDetalhes = (id_plano) => {
    if (!id_plano) return alert("ID do plano não encontrado.");

    if (usuario?.tipo_usuario === "personal") {
      navigate(`/treinos/plano/${id_plano}`);
    } else {
      navigate(`/treinos/plano/${id_plano}/detalhes`);
    }
  };

  const handleExcluirPlano = async () => {
    try {
      await api.delete(`/treinos/plano/${planoSelecionado.id_plano}`);
      setResultados((prev) =>
        prev.map((aluno) => ({
          ...aluno,
          planos: Object.fromEntries(
            Object.entries(aluno.planos).filter(
              ([, plano]) => plano.id_plano !== planoSelecionado.id_plano
            )
          ),
        }))
      );
      fecharModalExcluir();
    } catch (err) {
      console.error("Erro ao excluir plano:", err);
      alert("Erro ao excluir plano. Tente novamente.");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Treinos</h1>
          {usuario?.tipo_usuario === "personal" && (
            <button
              onClick={() => navigate("/treinos/novo")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Novo Treino
            </button>
          )}
        </div>

        {usuario?.tipo_usuario === "personal" && (
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            className="w-full border px-3 py-2 rounded mb-4"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              fetchTreinosPersonal(e.target.value);
            }}
          />
        )}

        {resultados.length === 0 ? (
          <p className="text-gray-500">
            {usuario?.tipo_usuario === "aluno"
              ? "Você não possui treinos cadastrados."
              : "Nenhum aluno com treino encontrado."}
          </p>
        ) : (
          <div className="space-y-6">
            {resultados.map((aluno) => (
              <div
                key={aluno.id_usuario}
                className="bg-white p-4 rounded shadow"
              >
                <div className="mb-2">
                  <p className="font-semibold text-lg">{aluno.nome}</p>
                  {usuario?.tipo_usuario === "personal" && (
                    <p className="text-sm text-gray-600">CPF: {aluno.cpf}</p>
                  )}
                </div>

                {Object.entries(aluno.planos).map(([nomePlano, plano]) => {
                  const id_plano = plano.id_plano;
                  const treinos = plano.treinos;

                  return (
                    <div key={nomePlano} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-md font-semibold">
                          Plano: {nomePlano}
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => irParaDetalhes(id_plano)}
                            className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-sm"
                          >
                            🔍 Detalhes
                          </button>

                          {usuario?.tipo_usuario === "personal" && (
                            <button
                              onClick={() =>
                                abrirModalExcluir(
                                  treinos,
                                  nomePlano,
                                  aluno.id_usuario,
                                  id_plano
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                              🗑️ Excluir
                            </button>
                          )}
                        </div>
                      </div>

                      <ul className="list-disc ml-6 text-sm text-gray-800">
                        {treinos.map((t) => (
                          <li key={t.id_treino}>{t.nome_treino}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {mostrarModalExcluir && planoSelecionado && (
          <ModalConfirmarExclusao
            titulo="Excluir Plano de Treino"
            mensagem={`Tem certeza que deseja excluir o plano "${planoSelecionado.nome_plano}" e todos os treinos vinculados a ele?`}
            onClose={fecharModalExcluir}
            onConfirm={handleExcluirPlano}
          />
        )}
      </div>
    </Layout>
  );
}
