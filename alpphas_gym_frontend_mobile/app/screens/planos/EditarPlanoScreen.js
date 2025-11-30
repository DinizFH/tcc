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
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export default function EditarPlanoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // === CARREGAR PLANO EXISTENTE ===
  useEffect(() => {
    async function carregarPlano() {
      try {
        const res = await api.get(`/planos/${id}`);
        setPlano(res.data);
      } catch (err) {
        console.error('Erro ao carregar plano:', err);
        Alert.alert('Erro', 'Falha ao carregar informações do plano.');
      } finally {
        setLoading(false);
      }
    }
    carregarPlano();
  }, [id]);

  const handleRefeicaoChange = (index, campo, valor) => {
    const novas = [...plano.refeicoes];
    novas[index][campo] = valor;
    setPlano({ ...plano, refeicoes: novas });
  };

  const handleAlimentoChange = (refIndex, aliIndex, campo, valor) => {
    const novas = [...plano.refeicoes];
    novas[refIndex].alimentos[aliIndex][campo] = valor;
    setPlano({ ...plano, refeicoes: novas });
  };

  const adicionarAlimento = (refIndex) => {
    const novas = [...plano.refeicoes];
    novas[refIndex].alimentos.push({ nome: '', peso: '' });
    setPlano({ ...plano, refeicoes: novas });
  };

  const removerAlimento = (refIndex, aliIndex) => {
    const novas = [...plano.refeicoes];
    novas[refIndex].alimentos.splice(aliIndex, 1);
    setPlano({ ...plano, refeicoes: novas });
  };

  const adicionarRefeicao = () => {
    const novas = [...plano.refeicoes];
    novas.push({
      titulo: '',
      calorias_estimadas: '',
      alimentos: [{ nome: '', peso: '' }],
    });
    setPlano({ ...plano, refeicoes: novas });
  };

  const removerRefeicao = (index) => {
    const novas = [...plano.refeicoes];
    novas.splice(index, 1);
    setPlano({ ...plano, refeicoes: novas });
  };

  // === SALVAR ===
  const salvarAlteracoes = async () => {
    const refeicoesValidas = plano.refeicoes
      .filter((r) => r.titulo.trim() && r.alimentos.length > 0)
      .map((r) => ({
        ...r,
        alimentos: r.alimentos.filter(
          (a) => a.nome.trim() && a.peso
        ),
      }))
      .filter((r) => r.alimentos.length > 0);

    if (refeicoesValidas.length === 0) {
      Alert.alert('Aviso', 'Adicione ao menos uma refeição com alimentos válidos.');
      return;
    }

    try {
      setSalvando(true);
      await api.put(`/planos/${id}`, { refeicoes: refeicoesValidas });
      Alert.alert('Sucesso', 'Plano alimentar atualizado com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      Alert.alert('Erro', 'Falha ao salvar alterações.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading || !plano) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando informações do plano...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar Plano Alimentar</Text>

          {/* Aluno fixo */}
          <Text style={styles.label}>Aluno</Text>
          <View style={styles.fixedField}>
            <Text style={styles.fixedText}>
              {plano.nome_aluno || 'Aluno não identificado'}
            </Text>
          </View>

          {/* Refeições */}
          {plano.refeicoes.map((ref, index) => (
            <View key={index} style={styles.refeicaoBox}>
              <View style={styles.refeicaoHeader}>
                <Text style={styles.sectionTitle}>Refeição {index + 1}</Text>
                {plano.refeicoes.length > 1 && (
                  <TouchableOpacity onPress={() => removerRefeicao(index)}>
                    <Icon name="trash" size={18} color="#E74C3C" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                placeholder="Título da refeição (ex: Café da manhã)"
                style={styles.input}
                value={ref.titulo}
                onChangeText={(v) => handleRefeicaoChange(index, 'titulo', v)}
              />

              <TextInput
                placeholder="Calorias estimadas"
                style={styles.input}
                keyboardType="numeric"
                value={String(ref.calorias_estimadas || '')}
                onChangeText={(v) => handleRefeicaoChange(index, 'calorias_estimadas', v)}
              />

              {ref.alimentos.map((alimento, i) => (
                <View key={i} style={styles.alimentoBox}>
                  <TextInput
                    placeholder={`Alimento ${i + 1}`}
                    style={[styles.input, { flex: 1, marginRight: 4 }]}
                    value={alimento.nome}
                    onChangeText={(v) =>
                      handleAlimentoChange(index, i, 'nome', v)
                    }
                  />
                  <TextInput
                    placeholder="Quantidade / Peso"
                    style={[styles.input, { flex: 0.6 }]}
                    value={alimento.peso}
                    onChangeText={(v) =>
                      handleAlimentoChange(index, i, 'peso', v)
                    }
                  />
                  {ref.alimentos.length > 1 && (
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

          {/* Adicionar refeição */}
          <TouchableOpacity style={styles.addButton} onPress={adicionarRefeicao}>
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Refeição</Text>
          </TouchableOpacity>

          {/* Botões */}
          <TouchableOpacity
            style={styles.button}
            onPress={salvarAlteracoes}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="save" size={18} color="#fff" />
                <Text style={styles.buttonText}>Salvar Alterações</Text>
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
  fixedField: {
    backgroundColor: '#eaf4ff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  fixedText: { color: '#144272', fontWeight: 'bold', fontSize: 16 },
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
