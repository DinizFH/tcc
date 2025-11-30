import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// === Telas de autenticação ===
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// === Dashboards ===
import DashboardAdmin from '../screens/dashboards/DashboardAdmin';
import DashboardAluno from '../screens/dashboards/DashboardAluno';
import DashboardNutricionista from '../screens/dashboards/DashboardNutricionista';
import DashboardPersonal from '../screens/dashboards/DashboardPersonal';

// === Perfil ===
import PerfilScreen from '../screens/perfil/PerfilScreen';

// === Telas administrativas ===
import BackupsAdmin from '../screens/admin/BackupsAdmin';
import ConfigAdmin from '../screens/admin/ConfigAdmin';
import EstatisticasAdmin from '../screens/admin/EstatisticasAdmin';
import LogsAdmin from '../screens/admin/LogsAdmin';
import UsuariosAdmin from '../screens/admin/UsuariosAdmin';

// === Agendamentos ===
import AgendamentosScreen from '../screens/agendamentos/AgendamentosScreen';
import CriarAgendamentoScreen from '../screens/agendamentos/CriarAgendamentoScreen';
import DetalhesAgendamentoScreen from '../screens/agendamentos/DetalhesAgendamentoScreen';

// === Avaliações Físicas ===
import AvaliacoesScreen from '../screens/avaliacoes/AvaliacoesScreen';
import CriarAvaliacaoScreen from '../screens/avaliacoes/CriarAvaliacaoScreen';
import DetalhesAvaliacaoScreen from '../screens/avaliacoes/DetalhesAvaliacaoScreen';
import EditarAvaliacaoScreen from '../screens/avaliacoes/EditarAvaliacaoScreen';

// === Exercícios ===
import CriarExercicioScreen from '../screens/exercicios/CriarExercicioScreen';
import DetalhesExercicioScreen from '../screens/exercicios/DetalhesExercicioScreen';
import EditarExercicioScreen from '../screens/exercicios/EditarExercicioScreen';
import ExerciciosScreen from '../screens/exercicios/ExerciciosScreen';

// === Planos Alimentares ===
import CriarPlanoScreen from '../screens/planos/CriarPlanoScreen';
import EditarPlanoScreen from '../screens/planos/EditarPlanoScreen';
import PlanosScreen from '../screens/planos/PlanosScreen';
import VerPlanoAlimentarScreen from '../screens/planos/VerPlanoAlimentarScreen';

// === Progresso ===
import ProgressoAlunoScreen from '../screens/progresso/ProgressoAlunoScreen';
import ProgressoGeralScreen from '../screens/progresso/ProgressoGeralScreen';

// === Treinos ===
import CriarTreinoScreen from '../screens/treinos/CriarTreinoScreen';
import DetalhesPlanoTreinoScreen from '../screens/treinos/DetalhesPlanoTreinoScreen';
import DetalhesTreinoAlunoScreen from '../screens/treinos/DetalhesTreinoAlunoScreen';
import EditarTreinoScreen from '../screens/treinos/EditarTreinoScreen';
import TreinosAlunoScreen from '../screens/treinos/TreinosAlunoScreen';
import TreinosScreen from '../screens/treinos/TreinosScreen';

// === Registros de Treino ===
import CriarRegistroTreinoScreen from '../screens/registros/CriarRegistroTreinoScreen';
import DetalhesRegistroTreinoScreen from '../screens/registros/DetalhesRegistroTreinoScreen';
import EditarRegistroTreinoScreen from '../screens/registros/EditarRegistroTreinoScreen';
import RegistrosTreinoScreen from '../screens/registros/RegistrosTreinoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, userType, loading } = useAuth();

  // === Tela global de carregamento ===
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0A2647',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // === Seleciona dashboard conforme tipo de usuário ===
  const getDashboard = () => {
    switch (userType) {
      case 'personal':
        return DashboardPersonal;
      case 'nutricionista':
        return DashboardNutricionista;
      case 'admin':
        return DashboardAdmin;
      default:
        return DashboardAluno;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          {/* ===================== */}
          {/* DASHBOARDS PRINCIPAIS */}
          {/* ===================== */}
          <Stack.Screen name="Dashboard" component={getDashboard()} />

          {/* ===================== */}
          {/* PERFIL */}
          {/* ===================== */}
          <Stack.Screen
            name="PerfilScreen"
            component={PerfilScreen}
            options={{ title: 'Meu Perfil' }}
          />

          {/* ===================== */}
          {/* ADMINISTRATIVO */}
          {/* ===================== */}
          <Stack.Screen name="UsuariosAdmin" component={UsuariosAdmin} />
          <Stack.Screen name="EstatisticasAdmin" component={EstatisticasAdmin} />
          <Stack.Screen name="BackupsAdmin" component={BackupsAdmin} />
          <Stack.Screen name="ConfigAdmin" component={ConfigAdmin} />
          <Stack.Screen name="LogsAdmin" component={LogsAdmin} />

          {/* ===================== */}
          {/* AGENDAMENTOS */}
          {/* ===================== */}
          <Stack.Screen name="AgendamentosScreen" component={AgendamentosScreen} />
          <Stack.Screen name="CriarAgendamentoScreen" component={CriarAgendamentoScreen} />
          <Stack.Screen name="DetalhesAgendamentoScreen" component={DetalhesAgendamentoScreen} />

          {/* ===================== */}
          {/* AVALIAÇÕES FÍSICAS */}
          {/* ===================== */}
          <Stack.Screen name="AvaliacoesScreen" component={AvaliacoesScreen} />
          <Stack.Screen name="CriarAvaliacaoScreen" component={CriarAvaliacaoScreen} />
          <Stack.Screen name="EditarAvaliacaoScreen" component={EditarAvaliacaoScreen} />
          <Stack.Screen name="DetalhesAvaliacaoScreen" component={DetalhesAvaliacaoScreen} />

          {/* ===================== */}
          {/* EXERCÍCIOS */}
          {/* ===================== */}
          <Stack.Screen name="ExerciciosScreen" component={ExerciciosScreen} />
          <Stack.Screen name="CriarExercicioScreen" component={CriarExercicioScreen} />
          <Stack.Screen name="EditarExercicioScreen" component={EditarExercicioScreen} />
          <Stack.Screen name="DetalhesExercicioScreen" component={DetalhesExercicioScreen} />

          {/* ===================== */}
          {/* PLANOS ALIMENTARES */}
          {/* ===================== */}
          <Stack.Screen name="PlanosScreen" component={PlanosScreen} />
          <Stack.Screen name="CriarPlanoScreen" component={CriarPlanoScreen} />
          <Stack.Screen name="EditarPlanoScreen" component={EditarPlanoScreen} />
          <Stack.Screen name="VerPlanoAlimentarScreen" component={VerPlanoAlimentarScreen} />

          {/* ===================== */}
          {/* PROGRESSO */}
          {/* ===================== */}
          <Stack.Screen name="ProgressoAlunoScreen" component={ProgressoAlunoScreen} />
          <Stack.Screen name="ProgressoGeralScreen" component={ProgressoGeralScreen} />

          {/* ===================== */}
          {/* TREINOS */}
          {/* ===================== */}
          <Stack.Screen name="Treinos" component={TreinosScreen} />
          <Stack.Screen name="DetalhesPlanoTreino" component={DetalhesPlanoTreinoScreen} />
          <Stack.Screen name="CriarTreino" component={CriarTreinoScreen} />
          <Stack.Screen name="EditarTreino" component={EditarTreinoScreen} />
          <Stack.Screen name="TreinosAluno" component={TreinosAlunoScreen} />
          <Stack.Screen name="DetalhesTreinoAluno" component={DetalhesTreinoAlunoScreen} />

          {/* ===================== */}
          {/* REGISTROS DE TREINO */}
          {/* ===================== */}
          <Stack.Screen name="RegistrosTreino" component={RegistrosTreinoScreen} />
          <Stack.Screen name="CriarRegistroTreino" component={CriarRegistroTreinoScreen} />
          <Stack.Screen name="DetalhesRegistroTreino" component={DetalhesRegistroTreinoScreen} />
          <Stack.Screen name="EditarRegistroTreino" component={EditarRegistroTreinoScreen} />
        </>
      ) : (
        <>
          {/* ===================== */}
          {/* AUTENTICAÇÃO */}
          {/* ===================== */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
