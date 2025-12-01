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

export default function CriarTreinoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_plano } = route.params || {};

  const [buscaAluno, setBuscaAluno] = useState('');
  const [resultadosAluno, setResultadosAluno] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [nomePlano, setNomePlano] = useState('');
  const [treinos, setTreinos] = useState([]);

  const [nomeTreinoAtual, setNomeTreinoAtual] = useState('');
  const [exerciciosTreinoAtual, setExerciciosTreinoAtual] = useState([]);
  const [buscaExercicio, setBuscaExercicio] = useState('');
  const [resultadosExercicio, setResultadosExercicio] = useState([]);
  const [exercicioSelecionado, setExercicioSelecionado] = useState(null);

  const [formExercicio, setFormExercicio] = useState({
    series: '',
    repeticoes: '',
    observacoes: '',
  });

  const [carregando, setCarregando] = useState(false);

  // === Buscar aluno ===
  useEffect(() => {
    if (buscaAluno.length >= 2 && !id_plano) {
      const delay = setTimeout(async () => {
        try {
          const res = await api.get(`/avaliacoes/buscar-aluno?nome=${buscaAluno}`);
          setResultadosAluno(res.data);
        } catch (err) {
          console.error('Erro ao buscar aluno:', err);
        }
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [buscaAluno, id_plano]);

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

  const adicionarExercicioAoTreino = () => {
    if (!exercicioSelecionado || !formExercicio.series || !formExercicio.repeticoes) {
      Alert.alert('Aviso', 'Preencha as séries e repetições antes de adicionar.');
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

    setExerciciosTreinoAtual([...exerciciosTreinoAtual, novoEx]);
    setExercicioSelecionado(null);
    setBuscaExercicio('');
    setFormExercicio({ series: '', repeticoes: '', observacoes: '' });
  };

  const adicionarTreinoAoPlano = () => {
    if (!nomeTreinoAtual || exerciciosTreinoAtual.length === 0) {
      Alert.alert('Aviso', 'Adicione ao menos um exercício ao treino.');
      return;
    }

    const novoTreino = {
      nome_treino: nomeTreinoAtual,
      exercicios: exerciciosTreinoAtual,
    };

    setTreinos([...treinos, novoTreino]);
    setNomeTreinoAtual('');
    setExerciciosTreinoAtual([]);
  };

  const removerTreino = (index) => {
    const novos = [...treinos];
    novos.splice(index, 1);
    setTreinos(novos);
  };

  // === Salvar plano ou adicionar treino ao plano existente ===
  const salvarPlano = async () => {
    if ((!alunoSelecionado && !id_plano) || (!id_plano && !nomePlano) || treinos.length === 0) {
      Alert.alert('Aviso', 'Preencha todos os campos e adicione pelo menos um treino.');
      return;
    }

    setCarregando(true);
    try {
      if (id_plano) {
        // Corrigido: envia para o endpoint certo
        for (const treino of treinos) {
          await api.post('/treinos/adicionar-ao-plano', {
            id_plano: parseInt(id_plano),
            nome_treino: treino.nome_treino,
            exercicios: treino.exercicios.map((ex) => ({
              id_exercicio: ex.id_exercicio,
              series: ex.series,
              repeticoes: ex.repeticoes,
              observacoes: ex.observacoes,
            })),
          });
        }
      } else {
        await api.post('/treinos/plano', {
          id_aluno: alunoSelecionado.id_usuario,
          nome_plano: nomePlano,
          treinos: treinos,
        });
      }

      Alert.alert('Sucesso', id_plano ? 'Treino adicionado com sucesso!' : 'Plano de treino criado com sucesso!');

      //  Redireciona e limpa o histórico
      navigation.reset({
        index: 0,
        routes: [{ name: 'Treinos' }],
      });
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      Alert.alert('Erro', 'Não foi possível salvar o plano.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        {id_plano ? 'Adicionar Treino ao Plano' : 'Criar Plano de Treinos'}
      </Text>

      {!alunoSelecionado && !id_plano && (
        <View style={styles.card}>
          <Text style={styles.label}>Buscar Aluno:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do aluno..."
            value={buscaAluno}
            onChangeText={setBuscaAluno}
          />
          {resultadosAluno.map((aluno) => (
            <TouchableOpacity
              key={aluno.id_usuario}
              style={styles.itemLista}
              onPress={() => setAlunoSelecionado(aluno)}
            >
              <Text style={{ color: '#111827' }}>{aluno.nome} ({aluno.cpf})</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {(alunoSelecionado || id_plano) && (
        <>
          {alunoSelecionado && (
            <Text style={styles.alunoSelecionado}>
              👤 {alunoSelecionado.nome} ({alunoSelecionado.cpf})
            </Text>
          )}

          {!id_plano && (
            <View style={styles.card}>
              <Text style={styles.label}>Nome do Plano de Treino:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Hipertrofia Setembro"
                value={nomePlano}
                onChangeText={setNomePlano}
              />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.label}>Nome do Treino:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Treino A"
              value={nomeTreinoAtual}
              onChangeText={setNomeTreinoAtual}
            />

            <Text style={[styles.label, { marginTop: 10 }]}>Adicionar Exercício:</Text>
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
                  setBuscaExercicio('');
                  setResultadosExercicio([]);
                }}
              >
                <Text>{ex.nome}</Text>
              </TouchableOpacity>
            ))}

            {exercicioSelecionado && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subtitulo}>Selecionado: {exercicioSelecionado.nome}</Text>

                <View style={{ gap: 6, marginTop: 6 }}>
                  <TextInput
                    placeholder="Séries"
                    value={formExercicio.series}
                    onChangeText={(t) => setFormExercicio({ ...formExercicio, series: t })}
                    style={styles.inputMenor}
                    keyboardType="numeric"
                  />
                  <TextInput
                    placeholder="Repetições"
                    value={formExercicio.repeticoes}
                    onChangeText={(t) => setFormExercicio({ ...formExercicio, repeticoes: t })}
                    style={styles.inputMenor}
                    autoCapitalize="none"
                    keyboardType="default"
                  />
                  <TextInput
                    placeholder="Observações (opcional)"
                    value={formExercicio.observacoes}
                    onChangeText={(t) => setFormExercicio({ ...formExercicio, observacoes: t })}
                    style={styles.inputMenor}
                  />

                  <TouchableOpacity
                    style={styles.btnRoxo}
                    onPress={adicionarExercicioAoTreino}
                  >
                    <Icon name="plus" color="#fff" size={14} />
                    <Text style={styles.textBtn}>Adicionar Exercício</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {exerciciosTreinoAtual.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.subtitulo}>Exercícios do treino:</Text>
                {exerciciosTreinoAtual.map((ex, i) => (
                  <Text key={i} style={styles.itemExercicio}>
                    • {ex.nome_exercicio} - {ex.series}x{ex.repeticoes}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.btnVerde} onPress={adicionarTreinoAoPlano}>
              <Icon name="plus" color="#fff" size={14} />
              <Text style={styles.textBtn}>Adicionar Treino ao Plano</Text>
            </TouchableOpacity>
          </View>

          {treinos.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.subtitulo}>Treinos no plano:</Text>
              {treinos.map((t, i) => (
                <View key={i} style={styles.itemTreino}>
                  <Text style={{ flex: 1 }}>{t.nome_treino}</Text>
                  <TouchableOpacity onPress={() => removerTreino(i)}>
                    <Icon name="trash" color="#DC2626" size={16} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnRoxo, { marginTop: 10, backgroundColor: '#16A34A' }]}
            onPress={salvarPlano}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="save" color="#fff" size={16} />
                <Text style={styles.textBtn}>Salvar Plano</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  label: { fontWeight: '600', color: '#111827', marginBottom: 4 },
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
  },
  itemLista: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginTop: 4,
  },
  alunoSelecionado: { fontWeight: '600', color: '#374151', marginBottom: 10 },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  itemExercicio: { color: '#374151', fontSize: 14, marginTop: 2 },
  itemTreino: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  btnRoxo: {
    flexDirection: 'row',
    backgroundColor: '#7A3AED',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnVerde: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
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
});
