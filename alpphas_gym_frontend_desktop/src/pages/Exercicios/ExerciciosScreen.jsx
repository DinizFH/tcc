import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import ModalConfirmarExclusao from "../../components/ModalConfirmarExclusao";

export default function ExerciciosScreen() {
  const [exercicios, setExercicios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);

  const tipoUsuario = localStorage.getItem("perfil_tipo");

  useEffect(() => {
    buscarExercicios();
  }, []);

  const buscarExercicios = async () => {
    try {
      const response = await api.get("/exercicios");
      setExercicios(response.data);
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error);
    }
  };

  const abrirModalExcluir = (ex) => {
    setExercicioSelecionado(ex);
    setMostrarModalExcluir(true);
  };

  const confirmarExclusao = async () => {
    try {
      await api.delete(`/exercicios/${exercicioSelecionado.id_exercicio}`);
      setExercicios((prev) =>
        prev.filter((e) => e.id_exercicio !== exercicioSelecionado.id_exercicio)
      );
      setMostrarModalExcluir(false);
    } catch (error) {
      console.error("Erro ao excluir exercício:", error);
      alert("Erro ao excluir exercício.");
    }
  };

  const exerciciosFiltrados = exercicios.filter((ex) =>
    ex.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Exercícios</h1>
          {tipoUsuario === "personal" && (
            <Link
              to="/exercicios/novo"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Criar Exercício
            </Link>
          )}
        </div>

        <input
          type="text"
          placeholder="Buscar por nome..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="mb-4 border rounded px-3 py-2 w-full sm:w-1/3"
        />

        {exerciciosFiltrados.length === 0 ? (
          <p className="text-gray-600">Nenhum exercício encontrado.</p>
        ) : (
          <div className="grid gap-4">
            {exerciciosFiltrados.map((ex) => (
              <div
                key={ex.id_exercicio}
                className="bg-white shadow p-4 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{ex.nome}</h2>
                  <p className="text-sm text-gray-600">
                    <strong>Grupo Muscular:</strong> {ex.grupo_muscular}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Observações:</strong> {ex.observacoes || "Nenhuma"}
                  </p>
                  {ex.video && (
                    <p className="text-sm text-blue-600">
                      <a
                        href={ex.video}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        🎥 Ver vídeo
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Link
                    to={`/exercicios/${ex.id_exercicio}`}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Detalhes
                  </Link>

                  {tipoUsuario === "personal" && (
                    <>
                      <Link
                        to={`/exercicios/editar/${ex.id_exercicio}`}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => abrirModalExcluir(ex)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {mostrarModalExcluir && exercicioSelecionado && (
        <ModalConfirmarExclusao
          titulo="Excluir Exercício"
          mensagem={`Tem certeza que deseja excluir o exercício "${exercicioSelecionado.nome}"? Essa ação não poderá ser desfeita.`}
          onClose={() => setMostrarModalExcluir(false)}
          onConfirm={confirmarExclusao}
        />
      )}
    </Layout>
  );
}
