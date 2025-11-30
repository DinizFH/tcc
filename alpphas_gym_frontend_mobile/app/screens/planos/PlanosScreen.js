import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useIsFocused } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PlanosScreen({ navigation }) {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const isFocused = useIsFocused(); // 👈 detecta foco da tela

  const { userType } = useAuth();

  // === BUSCA PRINCIPAL ===
  const fetchPlanos = useCallback(async () => {
    try {
      setLoading(true);
      const perfilRes = await api.get('/usuarios/perfil');
      setTipoUsuario(perfilRes.data.tipo_usuario);

      const res = await api.get('/planos/');
      setPlanos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
      Alert.alert('Erro', 'Falha ao carregar planos alimentares.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // === RECARREGAR AUTOMATICAMENTE AO VOLTAR ===
  useEffect(() => {
    if (isFocused) {
      fetchPlanos();
    }
  }, [isFocused, fetchPlanos]);

  // === PUXAR PARA ATUALIZAR ===
  const onRefresh = () => {
    setRefreshing(true);
    fetchPlanos();
  };

  // === EXCLUIR PLANO ===
  const excluirPlano = async (id) => {
    Alert.alert(
      'Excluir Plano',
      'Tem certeza que deseja excluir este plano alimentar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/planos/${id}`);
              setPlanos((prev) => prev.filter((p) => p.id_plano !== id));
              Alert.alert('Sucesso', 'Plano excluído com sucesso.');
            } catch (err) {
              console.error('Erro ao excluir plano:', err);
              Alert.alert('Erro', 'Falha ao excluir o plano.');
            }
          },
        },
      ]
    );
  };

  // === LOADING ===
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando planos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Planos Alimentares</Text>

        {tipoUsuario === 'nutricionista' && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CriarPlanoScreen')}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTAGEM */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#144272']}
          />
        }
      >
        {planos.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum plano alimentar encontrado.</Text>
        ) : (
          planos.map((p) => (
            <View key={p.id_plano} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Aluno:</Text>
                <Text style={styles.value}>{p.nome_aluno || 'Não informado'}</Text>

                <Text style={styles.label}>Data:</Text>
                <Text style={styles.value}>
                  {new Date(p.data_criacao).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#3498db' }]}
                  onPress={() =>
                    navigation.navigate('VerPlanoAlimentarScreen', { id: p.id_plano })
                  }
                >
                  <Text style={styles.buttonText}>Ver</Text>
                </TouchableOpacity>

                {tipoUsuario === 'nutricionista' && (
                  <>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#F1C40F' }]}
                      onPress={() =>
                        navigation.navigate('EditarPlanoScreen', { id: p.id_plano })
                      }
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#E74C3C' }]}
                      onPress={() => excluirPlano(p.id_plano)}
                    >
                      <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// === ESTILOS ===
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
    fontSize: 15,
    color: '#144272',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
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
