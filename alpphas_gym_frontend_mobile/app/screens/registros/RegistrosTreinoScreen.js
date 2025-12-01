import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';
import RegistroTreinoService from './RegistroTreinoService';
import SelecionarAlunoModal from './SelecionarAlunoModal';
import SelecionarPlanoModal from './SelecionarPlanoModal';
import SelecionarTreinoModal from './SelecionarTreinoModal';

export default function RegistrosTreinoScreen() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [busca, setBusca] = useState('');

  // modais de criação
  const [mostrarAluno, setMostrarAluno] = useState(false);
  const [mostrarPlano, setMostrarPlano] = useState(false);
  const [mostrarTreino, setMostrarTreino] = useState(false);
  const [alunoSel, setAlunoSel] = useState(null);
  const [planoSel, setPlanoSel] = useState(null);

  // Corrige comportamento do botão físico "Voltar"
  useEffect(() => {
    const backAction = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // === Carregar dados ===
  useEffect(() => {
    async function carregar() {
      try {
        const perfil = await api.get('/usuarios/perfil');
        setUsuario(perfil.data);

        if (perfil.data.tipo_usuario === 'personal') {
          const all = await RegistroTreinoService.listarTodos();
          setRegistros(all);
        } else {
          const mine = await RegistroTreinoService.listarMeus();
          setRegistros(mine);
        }
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar os registros.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  // === Filtro (para personal) ===
  async function filtrarPorNomeAluno(txt) {
    setBusca(txt);
    if (usuario?.tipo_usuario !== 'personal') return;
    try {
      const res = await RegistroTreinoService.buscarPorAlunoNome(txt);
      setRegistros(res);
    } catch {}
  }

  // === Criação de novo registro ===
  function iniciarCriacao() {
    if (usuario?.tipo_usuario === 'personal') {
      setAlunoSel(null);
      setPlanoSel(null);
      setMostrarAluno(true);
    } else {
      // aluno: pula seleção de aluno e abre seleção de plano direto
      setAlunoSel({ id_usuario: usuario?.id_usuario, nome: usuario?.nome });
      setMostrarPlano(true);
    }
  }

  function onAlunoSelecionado(a) {
    setAlunoSel(a);
    setMostrarAluno(false);
    setTimeout(() => setMostrarPlano(true), 200);
  }

  function onPlanoSelecionado(p) {
    setPlanoSel(p);
    setMostrarPlano(false);
    setTimeout(() => setMostrarTreino(true), 200);
  }

  function onTreinoSelecionado(t) {
    setMostrarTreino(false);
    navigation.navigate('CriarRegistroTreino', {
      id_treino: t.id_treino,
      nome_treino: t.nome_treino,
      id_plano: planoSel?.id_plano,
      nome_plano: planoSel?.nome_plano,
      ...(usuario?.tipo_usuario === 'personal' ? { id_aluno: alunoSel?.id_usuario } : {}),
    });
  }

  const abrirDetalhes = (id) =>
    navigation.navigate('DetalhesRegistroTreino', { id_registro: id });

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 8, color: '#111827' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Registros de Treino</Text>

      {usuario?.tipo_usuario === 'personal' && (
        <View style={styles.search}>
          <Icon name="search" size={16} color="#6B7280" />
          <TextInput
            style={styles.input}
            placeholder="Buscar por aluno..."
            value={busca}
            onChangeText={filtrarPorNomeAluno}
          />
        </View>
      )}

      {registros.length === 0 ? (
        <Text style={styles.vazio}>Nenhum registro encontrado.</Text>
      ) : (
        registros.map((reg) => (
          <TouchableOpacity
            key={reg.id_registro}
            style={styles.card}
            onPress={() => abrirDetalhes(reg.id_registro)}
          >
            <Text style={styles.treinoNome}>{reg.nome_treino}</Text>
            <Text style={styles.sub}>
              {new Date(reg.data_execucao).toLocaleString('pt-BR')}
            </Text>
            {usuario?.tipo_usuario === 'personal' && reg.nome_aluno && (
              <Text style={styles.sub}>Aluno: {reg.nome_aluno}</Text>
            )}
            {reg.nome_plano && <Text style={styles.sub}>Plano: {reg.nome_plano}</Text>}
            {reg.observacoes ? <Text style={styles.obs}>Obs: {reg.observacoes}</Text> : null}
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.btnNovo} onPress={iniciarCriacao}>
        <Icon name="plus" size={16} color="#fff" />
        <Text style={styles.btnNovoTxt}>Novo Registro</Text>
      </TouchableOpacity>

      {/* === Modais === */}
      <SelecionarAlunoModal
        visible={mostrarAluno}
        onClose={() => setMostrarAluno(false)}
        onSelecionar={onAlunoSelecionado}
      />
      <SelecionarPlanoModal
        visible={mostrarPlano}
        idAluno={alunoSel?.id_usuario}
        onClose={() => setMostrarPlano(false)}
        onSelecionar={onPlanoSelecionado}
      />
      <SelecionarTreinoModal
        visible={mostrarTreino}
        idPlano={planoSel?.id_plano}
        onClose={() => setMostrarTreino(false)}
        onSelecionar={onTreinoSelecionado}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
    elevation: 2,
  },
  input: { flex: 1, paddingVertical: 8, fontSize: 15 },
  vazio: { textAlign: 'center', color: '#6B7280', marginTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2 },
  treinoNome: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  sub: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  obs: { color: '#374151', fontSize: 13, marginTop: 6 },
  btnNovo: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnNovoTxt: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
