import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DashboardAdmin({ navigation }) {
  const [stats, setStats] = useState({
    alunos: 0,
    personal: 0,
    nutricionista: 0,
    treinos: 0,
    planos: 0,
    agendamentos: 0,
    avaliacoes: 0,
    exercicios: 0,
  });
  const [nome, setNome] = useState('');
  const { logout } = useAuth(); // ✅ contexto global de autenticação

  useEffect(() => {
    async function carregarDados() {
      try {
        const perfil = await api.get('/usuarios/perfil');
        setNome(perfil.data.nome || 'Administrador');

        const res = await api.get('/admin/estatisticas');
        setStats(res.data || {});
      } catch (err) {
        console.error('Erro ao carregar estatísticas do admin:', err);
        Alert.alert('Erro', 'Falha ao carregar dados do administrador.');
      }
    }
    carregarDados();
  }, []);

  // ✅ botão de logout funcional para Web + Mobile
  async function handleLogout() {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('Deseja realmente sair do sistema?');
      if (confirmar) {
        try {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } catch (err) {
          console.error('Erro ao sair:', err);
          alert('Falha ao encerrar sessão.');
        }
      }
    } else {
      Alert.alert('Sair', 'Deseja realmente sair?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (err) {
              console.error('Erro ao sair:', err);
              Alert.alert('Erro', 'Falha ao encerrar sessão.');
            }
          },
        },
      ]);
    }
  }

  const cards = [
    { label: 'Alunos', valor: stats.alunos, icon: 'user-graduate' },
    { label: 'Personais', valor: stats.personal, icon: 'user-tie' },
    { label: 'Nutricionistas', valor: stats.nutricionista, icon: 'user-md' },
    { label: 'Treinos', valor: stats.treinos, icon: 'dumbbell' },
    { label: 'Exercícios', valor: stats.exercicios, icon: 'running' },
    { label: 'Planos Alimentares', valor: stats.planos, icon: 'apple-alt' },
    { label: 'Agendamentos', valor: stats.agendamentos, icon: 'calendar-alt' },
    { label: 'Avaliações Físicas', valor: stats.avaliacoes, icon: 'heartbeat' },
  ];

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={styles.bemVindo}>Bem-vindo,</Text>
          <Text style={styles.nome}>{nome}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Icon name="sign-out-alt" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Perfil */}
      <View style={styles.perfilBox}>
        <Image
          source={require('../../../assets/alpphas_logo.png')}
          style={styles.avatar}
        />
        <Text style={styles.perfilTexto}>Administrador do Sistema</Text>
      </View>

      {/* Cards */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((card, index) => (
          <View key={index} style={styles.card}>
            <Icon name={card.icon} size={30} color="#007BFF" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardValue}>{card.valor ?? 0}</Text>
            </View>
          </View>
        ))}

        {/* Logs do sistema */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#fff' }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LogsAdmin')}
        >
          <Icon name="clipboard-list" size={30} color="#007BFF" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardLabel}>Logs do Sistema</Text>
            <Text style={[styles.cardValue, { color: '#007BFF', fontSize: 15 }]}>
              Ver logs
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

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
  bemVindo: { color: '#fff', fontSize: 16 },
  nome: { color: '#00BFFF', fontSize: 20, fontWeight: 'bold' },
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
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 10,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
  },
  cardInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#144272',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardValue: {
    color: '#007BFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
