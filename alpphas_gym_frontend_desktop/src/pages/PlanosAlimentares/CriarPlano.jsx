import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import ModalCadastroRapidoAluno from "../../components/ModalCadastroRapidoAluno";
import Layout from "../../components/Layout";

export default function CriarPlano() {
  const navigate = useNavigate();
  const [descricaoGeral, setDescricaoGeral] = useState("");
  const [refeicoes, setRefeicoes] = useState([]);
  const [novaRefeicao, setNovaRefeicao] = useState({
    titulo: "",
    calorias_estimadas: "",
    alimentos: Array.from({ length: 5 }, () => ({ nome: "", peso: "" })),
  });

  const [buscaAluno, setBuscaAluno] = useState("");
  const [resultados, setResultados] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showCadastroRapido, setShowCadastroRapido] = useState(false);

  const [mensagem, setMensagem] = useState(""); // ✅ mensagem de feedback

  useEffect(() => {
    if (buscaAluno.length >= 2) {
      const buscar = setTimeout(async () => {
        try {
          const res = await api.get(`/usuarios/alunos?nome=${buscaAluno}`);
          setResultados(res.data);
        } catch (err) {
          console.error("Erro ao buscar aluno", err);
        }
      }, 400);
      return () => clearTimeout(buscar);
    }
  }, [buscaAluno]);

  const handleAlimentoChange = (index, campo, valor) => {
    const novosAlimentos = [...novaRefeicao.alimentos];
    novosAlimentos[index][campo] = valor;
    setNovaRefeicao({ ...novaRefeicao, alimentos: novosAlimentos });
  };

  const adicionarAlimento = () => {
    setNovaRefeicao((prev) => ({
      ...prev,
      alimentos: [...prev.alimentos, { nome: "", peso: "" }],
    }));
  };

  const adicionarRefeicao = () => {
    if (!novaRefeicao.titulo.trim()) return;

    const alimentosValidos = novaRefeicao.alimentos.filter(
      (a) => a.nome.trim() !== "" && a.peso.trim() !== ""
    );
    if (alimentosValidos.length === 0) return;

    setRefeicoes((prev) => [
      ...prev,
      {
        ...novaRefeicao,
        calorias_estimadas: Number(novaRefeicao.calorias_estimadas),
        alimentos: alimentosValidos,
      },
    ]);

    setNovaRefeicao({
      titulo: "",
      calorias_estimadas: "",
      alimentos: Array.from({ length: 5 }, () => ({ nome: "", peso: "" })),
    });
  };

  const salvarPlano = async () => {
    try {
      const refeicoesFiltradas = refeicoes
        .map((r) => ({
          ...r,
          calorias_estimadas: Number(r.calorias_estimadas),
          alimentos: r.alimentos.filter(
            (a) => a.nome.trim() !== "" && a.peso.trim() !== ""
          ),
        }))
        .filter((r) => r.alimentos.length > 0);

      if (refeicoesFiltradas.length === 0 || !alunoSelecionado) {
        setMensagem("Selecione um aluno e adicione ao menos uma refeição válida.");
        return;
      }

      const body = {
        id_aluno: alunoSelecionado.id_usuario,
        descricao_geral: descricaoGeral,
        refeicoes: refeicoesFiltradas,
      };

      await api.post("/planos/", body);

      // ✅ mostra mensagem e redireciona após 1,5s
      setMensagem("Plano alimentar criado com sucesso!");
      setTimeout(() => navigate("/planos"), 1500);

    } catch (err) {
      console.error("Erro ao salvar plano:", err);
      setMensagem("Erro ao salvar plano.");
    }
  };

  const handleCancelar = () => navigate("/planos");

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Criar Plano Alimentar</h2>

        {mensagem && (
          <div className="mb-4 p-3 rounded text-white bg-blue-600">
            {mensagem}
          </div>
        )}

        {!alunoSelecionado ? (
          <div className="mb-4">
            <label className="block mb-1">Buscar Aluno:</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={buscaAluno}
              onChange={(e) => setBuscaAluno(e.target.value)}
              placeholder="Ex: João Silva"
            />
            {resultados.length > 0 ? (
              <ul className="border rounded max-h-40 overflow-y-auto mb-2">
                {resultados.map((aluno) => (
                  <li
                    key={aluno.id_usuario}
                    onClick={() => {
                      setAlunoSelecionado(aluno);
                      setResultados([]);
                      setBuscaAluno("");
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {aluno.nome} ({aluno.cpf})
                  </li>
                ))}
              </ul>
            ) : (
              buscaAluno.length >= 2 && (
                <button
                  onClick={() => setShowCadastroRapido(true)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  + Cadastrar novo aluno
                </button>
              )
            )}
          </div>
        ) : (
          <p className="mb-4 text-sm text-gray-600">
            Criando para: <strong>{alunoSelecionado.nome}</strong> | CPF: {alunoSelecionado.cpf}
          </p>
        )}

        {alunoSelecionado && (
          <>
            <textarea
              placeholder="Descrição geral do plano (opcional)"
              value={descricaoGeral}
              onChange={(e) => setDescricaoGeral(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows={3}
            />

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título da refeição (Ex: Café da manhã)"
                value={novaRefeicao.titulo}
                onChange={(e) =>
                  setNovaRefeicao({ ...novaRefeicao, titulo: e.target.value })
                }
                className="w-full p-2 border rounded"
              />

              <input
                type="number"
                placeholder="Calorias totais da refeição"
                value={novaRefeicao.calorias_estimadas}
                onChange={(e) =>
                  setNovaRefeicao({
                    ...novaRefeicao,
                    calorias_estimadas: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
              />

              <div className="space-y-2">
                {novaRefeicao.alimentos.map((alimento, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Alimento ${index + 1}`}
                      value={alimento.nome}
                      onChange={(e) =>
                        handleAlimentoChange(index, "nome", e.target.value)
                      }
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Peso (g/ml)"
                      value={alimento.peso}
                      onChange={(e) =>
                        handleAlimentoChange(index, "peso", e.target.value)
                      }
                      className="w-32 p-2 border rounded"
                    />
                  </div>
                ))}

                {novaRefeicao.alimentos.length >= 5 && (
                  <button
                    onClick={adicionarAlimento}
                    className="text-sm text-blue-600"
                  >
                    + Adicionar mais alimentos
                  </button>
                )}
              </div>

              <button
                onClick={adicionarRefeicao}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Adicionar Refeição
              </button>

              {refeicoes.length > 0 && (
                <div className="bg-gray-50 p-4 border rounded">
                  <h3 className="font-semibold mb-2">Refeições adicionadas:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {refeicoes.map((r, i) => (
                      <li key={i}>
                        <strong>{r.titulo}</strong> — {r.calorias_estimadas} kcal,{" "}
                        {r.alimentos.length} alimentos
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleCancelar}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarPlano}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Salvar Plano Completo
                </button>
              </div>
            </div>
          </>
        )}

        {showCadastroRapido && (
          <ModalCadastroRapidoAluno
            onClose={() => setShowCadastroRapido(false)}
            onAlunoCriado={(novoAluno) => {
              setAlunoSelecionado(novoAluno);
              setShowCadastroRapido(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
}
