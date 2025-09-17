import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import { MdPrint } from "react-icons/md";

export default function DetalhesPlanoTreinoAluno() {
  const { id } = useParams();
  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-2xl font-bold mb-4">Meus Treinos</h1>
        <p className="text-gray-600">Nenhum treino encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cabeçalho com botão de imprimir */}
      <div className="flex items-center justify-between mb-4 no-print">
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-sm text-white font-medium shadow"
        >
          <MdPrint size={18} /> Imprimir
        </button>
      </div>

      {/* Área de impressão */}
      <div className="print-area">
        {plano.treinos && plano.treinos.length > 0 ? (
          plano.treinos.map((treino, idx) => (
            <div
              key={treino.id_treino ?? idx}
              className="bg-white shadow rounded-lg p-3 mb-3 border border-gray-200"
            >
              <h2 className="text-lg font-semibold capitalize mb-2">
                {treino.nome_treino}
              </h2>

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
    </Layout>
  );
}
