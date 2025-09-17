import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import ModalCriarExercicio from "../Exercicios/ModalCriarExercicio";

export default function CriarTreino() {
  const navigate = useNavigate();
  const { id_plano } = useParams();

  const [buscaAluno, setBuscaAluno] = useState("");
  const [resultadosAluno, setResultadosAluno] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [nomePlano, setNomePlano] = useState("");

  const [treinos, setTreinos] = useState([]);
  const [nomeTreinoAtual, setNomeTreinoAtual] = useState("");
  const [exerciciosTreinoAtual, setExerciciosTreinoAtual] = useState([]);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [formExercicio, setFormExercicio] = useState({ series: "", repeticoes: "", observacoes: "" });
  const [novoExercicio, setNovoExercicio] = useState("");
  const [resultadosExercicio, setResultadosExercicio] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    if (id_plano) {
      async function carregarPlano() {
        try {
          const res = await api.get(`/treinos/plano/${id_plano}`);
          setNomePlano(res.data.nome_plano || "");
          setAlunoSelecionado(res.data.aluno);
        } catch (err) {
          console.error("Erro ao carregar plano:", err);
        }
      }
      carregarPlano();
    }
  }, [id_plano]);

  useEffect(() => {
    if (buscaAluno.length >= 2 && !id_plano) {
      const delay = setTimeout(async () => {
        const res = await api.get(`/avaliacoes/buscar-aluno?nome=${buscaAluno}`);
        setResultadosAluno(res.data);
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [buscaAluno, id_plano]);

  useEffect(() => {
    if (novoExercicio.length >= 2) {
      const delay = setTimeout(async () => {
        const res = await api.get(`/exercicios?nome=${novoExercicio}`);
        setResultadosExercicio(res.data);
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setResultadosExercicio([]);
    }
  }, [novoExercicio]);

  const adicionarExercicioAoTreinoAtual = () => {
    if (!exercicioSelecionado || !formExercicio.series || !formExercicio.repeticoes) return;
    setExerciciosTreinoAtual([
      ...exerciciosTreinoAtual,
      {
        ...exercicioSelecionado,
        nome_exercicio: exercicioSelecionado.nome,
        id_exercicio: exercicioSelecionado.id_exercicio,
        series: formExercicio.series,
        repeticoes: formExercicio.repeticoes,
        observacoes: formExercicio.observacoes,
      },
    ]);
    setExercicioSelecionado(null);
    setNovoExercicio("");
    setFormExercicio({ series: "", repeticoes: "", observacoes: "" });
  };

  const adicionarTreino = () => {
    if (!nomeTreinoAtual || exerciciosTreinoAtual.length === 0) return;
    setTreinos([...treinos, {
      nome_treino: nomeTreinoAtual,
      exercicios: exerciciosTreinoAtual
    }]);
    setNomeTreinoAtual("");
    setExerciciosTreinoAtual([]);
  };

  const removerTreino = (index) => {
    const novosTreinos = [...treinos];
    novosTreinos.splice(index, 1);
    setTreinos(novosTreinos);
  };

  const handleSalvarPlano = async () => {
    if (!alunoSelecionado || treinos.length === 0 || (!id_plano && !nomePlano)) return;

    try {
      if (id_plano) {
        for (let treino of treinos) {
          await api.post("/treinos", {
            id_plano: parseInt(id_plano),
            id_aluno: alunoSelecionado.id_usuario,
            nome_treino: treino.nome_treino,
            exercicios: treino.exercicios
          });
        }
      } else {
        await api.post("/treinos/plano", {
          id_aluno: alunoSelecionado.id_usuario,
          nome_plano: nomePlano,
          treinos: treinos
        });
      }
      navigate("/treinos");
    } catch (err) {
      console.error("Erro ao salvar plano de treinos:", err);
    }
  };

  const handleSalvarExercicioModal = (novoExercicioCriado) => {
    setExercicioSelecionado({
      ...novoExercicioCriado,
      nome_exercicio: novoExercicioCriado.nome,
      id_exercicio: novoExercicioCriado.id_exercicio
    });
    setResultadosExercicio([]);
    setNovoExercicio("");
  };

  const handleSelecionarExercicio = (ex) => {
    setExercicioSelecionado({ ...ex, nome_exercicio: ex.nome, id_exercicio: ex.id_exercicio });
    setResultadosExercicio([]);
    setNovoExercicio("");
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {id_plano ? "Adicionar Treino ao Plano" : "Criar Plano de Treinos"}
        </h1>

        {!alunoSelecionado && !id_plano && (
          <div>
            <input
              type="text"
              placeholder="Buscar aluno por nome..."
              value={buscaAluno}
              onChange={(e) => setBuscaAluno(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <ul className="border mt-1 rounded max-h-40 overflow-y-auto">
              {resultadosAluno.map((aluno) => (
                <li
                  key={aluno.id_usuario}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setAlunoSelecionado(aluno)}
                >
                  {aluno.nome} ({aluno.cpf})
                </li>
              ))}
            </ul>
          </div>
        )}

        {alunoSelecionado && (
          <>
            <p className="mb-4 font-medium">
              Aluno selecionado: {alunoSelecionado.nome} ({alunoSelecionado.cpf})
            </p>

            {!id_plano && (
              <div className="mb-4">
                <label className="block font-medium mb-1">Nome do Plano de Treino <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={nomePlano}
                  onChange={(e) => setNomePlano(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Ex: Hipertrofia Julho"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block font-medium mb-1">Nome do novo treino</label>
              <input
                type="text"
                value={nomeTreinoAtual}
                onChange={(e) => setNomeTreinoAtual(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Adicionar Exercício</label>
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={novoExercicio}
                onChange={(e) => {
                  setNovoExercicio(e.target.value);
                  setExercicioSelecionado(null);
                }}
                className="w-full border px-3 py-2 rounded"
              />

              {resultadosExercicio.length > 0 && (
                <ul className="border mt-1 rounded max-h-40 overflow-y-auto">
                  {resultadosExercicio.map((ex) => (
                    <li
                      key={ex.id_exercicio}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelecionarExercicio(ex)}
                    >
                      {ex.nome}
                    </li>
                  ))}
                </ul>
              )}

              {resultadosExercicio.length === 0 && novoExercicio.length > 2 && (
                <p className="text-sm text-gray-500 mt-2">
                  Nenhum exercício encontrado.
                  <button
                    onClick={() => setModalVisivel(true)}
                    className="ml-2 text-blue-600 underline"
                  >
                    Criar novo exercício
                  </button>
                </p>
              )}

              {exercicioSelecionado && (
                <div className="mt-4">
                  <p className="text-sm">
                    <strong>Selecionado:</strong> {exercicioSelecionado.nome_exercicio}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Séries"
                      value={formExercicio.series}
                      onChange={(e) => setFormExercicio({ ...formExercicio, series: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Repetições"
                      value={formExercicio.repeticoes}
                      onChange={(e) => setFormExercicio({ ...formExercicio, repeticoes: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Observações"
                      value={formExercicio.observacoes}
                      onChange={(e) => setFormExercicio({ ...formExercicio, observacoes: e.target.value })}
                      className="border px-2 py-1 rounded"
                    />
                    <button
                      onClick={adicionarExercicioAoTreinoAtual}
                      className="col-span-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Adicionar Exercício
                    </button>
                  </div>
                </div>
              )}
            </div>

            {exerciciosTreinoAtual.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold">Exercícios deste treino:</h3>
                <ul className="list-disc ml-6">
                  {exerciciosTreinoAtual.map((e, i) => (
                    <li key={i}>
                      {e.nome_exercicio} - {e.series}x{e.repeticoes} ({e.observacoes})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={adicionarTreino}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
            >
              Adicionar Treino ao Plano
            </button>

            {treinos.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Treinos no Plano:</h2>
                <ul className="space-y-2">
                  {treinos.map((t, i) => (
                    <li key={i} className="flex justify-between items-center border p-2 rounded">
                      <span>{t.nome_treino} ({t.exercicios.length} exercícios)</span>
                      <button
                        onClick={() => removerTreino(i)}
                        className="text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleSalvarPlano}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                >
                  Salvar {id_plano ? "Treino(s)" : "Plano de Treinos"}
                </button>
              </div>
            )}
          </>
        )}

        <ModalCriarExercicio
          visivel={modalVisivel}
          onFechar={() => setModalVisivel(false)}
          onSalvar={handleSalvarExercicioModal}
        />
      </div>
    </Layout>
  );
}
