// app/screens/treinos/EditarTreinoScreen.js
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function EditarTreinoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_treino } = route.params || {};

  const [treino, setTreino] = useState(null);
  const [nomeTreino, setNomeTreino] = useState('');
  const [exercicios, setExercicios] = useState([]);

  const [buscaExercicio, setBuscaExercicio] = useState('');
  const [resultadosExercicio, setResultadosExercicio] = useState([]);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);
  const [formExercicio, setFormExercicio] = useState({
    series: '',
    repeticoes: '',
    observacoes: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // === Carregar treino existente ===
  useEffect(() => {
    async function carregarTreino() {
      try {
        const res = await api.get(`/treinos/${id_treino}`);
        setTreino(res.data);
        setNomeTreino(res.data.nome_treino);
        setExercicios(res.data.exercicios || []);
      } catch (err) {
        console.error('Erro ao carregar treino:', err);
        Alert.alert('Erro', 'Não foi possível carregar o treino.');
      } finally {
        setCarregando(false);
      }
    }
    carregarTreino();
  }, [id_treino]);

  // === Buscar exercício ===
  useEffect(() => {
    if (buscaExercicio.length >= 2) {
      const delay = setTimeout(async () => {
        try {
          const res = await api.get(`/exercicios?nome=${buscaExercicio}`);
          setResultadosExercicio(res.data);
        } catch (err) {
          console.error('Erro ao buscar exercício:', err);
        }
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setResultadosExercicio([]);
    }
  }, [buscaExercicio]);

  const adicionarExercicio = () => {
    if (!exercicioSelecionado || !formExercicio.series || !formExercicio.repeticoes) {
      Alert.alert('Aviso', 'Preencha séries e repetições antes de adicionar.');
      return;
    }

    const novoEx = {
      ...exercicioSelecionado,
      id_exercicio: exercicioSelecionado.id_exercicio,
      nome_exercicio: exercicioSelecionado.nome,
      series: formExercicio.series,
      repeticoes: formExercicio.repeticoes,
      observacoes: formExercicio.observacoes,
    };

    setExercicios([...exercicios, novoEx]);
    setExercicioSelecionado(null);
    setBuscaExercicio('');
    setFormExercicio({ series: '', repeticoes: '', observacoes: '' });
  };

  const removerExercicio = (index) => {
    const novaLista = [...exercicios];
    novaLista.splice(index, 1);
    setExercicios(novaLista);
  };

  const salvarAlteracoes = async () => {
    if (!nomeTreino || exercicios.length === 0) {
      Alert.alert('Aviso', 'Preencha o nome e adicione pelo menos um exercício.');
      return;
    }

    setSalvando(true);
    try {
      await api.put(`/treinos/${id_treino}`, {
        nome_treino: nomeTreino,
        exercicios: exercicios.map((e) => ({
          id_exercicio: e.id_exercicio,
          series: e.series,
          repeticoes: e.repeticoes,
          observacoes: e.observacoes,
        })),
      });

      Alert.alert('Sucesso', 'Treino atualizado com sucesso!');
      // ✅ Reset de navegação: volta direto para listagem de planos de treino
      navigation.reset({
        index: 0,
        routes: [{ name: 'Treinos' }],
      });
    } catch (err) {
      console.error('Erro ao salvar treino:', err);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 10 }}>Carregando treino...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Editar Treino</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome do Treino:</Text>
        <TextInput
          style={styles.input}
          value={nomeTreino}
          onChangeText={setNomeTreino}
          placeholder="Digite o nome do treino"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Adicionar Exercício:</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar exercício..."
          value={buscaExercicio}
          onChangeText={(txt) => {
            setBuscaExercicio(txt);
            setExercicioSelecionado(null);
          }}
        />

        {resultadosExercicio.map((ex) => (
          <TouchableOpacity
            key={ex.id_exercicio}
            style={styles.itemLista}
            onPress={() => {
              setExercicioSelecionado(ex);
              setResultadosExercicio([]);
              setBuscaExercicio('');
            }}
          >
            <Text style={{ color: '#111827' }}>{ex.nome}</Text>
          </TouchableOpacity>
        ))}

        {exercicioSelecionado && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.subtitulo}>
              Selecionado: {exercicioSelecionado.nome}
            </Text>
            <TextInput
              style={styles.inputMenor}
              placeholder="Séries"
              value={formExercicio.series}
              onChangeText={(t) => setFormExercicio({ ...formExercicio, series: t })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.inputMenor}
              placeholder="Repetições"
              value={formExercicio.repeticoes}
              onChangeText={(t) => setFormExercicio({ ...formExercicio, repeticoes: t })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.inputMenor}
              placeholder="Observações (opcional)"
              value={formExercicio.observacoes}
              onChangeText={(t) => setFormExercicio({ ...formExercicio, observacoes: t })}
            />

            <TouchableOpacity style={styles.btnRoxo} onPress={adicionarExercicio}>
              <Icon name="plus" color="#fff" size={14} />
              <Text style={styles.textBtn}>Adicionar ao Treino</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Exercícios no treino:</Text>
        {exercicios.length === 0 ? (
          <Text style={styles.textoVazio}>Nenhum exercício adicionado.</Text>
        ) : (
          exercicios.map((e, i) => (
            <View key={i} style={styles.itemTreino}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#111827' }}>
                  {e.nome_exercicio || e.nome}
                </Text>
                <Text style={{ color: '#374151' }}>
                  Séries: {e.series} | Repetições: {e.repeticoes}
                </Text>
                {e.observacoes ? (
                  <Text style={styles.obsExercicio}>Obs: {e.observacoes}</Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => removerExercicio(i)}>
                <Icon name="trash" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={[styles.btnRoxo, { marginBottom: 20, backgroundColor: '#16A34A' }]}
        onPress={salvarAlteracoes}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="save" color="#fff" size={16} />
            <Text style={styles.textBtn}>Salvar Alterações</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontWeight: '600', color: '#111827', marginBottom: 4 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 6,
  },
  inputMenor: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    marginTop: 6,
  },
  itemLista: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginTop: 4,
  },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  itemTreino: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  obsExercicio: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
  textoVazio: { textAlign: 'center', color: '#6B7280', fontSize: 15, marginTop: 10 },
  btnRoxo: {
    flexDirection: 'row',
    backgroundColor: '#7A3AED',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textBtn: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
