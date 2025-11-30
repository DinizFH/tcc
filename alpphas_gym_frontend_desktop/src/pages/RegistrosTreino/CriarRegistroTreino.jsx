import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../axios";
import ModalVideoExercicio from "../../components/ModalVideoExercicio";

export default function CriarRegistroTreino() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [exercicios, setExercicios] = useState([]);
  const [cargas, setCargas] = useState({});
  const [ultimasCargas, setUltimasCargas] = useState({});
  const [observacoes, setObservacoes] = useState("");
  const [videoUrlAberto, setVideoUrlAberto] = useState(null);

  const nomeTreino = state?.nome_treino || "";
  const nomePlano = state?.nome_plano || "";
  const idPlano = state?.id_plano || null;

  useEffect(() => {
    if (!state?.id_treino || !idPlano) {
      navigate("/registrostreino");
      return;
    }

    async function carregarTreino() {
      try {
        const perfilRes = await api.get("/usuarios/perfil");
        const tipoUsuario = perfilRes.data.tipo_usuario;

        let listaExercicios = [];

        if (tipoUsuario === "aluno") {
          //  Aluno: pega os treinos pelo plano
          const res = await api.get(`/treinos/plano/${idPlano}/detalhes`);
          const treinos = res.data?.plano?.treinos || [];

          const treinoSelecionado = treinos.find(
            (t) => t.id_treino === state.id_treino
          );

          if (treinoSelecionado) {
            listaExercicios = treinoSelecionado.exercicios;
          }
        } else {
          //  Personal: rota direta
          const res = await api.get(`/treinos/${state.id_treino}`);
          listaExercicios = res.data.exercicios || [];
        }

        setExercicios(listaExercicios);

        //  Carregar últimas cargas
        const novasUltimasCargas = {};
        for (const ex of listaExercicios) {
          try {
            let url = `/registrostreino/ultima-carga/${ex.id_exercicio}`;
            if (state.id_aluno) {
              url += `?id_aluno=${state.id_aluno}`;
            }
            const cargaRes = await api.get(url);
            novasUltimasCargas[`${state.id_treino}_${ex.id_exercicio}`] =
              cargaRes.data.ultima_carga;
          } catch {
            novasUltimasCargas[`${state.id_treino}_${ex.id_exercicio}`] = null;
          }
        }
        setUltimasCargas(novasUltimasCargas);
      } catch (err) {
        console.error("Erro ao carregar treino:", err);
        alert("Erro ao carregar treino.");
        navigate("/registrostreino");
      }
    }

    carregarTreino();
  }, [state, idPlano, navigate]);

  const handleChangeCarga = (id_exercicio, valor) => {
    setCargas((prev) => ({
      ...prev,
      [`${state.id_treino}_${id_exercicio}`]: valor,
    }));
  };

  const handleSalvar = async () => {
    try {
      const payload = {
        id_treino: state.id_treino,
        id_plano: idPlano,
        observacoes,
        cargas: exercicios.map((ex) => ({
          id_exercicio: ex.id_exercicio,
          carga:
            parseFloat(cargas[`${state.id_treino}_${ex.id_exercicio}`]) || 0,
        })),
      };

      if (state.id_aluno) {
        payload.id_aluno = state.id_aluno;
      }

      await api.post("/registrostreino/", payload);

      // Em vez de alert, redireciona com mensagem
      navigate("/registrostreino", {
        state: { mensagem: "Registro de treino salvo com sucesso!" },
      });
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      alert("Erro ao salvar registro.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Registrar Treino:{" "}
        {nomePlano
          ? `${nomePlano} — ${nomeTreino || "Carregando..."}`
          : nomeTreino || "Carregando..."}
      </h1>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Observações (opcional)</label>
        <textarea
          className="w-full border border-gray-300 p-2 rounded"
          rows={3}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      {exercicios.length === 0 ? (
        <p className="text-gray-600">Nenhum exercício vinculado ao treino.</p>
      ) : (
        <div className="space-y-4">
          {exercicios.map((ex) => (
            <div
              key={`${state.id_treino}_${ex.id_exercicio}`}
              className="bg-white p-4 shadow rounded flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1">
                <p className="font-semibold">{ex.nome}</p>
                <p className="text-sm text-gray-500">
                  Grupo: {ex.grupo_muscular}
                </p>
                {ultimasCargas[`${state.id_treino}_${ex.id_exercicio}`] !==
                  undefined && (
                  <p className="text-xs text-blue-600">
                    Última carga usada:{" "}
                    {ultimasCargas[`${state.id_treino}_${ex.id_exercicio}`] !==
                    null
                      ? `${ultimasCargas[`${state.id_treino}_${ex.id_exercicio}`]} kg`
                      : "Nenhum registro anterior"}
                  </p>
                )}
                {ex.video && (
                  <button
                    onClick={() => setVideoUrlAberto(ex.video)}
                    className="inline-block mt-1 text-sm text-blue-600 underline"
                  >
                    🎥 Ver Vídeo
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                placeholder="Carga (kg)"
                value={cargas[`${state.id_treino}_${ex.id_exercicio}`] || ""}
                onChange={(e) =>
                  handleChangeCarga(ex.id_exercicio, e.target.value)
                }
                className="border border-gray-300 p-2 rounded w-full md:w-40"
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-right mt-6">
        <button
          onClick={handleSalvar}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Salvar Registro
        </button>
      </div>

      {videoUrlAberto && (
        <ModalVideoExercicio
          videoUrl={videoUrlAberto}
          onClose={() => setVideoUrlAberto(null)}
        />
      )}
    </div>
  );
}
