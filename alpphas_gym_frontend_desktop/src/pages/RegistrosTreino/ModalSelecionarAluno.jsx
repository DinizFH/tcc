import { useEffect, useState } from "react";
import api from "../../axios";

export default function ModalSelecionarAluno({ onClose, onSelecionar }) {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregarAlunos() {
      try {
        const res = await api.get("/usuarios/alunos");
        setAlunos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
      }
    }
    carregarAlunos();
  }, []);

  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Selecionar Aluno</h2>

        <input
          type="text"
          className="w-full border border-gray-300 p-2 mb-4 rounded"
          placeholder="Buscar aluno por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {alunosFiltrados.length === 0 ? (
          <p className="text-gray-500">Nenhum aluno encontrado.</p>
        ) : (
          <ul className="divide-y">
            {alunosFiltrados.map((aluno) => (
              <li
                key={aluno.id_usuario}
                className="py-2 px-3 hover:bg-gray-100 cursor-pointer rounded"
                onClick={() => onSelecionar(aluno)}
              >
                {aluno.nome} <span className="text-sm text-gray-500">({aluno.cpf})</span>
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
