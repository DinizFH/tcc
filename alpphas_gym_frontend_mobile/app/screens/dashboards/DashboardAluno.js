import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DashboardAluno({ navigation }) {
  const [nome, setNome] = useState('');
  const { logout } = useAuth();

  // === CARREGAR PERFIL DO ALUNO ===
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await api.get('/usuarios/perfil');
        setNome(res.data.nome || 'Aluno');
      } catch (err) {
        console.error('Erro ao carregar perfil do aluno:', err);
        Alert.alert('Erro', 'Falha ao carregar dados do aluno.');
      }
    }
    carregarPerfil();
  }, []);

  // === LOGOUT ===
  function handleLogout() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  }

  // === CARDS DISPONÍVEIS PARA O ALUNO ===
  const cards = [
    {
      title: 'Treinos',
      icon: 'dumbbell',
      color: '#FF6B00',
      screen: 'TreinosAluno',
    },
    {
      title: 'Nutrição',
      icon: 'apple-alt',
      color: '#2ECC71',
      screen: 'PlanosScreen',
    },
    {
      title: 'Progresso',
      icon: 'chart-line',
      color: '#8E44AD',
      screen: 'ProgressoAlunoScreen',
    },
    {
      title: 'Agendamentos',
      icon: 'calendar-alt',
      color: '#3498DB',
      screen: 'AgendamentosScreen',
    },
    {
      title: 'Registro de Treino',
      icon: 'clipboard-list',
      color: '#00BFFF',
      screen: 'RegistrosTreino', // ✅ vinculado corretamente
    },
  ];

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bemVindo}>Bem-vindo,</Text>
          <Text style={styles.nome}>{nome}</Text>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="sign-out-alt" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* FOTO / PERFIL */}
      <TouchableOpacity
        style={styles.perfilBox}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PerfilScreen')} // 🔗 LINK DIRETO PARA PERFIL
      >
        <Image
          source={require('../../../assets/alpphas_logo.png')}
          style={styles.avatar}
        />
        <Text style={styles.perfilTexto}>Ver Perfil</Text>
      </TouchableOpacity>

      {/* CARDS */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => card.screen && navigation.navigate(card.screen)}
          >
            <Icon name={card.icon} size={28} color={card.color} />
            <Text style={styles.cardText}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// === ESTILOS ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bemVindo: {
    color: '#fff',
    fontSize: 16,
  },
  nome: {
    color: '#00BFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#144272',
    padding: 10,
    borderRadius: 10,
  },
  perfilBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#00BFFF',
  },
  perfilTexto: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  card: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 10,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  cardText: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});
