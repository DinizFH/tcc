// app/screens/registros/RegistroTreinoService.js
import api from '../../services/api';

const RegistroTreinoService = {
  // LISTAGEM
  listarTodos: () => api.get('/registrostreino/').then(r => r.data),
  listarMeus: () => api.get('/registrostreino/meus').then(r => r.data),
  buscarPorAlunoNome: (nome) => api.get(`/registrostreino/aluno?nome=${encodeURIComponent(nome || '')}`).then(r => r.data),

  // CRUD
  buscarPorId: (id) => api.get(`/registrostreino/${id}`).then(r => r.data),
  criar: (dados) => api.post('/registrostreino/', dados).then(r => r.data),
  atualizar: (id, dados) => api.put(`/registrostreino/${id}`, dados).then(r => r.data),
  excluir: (id) => api.delete(`/registrostreino/${id}`).then(r => r.data),

  // AUXILIARES
  ultimaCarga: ({ id_exercicio, id_treino, id_aluno }) =>
    api.get(`/registrostreino/ultima-carga/${id_exercicio}`, {
      params: { id_treino, id_aluno }
    }).then(r => r.data),

  planosDoAluno: (id_aluno) =>
    api.get(`/treinos/aluno/${id_aluno}/planos`).then(r => Array.isArray(r.data) ? r.data : (r.data?.planos || [])),

  detalhesPlano: (id_plano) =>
    api.get(`/treinos/plano/${id_plano}/detalhes`).then(r => r.data?.plano || {}),

  // opcional: se existir no backend
  detalhesTreino: (id_treino) =>
    api.get(`/treinos/${id_treino}`).then(r => r.data),
};

export default RegistroTreinoService;
