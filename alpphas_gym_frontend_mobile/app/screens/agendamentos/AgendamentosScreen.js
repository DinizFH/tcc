import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

export default function AgendamentosScreen({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused(); 
  const { userType } = useAuth();

  // === FUNÇÃO CENTRAL DE CARREGAMENTO ===
  const fetchDados = useCallback(async () => {
    try {
      setLoading(true);
      const perfilRes = await api.get('/usuarios/perfil');
      setTipoUsuario(perfilRes.data.tipo_usuario);

      const agRes = await api.get('/agendamentos/');
      setAgendamentos(Array.isArray(agRes.data) ? agRes.data : []);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      Alert.alert('Erro', 'Falha ao carregar agendamentos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // === CARREGAR QUANDO ENTRA NA TELA ===
  useEffect(() => {
    if (isFocused) {
      fetchDados(); //  atualiza automaticamente ao voltar da tela de criação
    }
  }, [isFocused, fetchDados]);

  // === PUXAR PARA RECARREGAR ===
  const onRefresh = () => {
    setRefreshing(true);
    fetchDados();
  };

  // === CANCELAR ===
  async function confirmarCancelamento(agendamento) {
    Alert.alert(
      'Cancelar Agendamento',
      'Deseja realmente cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/agendamentos/${agendamento.id_agendamento}`);
              setAgendamentos((prev) =>
                prev.map((a) =>
                  a.id_agendamento === agendamento.id_agendamento
                    ? { ...a, status: 'cancelado' }
                    : a
                )
              );
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso.');
            } catch (err) {
              console.error('Erro ao cancelar:', err);
              Alert.alert('Erro', 'Falha ao cancelar agendamento.');
            }
          },
        },
      ]
    );
  }

  // === CONCLUIR ===
  async function confirmarConclusao(agendamento) {
    Alert.alert(
      'Concluir Agendamento',
      'Deseja marcar este agendamento como concluído?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await api.put(`/agendamentos/${agendamento.id_agendamento}`, {
                status: 'concluído',
              });
              setAgendamentos((prev) =>
                prev.map((a) =>
                  a.id_agendamento === agendamento.id_agendamento
                    ? { ...a, status: 'concluído' }
                    : a
                )
              );
              Alert.alert('Sucesso', 'Agendamento concluído com sucesso.');
            } catch (err) {
              console.error('Erro ao concluir:', err);
              Alert.alert('Erro', 'Falha ao concluir agendamento.');
            }
          },
        },
      ]
    );
  }

  // === EXIBIÇÃO ===
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Meus Agendamentos</Text>

        {(tipoUsuario === 'personal' || tipoUsuario === 'nutricionista') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CriarAgendamentoScreen')}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA DE AGENDAMENTOS */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#144272']} />
        }
      >
        {agendamentos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
        ) : (
          agendamentos.map((agendamento) => {
            const status = agendamento.status || 'indefinido';
            const statusColor =
              status === 'cancelado'
                ? '#E74C3C'
                : status === 'concluído'
                ? '#2980B9'
                : '#27AE60';

            return (
              <View key={agendamento.id_agendamento} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>
                    {tipoUsuario === 'aluno'
                      ? `Profissional: ${agendamento.nome_profissional || 'Indefinido'}`
                      : `Aluno: ${agendamento.nome_aluno || 'Indefinido'}`}
                  </Text>

                  <Text style={styles.subText}>
                    Tipo: {agendamento.tipo_agendamento || 'Não especificado'}
                  </Text>
                  <Text style={styles.subText}>
                    {new Date(agendamento.data_hora_inicio).toLocaleString()} até{' '}
                    {new Date(agendamento.data_hora_fim).toLocaleTimeString()}
                  </Text>
                  <Text style={[styles.status, { color: statusColor }]}>
                    {status.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#ccc' }]}
                    onPress={() =>
                      navigation.navigate('DetalhesAgendamentoScreen', {
                        id: agendamento.id_agendamento,
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Detalhes</Text>
                  </TouchableOpacity>

                  {(tipoUsuario === 'personal' || tipoUsuario === 'nutricionista') &&
                    (status === 'marcado' || status === 'remarcado') && (
                      <>
                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: '#F1C40F' }]}
                          onPress={() =>
                            navigation.navigate('CriarAgendamentoScreen', {
                              id: agendamento.id_agendamento,
                            })
                          }
                        >
                          <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.button, { backgroundColor: '#2980B9' }]}
                          onPress={() => confirmarConclusao(agendamento)}
                        >
                          <Text style={styles.buttonText}>Concluir</Text>
                        </TouchableOpacity>
                      </>
                    )}

                  {(status === 'marcado' || status === 'remarcado') && (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#E74C3C' }]}
                      onPress={() => confirmarCancelamento(agendamento)}
                    >
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F7',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A2647',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0A2647',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2647',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 6,
    marginBottom: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
