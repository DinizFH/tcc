import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DetalhesAgendamentoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const [agendamento, setAgendamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('');

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        // 🔹 Busca perfil para saber tipo do usuário logado
        const perfilRes = await api.get('/usuarios/perfil');
        setTipoUsuario(perfilRes.data.tipo_usuario);

        // 🔹 Busca detalhes do agendamento
        const res = await api.get(`/agendamentos/${id}`);
        setAgendamento(res.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os detalhes do agendamento.'
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarDetalhes();
  }, [id]);

  async function cancelarAgendamento() {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza de que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/agendamentos/${id}`);
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso.');
              navigation.goBack();
            } catch (err) {
              console.error('Erro ao cancelar:', err);
              Alert.alert('Erro', 'Falha ao cancelar agendamento.');
            }
          },
        },
      ]
    );
  }

  async function concluirAgendamento() {
    Alert.alert(
      'Concluir Agendamento',
      'Deseja marcar este agendamento como concluído?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await api.put(`/agendamentos/${id}`, { status: 'concluído' });
              Alert.alert('Sucesso', 'Agendamento marcado como concluído.');
              navigation.goBack();
            } catch (err) {
              console.error('Erro ao concluir:', err);
              Alert.alert('Erro', 'Falha ao concluir agendamento.');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando detalhes...
        </Text>
      </View>
    );
  }

  if (!agendamento) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Agendamento não encontrado.</Text>
      </View>
    );
  }

  const status = agendamento.status || 'indefinido';
  const statusColor =
    status === 'cancelado'
      ? '#E74C3C'
      : status === 'concluído'
      ? '#2980B9'
      : '#27AE60';

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Agendamento</Text>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.card}>
        <Text style={styles.label}>Aluno:</Text>
        <Text style={styles.value}>
          {agendamento.nome_aluno || 'Não informado'}
        </Text>

        <Text style={styles.label}>Profissional:</Text>
        <Text style={styles.value}>
          {agendamento.nome_profissional || 'Não informado'}
        </Text>

        <Text style={styles.label}>Tipo:</Text>
        <Text style={styles.value}>
          {agendamento.tipo_agendamento || 'Não especificado'}
        </Text>

        <Text style={styles.label}>Data e Hora:</Text>
        <Text style={styles.value}>
          {new Date(agendamento.data_hora_inicio).toLocaleString()} até{' '}
          {new Date(agendamento.data_hora_fim).toLocaleTimeString()}
        </Text>

        <Text style={styles.label}>Status:</Text>
        <Text
          style={[styles.value, { color: statusColor, fontWeight: 'bold' }]}
        >
          {status.toUpperCase()}
        </Text>

        {agendamento.observacoes && (
          <>
            <Text style={styles.label}>Observações:</Text>
            <Text style={styles.value}>{agendamento.observacoes}</Text>
          </>
        )}
      </View>

      {/* BOTÕES DE AÇÃO */}
      <View style={styles.actions}>
        {/* === Cancelar (permitido a todos enquanto marcado) === */}
        {(status === 'marcado' || status === 'remarcado') && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#E74C3C' }]}
            onPress={cancelarAgendamento}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* === Concluir (apenas personal e nutricionista) === */}
        {(tipoUsuario === 'personal' || tipoUsuario === 'nutricionista') &&
          (status === 'marcado' || status === 'remarcado') && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2980B9' }]}
              onPress={concluirAgendamento}
            >
              <Text style={styles.buttonText}>Concluir</Text>
            </TouchableOpacity>
          )}

        {/* === Voltar === */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#7F8C8D' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 4,
  },
  label: {
    fontSize: 15,
    color: '#144272',
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: '#333',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
