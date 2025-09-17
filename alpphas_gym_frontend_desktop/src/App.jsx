import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

/* Dashboards */
import DashboardAluno from "./pages/Dashboard/DashboardAluno";
import DashboardPersonal from "./pages/Dashboard/DashboardPersonal";
import DashboardNutricionista from "./pages/Dashboard/DashboardNutricionista";
import CompletarPerfil from "./pages/Perfil/CompletarPerfil";

/* Agendamentos */
import AgendamentosScreen from "./pages/Agendamentos/AgendamentosScreen";
import AgendamentosAluno from "./pages/Agendamentos/AgendamentosAluno";
import CriarAgendamento from "./pages/Agendamentos/CriarAgendamento";
import DetalhesAgendamento from "./pages/Agendamentos/DetalhesAgendamento";

/* Avaliações */
import AvaliacoesScreen from "./pages/Avaliacoes/AvaliacoesScreen";
import CriarAvaliacao from "./pages/Avaliacoes/CriarAvaliacao";
import EditarAvaliacao from "./pages/Avaliacoes/EditarAvaliacao";
import DetalhesAvaliacao from "./pages/Avaliacoes/DetalhesAvaliacao";

/* Progresso */
import ProgressoScreen from "./pages/Progresso/ProgressoScreen";
import ProgressoScreenAluno from "./pages/Progresso/ProgressoScreenAluno";

/* Treinos */
import TreinosScreen from "./pages/Treinos/TreinosScreen";
import CriarTreino from "./pages/Treinos/CriarTreino";
import EditarPlanoTreino from "./pages/Treinos/EditarPlanoTreino";
import EditarTreinoIndividual from "./pages/Treinos/EditarTreinoIndividual";
import AdicionarTreinoPlano from "./pages/Treinos/AdicionarTreinoAoPlano";
import DetalhesPlanoTreino from "./pages/Treinos/DetalhesPlanoTreino"; // Personal
import DetalhesTreinoAluno from "./pages/Treinos/DetalhesTreinoAluno"; // Aluno

/* Exercícios */
import ExerciciosScreen from "./pages/Exercicios/ExerciciosScreen";
import CriarExercicio from "./pages/Exercicios/CriarExercicio";
import EditarExercicio from "./pages/Exercicios/EditarExercicio";
import DetalhesExercicio from "./pages/Exercicios/DetalhesExercicio";

/* Registros de Treino */
import RegistrosTreinoScreen from "./pages/RegistrosTreino/RegistrosTreinoScreen";
import CriarRegistroTreino from "./pages/RegistrosTreino/CriarRegistroTreino";
import EditarRegistroTreino from "./pages/RegistrosTreino/EditarRegistroTreino";
import DetalhesRegistroTreino from "./pages/RegistrosTreino/DetalhesRegistroTreino";

/* Componentes */
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

/* Planos Alimentares */
import CriarPlano from "./pages/PlanosAlimentares/CriarPlano";
import PlanosScreen from "./pages/PlanosAlimentares/PlanosScreen";
import VerPlanoAlimentar from "./pages/PlanosAlimentares/VerPlanoAlimentar";
import EditarPlano from "./pages/PlanosAlimentares/EditarPlano";

/* Administrador */
import DashboardAdmin from "./pages/Administrador/DashboardAdmin";
import LogsAdmin from "./pages/Administrador/LogsAdmin";
import UsuariosAdmin from "./pages/Administrador/UsuariosAdmin";
import EstatisticasAdmin from "./pages/Administrador/EstatisticasAdmin";
import BackupsAdmin from "./pages/Administrador/BackupsAdmin";
import ConfigAdmin from "./pages/Administrador/ConfigAdmin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards */}
      <Route path="/dashboard/aluno" element={<PrivateRoute><DashboardAluno /></PrivateRoute>} />
      <Route path="/dashboard/personal" element={<PrivateRoute><DashboardPersonal /></PrivateRoute>} />
      <Route path="/dashboard/nutricionista" element={<PrivateRoute><DashboardNutricionista /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute><DashboardAdmin /></PrivateRoute>} />
      <Route path="/admin/logs" element={<PrivateRoute><LogsAdmin /></PrivateRoute>} />
      <Route path="/admin/usuarios" element={<PrivateRoute><UsuariosAdmin /></PrivateRoute>} />
      <Route path="/admin/estatisticas" element={<PrivateRoute><EstatisticasAdmin /></PrivateRoute>} />
      <Route path="/admin/backups" element={<PrivateRoute><BackupsAdmin /></PrivateRoute>} />
      <Route path="/admin/config" element={<PrivateRoute><ConfigAdmin /></PrivateRoute>} />

      {/* Perfil */}
      <Route path="/completar-perfil" element={<PrivateRoute><CompletarPerfil /></PrivateRoute>} />

      {/* Agendamentos */}
      <Route path="/agendamentos" element={<PrivateRoute><AgendamentosScreen /></PrivateRoute>} />
      <Route path="/agendamentos-aluno" element={<PrivateRoute><AgendamentosAluno /></PrivateRoute>} />
      <Route path="/agendamentos/novo" element={<PrivateRoute><CriarAgendamento /></PrivateRoute>} />
      <Route path="/agendamentos/:id" element={<PrivateRoute><DetalhesAgendamento /></PrivateRoute>} />
      <Route path="/agendamentos/:id/editar" element={<PrivateRoute><CriarAgendamento isEditMode={true} /></PrivateRoute>} />

      {/* Avaliações */}
      <Route path="/avaliacoes" element={<PrivateRoute><AvaliacoesScreen /></PrivateRoute>} />
      <Route path="/avaliacoes/nova" element={<PrivateRoute><CriarAvaliacao /></PrivateRoute>} />
      <Route path="/avaliacoes/:id" element={<PrivateRoute><DetalhesAvaliacao /></PrivateRoute>} />
      <Route path="/avaliacoes/:id/editar" element={<PrivateRoute><EditarAvaliacao /></PrivateRoute>} />

      {/* Progresso */}
      <Route path="/progresso" element={<PrivateRoute><ProgressoScreen /></PrivateRoute>} />
      <Route path="/progresso/aluno" element={<PrivateRoute><ProgressoScreenAluno /></PrivateRoute>} />

      {/* Treinos */}
      <Route path="/treinos" element={<PrivateRoute><TreinosScreen /></PrivateRoute>} />
      <Route path="/treinos/novo" element={<PrivateRoute><CriarTreino /></PrivateRoute>} />
      <Route path="/treinos/plano/:id" element={<PrivateRoute><DetalhesPlanoTreino /></PrivateRoute>} /> 
      <Route path="/treinos/plano/:id/detalhes" element={<PrivateRoute><DetalhesTreinoAluno /></PrivateRoute>} />
      <Route path="/treinos/editar-plano/:alunoId" element={<PrivateRoute><EditarPlanoTreino /></PrivateRoute>} />
      <Route path="/treinos/:id/editar" element={<PrivateRoute><EditarTreinoIndividual /></PrivateRoute>}/>
      <Route path="/treinos/plano/:id_plano/novo-treino" element={<PrivateRoute><AdicionarTreinoPlano /></PrivateRoute>} />

      {/* Exercícios */}
      <Route path="/exercicios" element={<PrivateRoute><ExerciciosScreen /></PrivateRoute>} />
      <Route path="/exercicios/novo" element={<PrivateRoute><CriarExercicio /></PrivateRoute>} />
      <Route path="/exercicios/:id" element={<PrivateRoute><DetalhesExercicio /></PrivateRoute>} />
      <Route path="/exercicios/editar/:id" element={<PrivateRoute><EditarExercicio /></PrivateRoute>} />

      {/* Registros de Treino */}
      <Route path="/registrostreino" element={<PrivateRoute><Layout><RegistrosTreinoScreen /></Layout></PrivateRoute>} />
      <Route path="/registrostreino/novo" element={<PrivateRoute><Layout><CriarRegistroTreino /></Layout></PrivateRoute>} />
      <Route path="/registrostreino/:id" element={<PrivateRoute><Layout><DetalhesRegistroTreino /></Layout></PrivateRoute>} />
      <Route path="/registrostreino/:id/editar" element={<PrivateRoute><Layout><EditarRegistroTreino /></Layout></PrivateRoute>} />

      {/* Planos Alimentares */}
      <Route path="/planos/criar" element={<PrivateRoute><CriarPlano /></PrivateRoute>}/>
      <Route path="/planos/criar/:idAluno" element={<PrivateRoute><CriarPlano /></PrivateRoute>}/>
      <Route path="/planos" element={<PlanosScreen />} />
      <Route path="/planos/:id" element={<VerPlanoAlimentar />} />
      <Route path="/planos/:id/editar" element={<EditarPlano />} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
