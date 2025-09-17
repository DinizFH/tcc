import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import Select from "react-select";
import { MdDelete, MdAdd } from "react-icons/md";

export default function EditarTreinoIndividual() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nomeTreino, setNomeTreino] = useState("");
  const [exercicios, setExercicios] = useState([]);
  const [todosExercicios, setTodosExercicios] = useState([]);

  useEffect(() => {
    buscarTreino();
    buscarExercicios();
  }, [id]);

  const buscarTreino = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/treinos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNomeTreino(response.data.nome_treino || "");

      // 🔧 garante que exercicios sempre seja array
      const dadosExercicios = Array.isArray(response.data.exercicios)
        ? response.data.exercicios.map((e) => ({
            id_exercicio: e.id_exercicio,
            series: e.series,
            repeticoes: e.repeticoes,
            observacoes: e.observacoes,
          }))
        : [];

      setExercicios(dadosExercicios);
    } catch (error) {
      console.error("Erro ao buscar treino:", error);
      setExercicios([]);
    }
  };

  const buscarExercicios = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/exercicios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodosExercicios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
      setTodosExercicios([]);
    }
  };

  const handleChangeExercicio = (index, field, value) => {
    const novos = [...exercicios];
    novos[index][field] = value;
    setExercicios(novos);
  };

  const adicionarExercicio = () => {
    setExercicios([
      ...exercicios,
      { id_exercicio: "", series: "", repeticoes: "", observacoes: "" },
    ]);
  };

  const removerExercicio = (index) => {
    const novos = [...exercicios];
    novos.splice(index, 1);
    setExercicios(novos);
  };

  const salvarAlteracoes = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/treinos/${id}`,
        {
          nome_treino: nomeTreino,
          exercicios,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(-1); // volta para a tela anterior (DetalhesPlanoTreino)
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    }
  };

  const opcoesExercicios = todosExercicios.map((ex) => ({
    value: ex.id_exercicio,
    label: `${ex.nome} (${ex.grupo_muscular})`,
  }));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Editar Treino</h1>

        <label className="block font-medium mb-1">Nome do Treino</label>
        <input
          type="text"
          value={nomeTreino}
          onChange={(e) => setNomeTreino(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-6"
        />

        <h2 className="text-xl font-semibold mb-3">Exercícios</h2>
        {exercicios.length === 0 && (
          <p className="text-gray-500 text-sm mb-3">
            Nenhum exercício adicionado. Clique em "Adicionar Exercício" abaixo.
          </p>
        )}
        {exercicios.map((ex, index) => {
          const exercicioSelecionado = opcoesExercicios.find(
            (op) => op.value === ex.id_exercicio
          );

          return (
            <div key={index} className="border p-4 rounded mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-md">Exercício {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removerExercicio(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <MdDelete size={18} />
                  Remover
                </button>
              </div>

              <Select
                value={exercicioSelecionado || null}
                onChange={(option) =>
                  handleChangeExercicio(
                    index,
                    "id_exercicio",
                    option ? option.value : ""
                  )
                }
                options={opcoesExercicios}
                isSearchable
                placeholder="Buscar exercício..."
              />

              <input
                type="number"
                placeholder="Séries"
                value={ex.series}
                onChange={(e) =>
                  handleChangeExercicio(index, "series", e.target.value)
                }
                className="w-full border border-gray-300 rounded p-2 mt-2"
              />

              <input
                type="text"
                placeholder="Repetições"
                value={ex.repeticoes}
                onChange={(e) =>
                  handleChangeExercicio(index, "repeticoes", e.target.value)
                }
                className="w-full border border-gray-300 rounded p-2 mt-2"
              />

              <textarea
                placeholder="Observações"
                value={ex.observacoes}
                onChange={(e) =>
                  handleChangeExercicio(index, "observacoes", e.target.value)
                }
                className="w-full border border-gray-300 rounded p-2 mt-2"
              />
            </div>
          );
        })}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={adicionarExercicio}
            className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            <MdAdd size={20} />
            Adicionar Exercício
          </button>
          <button
            onClick={salvarAlteracoes}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </Layout>
  );
}
