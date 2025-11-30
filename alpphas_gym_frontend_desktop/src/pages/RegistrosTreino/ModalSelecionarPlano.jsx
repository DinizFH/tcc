import { useEffect, useState } from "react";
import api from "../../axios";

export default function ModalSelecionarPlano({ idAluno, onClose, onSelecionar }) {
  const [planos, setPlanos] = useState([]);

  useEffect(() => {
    async function carregarPlanos() {
      try {
        if (!idAluno) return;

        // Rota unificada
        const res = await api.get(`/treinos/aluno/${idAluno}/planos`);
        const dados = Array.isArray(res.data)
          ? res.data
          : res.data?.planos || [];

        //  Deduplicar planos por id_plano
        const unicos = [];
        const vistos = new Set();
        for (const p of dados) {
          if (!vistos.has(p.id_plano)) {
            vistos.add(p.id_plano);
            unicos.push(p);
          }
        }

        setPlanos(unicos);
      } catch (err) {
        console.error("Erro ao carregar planos:", err);
      }
    }

    carregarPlanos();
  }, [idAluno]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Selecionar Plano de Treino</h2>

        {planos.length === 0 ? (
          <p className="text-gray-500">Nenhum plano encontrado.</p>
        ) : (
          <ul className="divide-y">
            {planos.map((plano) => (
              <li
                key={plano.id_plano}
                className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => onSelecionar(plano)} // Passa plano inteiro com seus treinos
              >
                {plano.nome_plano}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
