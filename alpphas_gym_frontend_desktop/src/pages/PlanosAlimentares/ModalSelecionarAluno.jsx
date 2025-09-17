import { useEffect, useState } from "react";
import api from "../../axios";
import ModalCadastroRapidoAluno from "../../components/ModalCadastroRapidoAluno";

export default function SelecionarAlunoModal({ onSelect, onCancel }) {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarCadastroRapido, setMostrarCadastroRapido] = useState(false);

  useEffect(() => {
    if (busca.length < 2) {
      setAlunos([]);
      return;
    }

    const timer = setTimeout(() => {
      api
        .get(`/usuarios/alunos?nome=${busca}`)
        .then((res) => setAlunos(res.data))
        .catch((err) => {
          console.error("Erro ao buscar alunos:", err);
          setAlunos([]);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [busca]);

  const handleCancelar = () => {
    if (typeof onCancel === "function") onCancel();
  };

  const handleSelecionar = (aluno) => {
    if (typeof onSelect === "function") onSelect(aluno);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl relative">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Selecionar Aluno</h2>
          <button
            onClick={handleCancelar}
            className="text-gray-500 hover:text-black"
          >
            ✖
          </button>
        </div>

        {/* Campo de busca */}
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite ao menos 2 letras do nome..."
          className="w-full p-2 border rounded mb-4"
        />

        {/* Lista de resultados */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {busca.length >= 2 &&
            alunos.map((aluno) => (
              <div
                key={aluno.id_usuario}
                className="flex justify-between items-center p-3 border rounded bg-gray-50 hover:bg-gray-100"
              >
                <div>
                  <p className="font-medium">{aluno.nome}</p>
                  <p className="text-sm text-gray-500">
                    CPF: {aluno.cpf || "Não informado"}
                  </p>
                </div>
                <button
                  onClick={() => handleSelecionar(aluno)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Iniciar Plano
                </button>
              </div>
            ))}

          {busca.length >= 2 && alunos.length === 0 && (
            <div className="text-center text-gray-600 text-sm">
              Nenhum aluno encontrado.
            </div>
          )}
        </div>

        {/* Cadastrar novo aluno */}
        {busca.length >= 2 && alunos.length === 0 && (
          <button
            onClick={() => setMostrarCadastroRapido(true)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            + Cadastrar novo aluno
          </button>
        )}

        {/* Rodapé */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleCancelar}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>

        {/* Modal de cadastro rápido */}
        {mostrarCadastroRapido && (
          <ModalCadastroRapidoAluno
            onClose={() => setMostrarCadastroRapido(false)}
            onAlunoCriado={(novoAluno) => {
              setAlunos((prev) => [novoAluno, ...prev]);
              setMostrarCadastroRapido(false);
              handleSelecionar(novoAluno);
            }}
          />
        )}
      </div>
    </div>
  );
}
