import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdicionarTreinoAoPlano({ id_plano, onSucesso }) {
  const [nomeTreino, setNomeTreino] = useState('');
  const [exercicios, setExercicios] = useState([]);
  const [busca, setBusca] = useState('');
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [inputCampos, setInputCampos] = useState({
    series: '',
    repeticoes: '',
    observacoes: '',
  });
  const [exerciciosAdicionados, setExerciciosAdicionados] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const carregarExercicios = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/exercicios/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExercicios(response.data);
      } catch (error) {
        console.error('Erro ao carregar exercícios:', error);
      }
    };

    carregarExercicios();
  }, [token]);

  const exerciciosFiltrados = exercicios.filter((ex) =>
    ex.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const selecionarExercicio = (ex) => {
    setExercicioSelecionado(ex);
    setBusca('');
  };

  const adicionarExercicio = () => {
    if (!exercicioSelecionado || !inputCampos.series || !inputCampos.repeticoes) {
      alert('Preencha os campos obrigatórios e selecione um exercício.');
      return;
    }

    setExerciciosAdicionados([
      ...exerciciosAdicionados,
      {
        ...exercicioSelecionado,
        series: inputCampos.series,
        repeticoes: inputCampos.repeticoes,
        observacoes: inputCampos.observacoes
      }
    ]);

    setExercicioSelecionado(null);
    setInputCampos({ series: '', repeticoes: '', observacoes: '' });
  };

  const removerExercicio = (index) => {
    setExerciciosAdicionados(exerciciosAdicionados.filter((_, i) => i !== index));
  };

  const salvarTreino = async () => {
    if (!nomeTreino || exerciciosAdicionados.length === 0) {
      alert('Preencha o nome do treino e adicione pelo menos um exercício.');
      return;
    }

    const payload = {
      id_plano,
      nome_treino: nomeTreino,
      exercicios: exerciciosAdicionados.map((ex) => ({
        id_exercicio: ex.id_exercicio,
        series: ex.series,
        repeticoes: ex.repeticoes,
        observacoes: ex.observacoes
      }))
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/treinos/adicionar-ao-plano`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensagemSucesso(true);
      setTimeout(() => {
        setMensagemSucesso(false);
        if (onSucesso) onSucesso();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      alert('Erro ao salvar treino.');
    }
  };

  return (
    <div className="animate-fadeIn w-full">
      <h2 className="text-xl font-bold mb-4">Adicionar novo treino ao plano</h2>

      <div className="mb-4">
        <label className="block font-semibold">Nome do novo treino:</label>
        <input
          type="text"
          value={nomeTreino}
          onChange={(e) => setNomeTreino(e.target.value)}
          placeholder="Ex: Treino A, B..."
          className="w-full p-2 border rounded mt-1"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold">Buscar exercício:</label>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome do exercício..."
          className="w-full p-2 border rounded mt-1"
        />
        {busca && (
          <ul className="bg-white border mt-1 max-h-40 overflow-y-auto rounded shadow">
            {exerciciosFiltrados.map((ex) => (
              <li
                key={ex.id_exercicio}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selecionarExercicio(ex)}
              >
                {ex.nome} ({ex.grupo_muscular})
              </li>
            ))}
          </ul>
        )}
      </div>

      {exercicioSelecionado && (
        <div className="mb-4 border rounded p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">{exercicioSelecionado.nome}</h3>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <input
              type="number"
              placeholder="Séries"
              value={inputCampos.series}
              onChange={(e) => setInputCampos({ ...inputCampos, series: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Repetições"
              value={inputCampos.repeticoes}
              onChange={(e) => setInputCampos({ ...inputCampos, repeticoes: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Observações"
              value={inputCampos.observacoes}
              onChange={(e) => setInputCampos({ ...inputCampos, observacoes: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <button
            onClick={adicionarExercicio}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
          >
            Adicionar Exercício
          </button>
        </div>
      )}

      {exerciciosAdicionados.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Exercícios adicionados:</h3>
          {exerciciosAdicionados.map((ex, index) => (
            <div key={`${ex.id_exercicio}-${index}`} className="mb-2 p-3 border bg-white rounded shadow">
              <div className="flex justify-between items-center">
                <span>
                  <strong>{ex.nome}</strong> - {ex.series} séries de {ex.repeticoes}
                  {ex.observacoes && ` (${ex.observacoes})`}
                </span>
                <button
                  onClick={() => removerExercicio(index)}
                  className="text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mensagemSucesso && (
        <div className="text-green-600 font-medium text-sm mb-4 transition-opacity duration-500 ease-in-out">
          ✅ Treino adicionado com sucesso!
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={salvarTreino}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded"
        >
          Salvar Treino
        </button>
      </div>
    </div>
  );
}
