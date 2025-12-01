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
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

export default function CriarPlanoScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [refeicoes, setRefeicoes] = useState([
    { nome: '', calorias: '', alimentos: [{ nome: '', peso: '' }] },
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setPerfil(perfilRes.data);

        const alunosRes = await api.get('/usuarios/alunos');
        setAlunos(Array.isArray(alunosRes.data) ? alunosRes.data : []);
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        Alert.alert('Erro', 'Falha ao carregar informações iniciais.');
      } finally {
        setLoadingInit(false);
      }
    }

    carregarDados();
  }, []);

  // === Atualiza campo ===
  const handleChange = (refIndex, key, value) => {
    const novas = [...refeicoes];
    novas[refIndex][key] = value;
    setRefeicoes(novas);
  };

  const handleAlimentoChange = (refIndex, aliIndex, key, value) => {
    const novas = [...refeicoes];
    novas[refIndex].alimentos[aliIndex][key] = value;
    setRefeicoes(novas);
  };

  // === Adicionar/Remover refeições ===
  const adicionarRefeicao = () => {
    setRefeicoes([
      ...refeicoes,
      { nome: '', calorias: '', alimentos: [{ nome: '', peso: '' }] },
    ]);
  };

  const removerRefeicao = (index) => {
    const novas = refeicoes.filter((_, i) => i !== index);
    setRefeicoes(novas);
  };

  // === Adicionar/Remover alimentos ===
  const adicionarAlimento = (refIndex) => {
    const novas = [...refeicoes];
    novas[refIndex].alimentos.push({ nome: '', peso: '' });
    setRefeicoes(novas);
  };

  const removerAlimento = (refIndex, aliIndex) => {
    const novas = [...refeicoes];
    novas[refIndex].alimentos.splice(aliIndex, 1);
    setRefeicoes(novas);
  };

  // === Salvar plano ===
  async function handleSalvar() {
    if (!alunoSelecionado) {
      Alert.alert('Atenção', 'Selecione um aluno.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id_aluno: Number(alunoSelecionado),
        refeicoes: refeicoes.map((r) => ({
          titulo: r.nome.trim() || 'Sem título',
          calorias_estimadas: r.calorias ? parseFloat(r.calorias) : null,
          alimentos: r.alimentos
            .filter((a) => a.nome.trim() !== '')
            .map((a) => ({
              nome: a.nome.trim(),
              peso: a.peso || null, // aceita texto ou número
            })),
        })),
      };

      console.log('Payload plano:', payload);

      const res = await api.post('/planos/', payload);

      if (res.status === 201 || res.status === 200) {
        Alert.alert('Sucesso', 'Plano alimentar criado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Falha ao criar o plano.');
      }
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      Alert.alert('Erro', 'Falha ao salvar plano alimentar.');
    } finally {
      setLoading(false);
    }
  }

  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando informações...
        </Text>
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
          <Text style={styles.title}>Criar Plano Alimentar</Text>

          {/* Selecionar aluno */}
          <Text style={styles.label}>Aluno</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={alunoSelecionado}
              onValueChange={(v) => setAlunoSelecionado(v)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o aluno..." value={null} />
              {alunos.map((a) => (
                <Picker.Item key={a.id_usuario} label={a.nome} value={a.id_usuario} />
              ))}
            </Picker>
          </View>

          {/* Refeições */}
          {refeicoes.map((refeicao, index) => (
            <View key={index} style={styles.refeicaoBox}>
              <View style={styles.refeicaoHeader}>
                <Text style={styles.sectionTitle}>Refeição {index + 1}</Text>
                {refeicoes.length > 1 && (
                  <TouchableOpacity onPress={() => removerRefeicao(index)}>
                    <Icon name="trash" size={18} color="#E74C3C" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                placeholder="Título da refeição (ex: Café da manhã)"
                style={styles.input}
                value={refeicao.nome}
                onChangeText={(v) => handleChange(index, 'nome', v)}
              />

              <TextInput
                placeholder="Calorias totais da refeição"
                style={styles.input}
                keyboardType="numeric"
                value={refeicao.calorias}
                onChangeText={(v) => handleChange(index, 'calorias', v)}
              />

              {/* Alimentos */}
              {refeicao.alimentos.map((alimento, i) => (
                <View key={i} style={styles.alimentoBox}>
                  <TextInput
                    placeholder={`Alimento ${i + 1}`}
                    style={[styles.input, { flex: 1, marginRight: 4 }]}
                    value={alimento.nome}
                    onChangeText={(v) => handleAlimentoChange(index, i, 'nome', v)}
                  />
                  <TextInput
                    placeholder="Quantidade / Peso (g/ml)"
                    style={[styles.input, { flex: 0.6 }]}
                    keyboardType="default" // aceita texto e número
                    value={alimento.peso}
                    onChangeText={(v) => handleAlimentoChange(index, i, 'peso', v)}
                  />
                  {refeicao.alimentos.length > 1 && (
                    <TouchableOpacity onPress={() => removerAlimento(index, i)}>
                      <Icon name="minus-circle" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSubButton}
                onPress={() => adicionarAlimento(index)}
              >
                <Icon name="plus" size={16} color="#144272" />
                <Text style={styles.addSubText}>Adicionar alimento</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Botão adicionar refeição */}
          <TouchableOpacity style={styles.addButton} onPress={adicionarRefeicao}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Refeição</Text>
          </TouchableOpacity>

          {/* Botão salvar */}
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
                <Text style={styles.buttonText}>Salvar Plano</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Voltar */}
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

// === ESTILOS ===
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
  pickerContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  picker: { height: 50, width: '100%', color: '#000' },
  refeicaoBox: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  refeicaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#144272' },
  alimentoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addSubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addSubText: {
    color: '#144272',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
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
  cancelButton: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  cancelText: { color: '#144272', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
