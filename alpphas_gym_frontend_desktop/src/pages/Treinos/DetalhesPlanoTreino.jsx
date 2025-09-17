import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import { MdEdit, MdDelete, MdPrint } from "react-icons/md";
import AdicionarTreinoAoPlano from "./AdicionarTreinoAoPlano";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";

export default function DetalhesPlanoTreino() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdicionar, setShowAdicionar] = useState(false);
  const [treinoSelecionado, setTreinoSelecionado] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);

  async function fetchPlano() {
    try {
      const res = await api.get(`/treinos/plano/${id}/detalhes`);
      const planoApi = res?.data?.plano || null;

      const treinosNorm = Array.isArray(planoApi?.treinos)
        ? planoApi.treinos
        : Object.values(planoApi?.treinos || {});

      const treinosComExercicios = treinosNorm.map((t) => ({
        ...t,
        exercicios: Array.isArray(t.exercicios) ? t.exercicios : [],
      }));

      setPlano(planoApi ? { ...planoApi, treinos: treinosComExercicios } : null);
    } catch (err) {
      console.error("Erro ao buscar detalhes do plano:", err);
      setPlano(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlano();
  }, [id]);

  function onAdicionarSucesso() {
    setShowAdicionar(false);
    fetchPlano();
  }

  function handleEditar(treino) {
    navigate(`/treinos/${treino.id_treino}/editar`);
  }

  function abrirModalExcluir(treino) {
    setTreinoSelecionado(treino);
    setMostrarModalExcluir(true);
  }

  async function confirmarExclusao() {
    try {
      await api.delete(`/treinos/${treinoSelecionado.id_treino}`);
      navigate("/treinos", {
        state: { mensagem: "Treino excluído com sucesso." },
      });
    } catch (err) {
      console.error("Erro ao excluir treino:", err);
      alert("Não foi possível excluir o treino.");
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <Layout>
        <p>Carregando...</p>
      </Layout>
    );
  }

  if (!plano) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Detalhes do Plano de Treino</h1>
        <p className="text-gray-600">Plano não encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Botão de imprimir separado do restante */}
      <div className="flex items-center justify-between mb-4 no-print">
        <h1 className="text-2xl font-bold">Detalhes do Plano de Treino</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdicionar(true)}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-sm text-white font-medium shadow"
          >
            Incluir Treino
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-sm text-white font-medium shadow"
          >
            <MdPrint size={18} /> Imprimir
          </button>
        </div>
      </div>

      {/* Área de impressão */}
      <div className="print-area">
        {plano.treinos && plano.treinos.length > 0 ? (
          plano.treinos.map((treino, idx) => (
            <div
              key={treino.id_treino ?? idx}
              className="bg-white shadow rounded-lg p-3 mb-3 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2 no-print">
                <h2 className="text-lg font-semibold capitalize">
                  {treino.nome_treino}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditar(treino)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-500 hover:bg-yellow-600 text-[11px] text-white"
                  >
                    <MdEdit size={12} />
                    Editar
                  </button>
                  <button
                    onClick={() => abrirModalExcluir(treino)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-xs text-white font-medium"
                  >
                    <MdDelete size={14} />
                    Excluir
                  </button>
                </div>
              </div>

              {treino.exercicios.length > 0 ? (
                <ul className="space-y-1">
                  {treino.exercicios.map((ex, i) => (
                    <li
                      key={ex.id_exercicio ?? i}
                      className="border-b last:border-b-0 pb-1 text-sm"
                    >
                      <span className="font-medium">{ex.nome}</span>{" "}
                      {ex.grupo_muscular && (
                        <span className="text-gray-600">
                          ({ex.grupo_muscular})
                        </span>
                      )}
                      <div className="text-gray-700">
                        Séries: {ex.series}, Repetições: {ex.repeticoes}
                      </div>
                      {ex.observacoes && (
                        <div className="text-gray-500 italic text-xs">
                          Obs: {ex.observacoes}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  Nenhum exercício neste treino.
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-sm">Nenhum treino cadastrado.</p>
        )}
      </div>

      {showAdicionar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAdicionar(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Adicionar Treino</h3>
              <button
                onClick={() => setShowAdicionar(false)}
                className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              >
                Fechar
              </button>
            </div>
            <AdicionarTreinoAoPlano id_plano={id} onSucesso={onAdicionarSucesso} />
          </div>
        </div>
      )}

      {mostrarModalExcluir && treinoSelecionado && (
        <ModalConfirmarExclusao
          titulo="Excluir Treino"
          mensagem={`Tem certeza que deseja excluir o treino "${treinoSelecionado.nome_treino}"? Essa ação não poderá ser desfeita.`}
          onClose={() => setMostrarModalExcluir(false)}
          onConfirm={confirmarExclusao}
        />
      )}
    </Layout>
  );
}
