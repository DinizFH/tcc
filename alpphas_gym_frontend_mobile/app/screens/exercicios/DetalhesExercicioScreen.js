import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DetalhesExercicioScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const [exercicio, setExercicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const { userType } = useAuth();

  // === CARREGAR DETALHES ===
  useEffect(() => {
    async function carregarExercicio() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setTipoUsuario(perfilRes.data.tipo_usuario);

        const res = await api.get(`/exercicios/${id}`);
        setExercicio(res.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes do exercício:', err);
        Alert.alert('Erro', 'Falha ao carregar detalhes do exercício.');
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarExercicio();
  }, [id]);

  // === ABRIR VÍDEO ===
  const abrirVideo = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link do vídeo.');
      }
    } catch (err) {
      console.error('Erro ao abrir vídeo:', err);
      Alert.alert('Erro', 'Falha ao tentar abrir o vídeo.');
    }
  };

  // === EXCLUSÃO (somente personal/admin) ===
  const excluirExercicio = async () => {
    Alert.alert(
      'Excluir Exercício',
      'Deseja realmente excluir este exercício?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/exercicios/${id}`);
              Alert.alert('Sucesso', 'Exercício excluído com sucesso.');
              navigation.goBack();
            } catch (err) {
              console.error('Erro ao excluir exercício:', err);
              Alert.alert('Erro', 'Falha ao excluir exercício.');
            }
          },
        },
      ]
    );
  };

  // === UI ===
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

  if (!exercicio) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Exercício não encontrado.</Text>
      </View>
    );
  }

  const { nome, grupo_muscular, observacoes, video } = exercicio;

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Exercício</Text>
      </View>

      {/* CONTEÚDO */}
      <View style={styles.card}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>{nome || 'Não informado'}</Text>

        <Text style={styles.label}>Grupo Muscular:</Text>
        <Text style={styles.value}>{grupo_muscular || 'Não informado'}</Text>

        <Text style={styles.label}>Observações:</Text>
        <Text style={styles.value}>
          {observacoes || 'Nenhuma observação registrada.'}
        </Text>

        {video ? (
          <>
            <Text style={styles.label}>Vídeo Demonstrativo:</Text>
            <TouchableOpacity onPress={() => abrirVideo(video)}>
              <Text style={[styles.link, { color: '#2980B9' }]} numberOfLines={2}>
                {video}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.value, { fontStyle: 'italic' }]}>
            Nenhum vídeo associado.
          </Text>
        )}
      </View>

      {/* BOTÕES DE AÇÃO */}
      <View style={styles.actions}>
        {(tipoUsuario === 'personal' || tipoUsuario === 'admin') && (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#F1C40F' }]}
              onPress={() => navigation.navigate('EditarExercicioScreen', { id })}
            >
              <Icon name="edit" size={16} color="#fff" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#E74C3C' }]}
              onPress={excluirExercicio}
            >
              <Icon name="trash" size={16} color="#fff" />
              <Text style={styles.buttonText}>Excluir</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#144272' }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={16} color="#fff" />
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
    elevation: 3,
  },
  label: { fontSize: 15, color: '#144272', fontWeight: 'bold', marginTop: 8 },
  value: { fontSize: 15, color: '#333', marginTop: 2 },
  link: { fontSize: 15, color: '#2980B9', textDecorationLine: 'underline', marginTop: 2 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },
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
