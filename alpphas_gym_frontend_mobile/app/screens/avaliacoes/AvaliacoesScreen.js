import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useIsFocused } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AvaliacoesScreen({ navigation }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const isFocused = useIsFocused();
  const { userType } = useAuth();

  // === FUNÇÃO CENTRAL DE BUSCA ===
  const fetchAvaliacoes = useCallback(async () => {
    try {
      setLoading(true);
      const perfilRes = await api.get('/usuarios/perfil');
      setTipoUsuario(perfilRes.data.tipo_usuario);

      const res = await api.get('/avaliacoes/');
      setAvaliacoes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      Alert.alert('Erro', 'Falha ao carregar avaliações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // === CARREGAR AUTOMATICAMENTE AO ENTRAR ===
  useEffect(() => {
    if (isFocused) fetchAvaliacoes();
  }, [isFocused, fetchAvaliacoes]);

  // === PUXAR PARA RECARREGAR ===
  const onRefresh = () => {
    setRefreshing(true);
    fetchAvaliacoes();
  };

  // === EXCLUIR AVALIAÇÃO ===
  async function excluirAvaliacao(id) {
    Alert.alert(
      'Excluir Avaliação',
      'Tem certeza de que deseja excluir esta avaliação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/avaliacoes/${id}`);
              setAvaliacoes((prev) =>
                prev.filter((a) => a.id_avaliacao !== id)
              );
              Alert.alert('Sucesso', 'Avaliação excluída com sucesso.');
            } catch (err) {
              console.error('Erro ao excluir avaliação:', err);
              Alert.alert('Erro', 'Falha ao excluir avaliação.');
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
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando avaliações...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Avaliações Físicas</Text>

        {(tipoUsuario === 'personal' || tipoUsuario === 'nutricionista') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CriarAvaliacaoScreen')}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Nova</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTAGEM */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#144272']} />
        }
      >
        {avaliacoes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma avaliação encontrada.</Text>
        ) : (
          avaliacoes.map((a) => {
            const dataFormatada = a.data_avaliacao
              ? new Date(a.data_avaliacao).toLocaleDateString()
              : '--/--/----';

            const imcNum = Number(a.imc);
            const gorduraNum = Number(a.percentual_gordura);
            const magraNum = Number(a.massa_magra);
            const gordaNum = Number(a.massa_gorda);

            return (
              <View key={a.id_avaliacao} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>
                    {tipoUsuario === 'aluno'
                      ? `Profissional: ${a.nome_profissional || 'Indefinido'}`
                      : `Aluno: ${a.nome_aluno || 'Indefinido'}`}
                  </Text>

                  <Text style={styles.subText}>Data: {dataFormatada}</Text>

                  <Text style={styles.subText}>
                    IMC:{' '}
                    {isNaN(imcNum) || imcNum === 0
                      ? '--'
                      : imcNum.toFixed(2)}{' '}
                    | Gordura:{' '}
                    {isNaN(gorduraNum) || gorduraNum === 0
                      ? '--'
                      : gorduraNum.toFixed(1)}%
                  </Text>

                  <Text style={styles.subText}>
                    Magra:{' '}
                    {isNaN(magraNum) || magraNum === 0
                      ? '--'
                      : magraNum.toFixed(1)}{' '}
                    kg | Gorda:{' '}
                    {isNaN(gordaNum) || gordaNum === 0
                      ? '--'
                      : gordaNum.toFixed(1)}{' '}
                    kg
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#ccc' }]}
                    onPress={() =>
                      navigation.navigate('DetalhesAvaliacaoScreen', {
                        id: a.id_avaliacao,
                      })
                    }
                  >
                    <Text style={styles.buttonText}>Detalhes</Text>
                  </TouchableOpacity>

                  {(tipoUsuario === 'personal' ||
                    tipoUsuario === 'nutricionista') && (
                    <>
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#F1C40F' }]}
                        onPress={() =>
                          navigation.navigate('EditarAvaliacaoScreen', {
                            id: a.id_avaliacao,
                          })
                        }
                      >
                        <Text style={styles.buttonText}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#E74C3C' }]}
                        onPress={() => excluirAvaliacao(a.id_avaliacao)}
                      >
                        <Text style={styles.buttonText}>Excluir</Text>
                      </TouchableOpacity>
                    </>
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
