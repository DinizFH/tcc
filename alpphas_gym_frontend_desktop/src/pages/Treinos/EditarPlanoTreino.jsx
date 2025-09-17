import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";

export default function EditarPlanoTreino() {
  const { alunoId } = useParams();
  const navigate = useNavigate();

  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function fetchTreinos() {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/treinos/aluno/${alunoId}/detalhes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTreinos(response.data);
      } catch (error) {
        console.error("Erro ao buscar treinos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTreinos();
  }, [alunoId]);

  const atualizarTreino = (index, campo, valor) => {
    const atualizados = [...treinos];
    atualizados[index][campo] = valor;
    setTreinos(atualizados);
  };

  const atualizarExercicio = (tIndex, eIndex, campo, valor) => {
    const atualizados = [...treinos];
    atualizados[tIndex].exercicios[eIndex][campo] = valor;
    setTreinos(atualizados);
  };

  const adicionarExercicio = (tIndex) => {
    const novoExercicio = {
      nome: "",
      grupo_muscular: "",
      series: "",
      repeticoes: "",
      observacoes: "",
    };
    const atualizados = [...treinos];
    atualizados[tIndex].exercicios.push(novoExercicio);
    setTreinos(atualizados);
  };

  const removerExercicio = (tIndex, eIndex) => {
    const atualizados = [...treinos];
    atualizados[tIndex].exercicios.splice(eIndex, 1);
    setTreinos(atualizados);
  };

  const removerTreino = (tIndex) => {
    const atualizados = [...treinos];
    atualizados.splice(tIndex, 1);
    setTreinos(atualizados);
  };

  const salvarAlteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      for (const treino of treinos) {
        const payload = {
          nome_treino: treino.nome_treino,
          id_aluno: alunoId,
          exercicios: treino.exercicios.map((ex) => ({
            nome: ex.nome,
            grupo_muscular: ex.grupo_muscular,
            series: ex.series,
            repeticoes: ex.repeticoes,
            observacoes: ex.observacoes,
          })),
        };

        await api.put(`/treinos/${treino.id_treino}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setMensagem("Plano de treino atualizado com sucesso!");
      setTimeout(() => navigate("/treinos"), 1500);
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      setMensagem("Erro ao salvar alterações. Tente novamente.");
    }
  };

  if (loading) return <Layout><p className="p-4">Carregando treinos...</p></Layout>;

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Editar Plano de Treino</h2>

        {treinos.length === 0 ? (
          <p className="text-gray-500">Nenhum treino restante para editar.</p>
        ) : (
          treinos.map((treino, tIndex) => (
            <div key={treino.id_treino} className="border p-4 mb-6 rounded-xl shadow bg-white">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-semibold">Nome do Treino</label>
                <button
                  onClick={() => removerTreino(tIndex)}
                  className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600"
                >
                  Excluir Treino
                </button>
              </div>
              <input
                type="text"
                className="w-full p-2 border rounded mb-4"
                value={treino.nome_treino}
                onChange={(e) =>
                  atualizarTreino(tIndex, "nome_treino", e.target.value)
                }
              />

              <h4 className="font-semibold mb-2">Exercícios</h4>
              {treino.exercicios.map((ex, eIndex) => (
                <div key={eIndex} className="border rounded p-3 mb-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">Exercício #{eIndex + 1}</span>
                    <button
                      onClick={() => removerExercicio(tIndex, eIndex)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={ex.nome}
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) =>
                      atualizarExercicio(tIndex, eIndex, "nome", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Grupo Muscular"
                    value={ex.grupo_muscular}
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) =>
                      atualizarExercicio(tIndex, eIndex, "grupo_muscular", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Séries"
                    value={ex.series}
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) =>
                      atualizarExercicio(tIndex, eIndex, "series", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder="Repetições"
                    value={ex.repeticoes}
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) =>
                      atualizarExercicio(tIndex, eIndex, "repeticoes", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="Observações"
                    value={ex.observacoes}
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) =>
                      atualizarExercicio(tIndex, eIndex, "observacoes", e.target.value)
                    }
                  />
                </div>
              ))}

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                onClick={() => adicionarExercicio(tIndex)}
              >
                Adicionar Exercício
              </button>
            </div>
          ))
        )}

        <button
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
          onClick={salvarAlteracoes}
          disabled={treinos.length === 0}
        >
          Salvar todas as alterações
        </button>

        {mensagem && <p className="mt-4 font-semibold">{mensagem}</p>}
      </div>
    </Layout>
  );
}
