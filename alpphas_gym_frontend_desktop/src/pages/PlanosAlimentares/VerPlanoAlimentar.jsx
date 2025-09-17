import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios";
import Layout from "../../components/Layout";
import { MdPrint } from "react-icons/md";

export default function VerPlanoAlimentar() {
  const { id } = useParams();
  const [plano, setPlano] = useState(null);
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const perfil = await api.get("/usuarios/perfil");
        setTipo(perfil.data.tipo_usuario);

        const res = await api.get(`/planos/${id}`);
        setPlano(res.data);
      } catch (err) {
        console.error("Erro ao carregar plano:", err);
        alert("Erro ao carregar plano alimentar.");
      }
    }

    carregarDados();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (!plano) {
    return (
      <Layout>
        <div className="p-6">Carregando plano alimentar...</div>
      </Layout>
    );
  }

  const formatarData = (dataISO) => {
    const d = new Date(dataISO);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
        {/* Cabeçalho com botão de imprimir */}
        <div className="flex justify-between items-center mb-4 no-print">
          <h1 className="text-2xl font-bold">Plano Alimentar</h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-sm text-white font-medium shadow"
          >
            <MdPrint size={18} /> Imprimir
          </button>
        </div>

        {/* Área de impressão */}
        <div className="print-area">
          <div className="mb-4 text-sm text-gray-700 space-y-1">
            <p><strong>Aluno:</strong> {plano.nome_aluno}</p>
            <p><strong>Nutricionista:</strong> {plano.nome_profissional}</p>
            {plano.data_criacao && (
              <p>
                <strong>Data de Criação:</strong> {formatarData(plano.data_criacao)}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {plano.refeicoes && plano.refeicoes.length > 0 ? (
              plano.refeicoes.map((ref, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 rounded bg-gray-50"
                >
                  <h2 className="text-lg font-semibold mb-1">{ref.titulo}</h2>
                  <p className="text-gray-600 mb-2">
                    Calorias estimadas:{" "}
                    <strong>{ref.calorias_estimadas || 0} kcal</strong>
                  </p>

                  {ref.alimentos && ref.alimentos.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {ref.alimentos.map((a, i) => (
                        <li key={i}>
                          {a.nome} — {a.peso}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Sem alimentos registrados.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Nenhuma refeição cadastrada para este plano.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
