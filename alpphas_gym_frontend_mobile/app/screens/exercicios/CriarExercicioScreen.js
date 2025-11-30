import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function CriarExercicioScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [dados, setDados] = useState({
    nome: '',
    grupo_muscular: '',
    observacoes: '',
    video: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // === CARREGAR PERFIL ===
  useEffect(() => {
    async function carregarPerfil() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setPerfil(perfilRes.data);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        Alert.alert('Erro', 'Falha ao carregar perfil do usuário.');
      } finally {
        setLoadingInit(false);
      }
    }
    carregarPerfil();
  }, []);

  // === ATUALIZA CAMPOS ===
  const handleChange = (key, value) => {
    setDados((prev) => ({ ...prev, [key]: value }));
  };

  // === SALVAR EXERCÍCIO ===
  async function handleSalvar() {
    if (!dados.nome || !dados.grupo_muscular) {
      Alert.alert('Atenção', 'Preencha o nome e o grupo muscular.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nome: dados.nome.trim(),
        grupo_muscular: dados.grupo_muscular.trim(),
        observacoes: dados.observacoes.trim() || null,
        video: dados.video.trim() || null,
      };

      const res = await api.post('/exercicios/', payload);

      if (res.status === 201 || res.status === 200) {
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Não foi possível criar o exercício.');
      }
    } catch (err) {
      console.error('Erro ao criar exercício:', err);
      Alert.alert('Erro', 'Falha ao salvar exercício.');
    } finally {
      setLoading(false);
    }
  }

  // === UI ===
  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando informações...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Novo Exercício</Text>

          {/* NOME */}
          <Text style={styles.label}>Nome do Exercício</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Supino Reto"
            placeholderTextColor="#888"
            value={dados.nome}
            onChangeText={(v) => handleChange('nome', v)}
          />

          {/* GRUPO MUSCULAR */}
          <Text style={styles.label}>Grupo Muscular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Peito"
            placeholderTextColor="#888"
            value={dados.grupo_muscular}
            onChangeText={(v) => handleChange('grupo_muscular', v)}
          />

          {/* OBSERVAÇÕES */}
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Instruções ou cuidados..."
            placeholderTextColor="#888"
            multiline
            value={dados.observacoes}
            onChangeText={(v) => handleChange('observacoes', v)}
          />

          {/* VÍDEO */}
          <Text style={styles.label}>Link do Vídeo (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/..."
            placeholderTextColor="#888"
            value={dados.video}
            onChangeText={(v) => handleChange('video', v)}
          />

          {/* BOTÕES */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check" size={18} color="#fff" />
                <Text style={styles.buttonText}>Salvar Exercício</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={16} color="#144272" />
            <Text style={styles.cancelText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A2647',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#144272', marginBottom: 20 },
  label: { color: '#144272', fontWeight: '600', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#000',
    width: '100%',
    marginBottom: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginLeft: 8 },
  cancelButton: { flexDirection: 'row', alignItems: 'center', marginTop: 18, alignSelf: 'center' },
  cancelText: { color: '#144272', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
