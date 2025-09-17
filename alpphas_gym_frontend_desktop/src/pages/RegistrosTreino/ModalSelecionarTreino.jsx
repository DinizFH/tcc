export default function ModalSelecionarTreino({ plano, onClose, onSelecionar }) {
  // 🔹 Garante que treinos seja sempre array
  const treinos = Array.isArray(plano?.treinos) ? plano.treinos : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Selecionar Treino — {plano?.nome_plano || "Sem nome"}
        </h2>

        {treinos.length === 0 ? (
          <p className="text-gray-500">Nenhum treino encontrado neste plano.</p>
        ) : (
          <ul className="divide-y">
            {treinos.map((treino) => (
              <li
                key={treino.id_treino}
                className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() =>
                  onSelecionar({
                    id_treino: treino.id_treino,
                    nome_treino: treino.nome_treino,
                    id_plano: plano?.id_plano || null, // 🔹 agora também passa o id do plano
                    nome_plano: plano?.nome_plano || "",
                  })
                }
              >
                {treino.nome_treino}
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
