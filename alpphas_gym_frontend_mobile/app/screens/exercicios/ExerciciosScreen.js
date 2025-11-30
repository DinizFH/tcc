import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ExerciciosScreen({ navigation }) {
  const [exercicios, setExercicios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);

  const { userType } = useAuth();

  // === BUSCAR EXERCÍCIOS ===
  async function carregarExercicios() {
    try {
      setLoading(true);
      const perfilRes = await api.get('/usuarios/perfil');
      setTipoUsuario(perfilRes.data.tipo_usuario);

      const res = await api.get('/exercicios/');
      setExercicios(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erro ao carregar exercícios:', err);
      Alert.alert('Erro', 'Falha ao carregar lista de exercícios.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarExercicios();
  }, []);

  // === FILTRAR CONFORME DIGITA ===
  const exerciciosFiltrados = exercicios.filter((ex) =>
    ex.nome?.toLowerCase().includes(filtro.toLowerCase())
  );

  // === FUNÇÃO DE EXCLUSÃO ===
  async function excluirExercicio(id) {
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
              setExercicios((prev) => prev.filter((e) => e.id_exercicio !== id));
              Alert.alert('Sucesso', 'Exercício excluído com sucesso!');
            } catch (err) {
              console.error('Erro ao excluir exercício:', err);
              Alert.alert('Erro', 'Falha ao excluir exercício.');
            }
          },
        },
      ]
    );
  }

  // === UI ===
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando exercícios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.title}>Exercícios</Text>

        {(tipoUsuario === 'personal' || tipoUsuario === 'admin') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CriarExercicioScreen')}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CAMPO DE BUSCA */}
      <TextInput
        style={styles.input}
        placeholder="Buscar exercício..."
        placeholderTextColor="#aaa"
        value={filtro}
        onChangeText={(text) => setFiltro(text)}
      />

      {/* LISTAGEM */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {exerciciosFiltrados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum exercício encontrado.</Text>
        ) : (
          exerciciosFiltrados.map((ex) => (
            <View key={ex.id_exercicio} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{ex.nome}</Text>
                <Text style={styles.subText}>Grupo: {ex.grupo_muscular || '---'}</Text>
                <Text style={styles.subText}>
                  Observações: {ex.observacoes || 'Nenhuma'}
                </Text>
              </View>

              <View style={styles.actions}>
                {ex.video && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setVideoUrl(ex.video)}
                  >
                    <Icon name="video" size={18} color="#fff" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#ccc' }]}
                  onPress={() =>
                    navigation.navigate('DetalhesExercicioScreen', { id: ex.id_exercicio })
                  }
                >
                  <Text style={styles.buttonText}>Detalhes</Text>
                </TouchableOpacity>

                {(tipoUsuario === 'personal' || tipoUsuario === 'admin') && (
                  <>
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#F1C40F' }]}
                      onPress={() =>
                        navigation.navigate('EditarExercicioScreen', { id: ex.id_exercicio })
                      }
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#E74C3C' }]}
                      onPress={() => excluirExercicio(ex.id_exercicio)}
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

      {/* MODAL DE VÍDEO */}
      <Modal visible={!!videoUrl} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVideoUrl(null)}
            >
              <Icon name="times" size={22} color="#fff" />
            </TouchableOpacity>

            <WebView
              source={{ uri: videoUrl }}
              style={{ flex: 1, borderRadius: 12 }}
              allowsFullscreenVideo
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  scrollContainer: {
    paddingBottom: 80,
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
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 6,
    marginBottom: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2980B9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '60%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },
});
