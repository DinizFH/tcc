import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
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

export default function TreinosScreen() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // === Corrige o comportamento do botão físico "voltar" ===
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
        return true; // evita minimizar o app
      };

      // Corrige erro em ambientes Expo (garante compatibilidade)
      if (BackHandler && BackHandler.addEventListener) {
        const subscription = BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress
        );
        return () => subscription.remove();
      }

      return undefined;
    }, [navigation])
  );

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await api.get('/usuarios/perfil');
        setUsuario(res.data);
        if (res.data.tipo_usuario === 'personal') {
          await carregarTreinosPersonal('');
        } else if (res.data.tipo_usuario === 'aluno') {
          await carregarTreinosAluno();
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
      } finally {
        setCarregando(false);
      }
    }
    carregarPerfil();
  }, []);

  // === PERSONAL ===
  async function carregarTreinosPersonal(nome = '') {
    try {
      setCarregando(true);
      const res = await api.get(`/treinos/profissional?nome=${nome}`);
      const agrupado = res.data.map((aluno) => {
        const planos = {};
        aluno.treinos.forEach((treino) => {
          const key = treino.nome_plano || 'Sem Plano';
          if (!planos[key]) planos[key] = { id_plano: treino.id_plano, treinos: [] };
          planos[key].treinos.push(treino);
        });
        return { ...aluno, planos };
      });
      setResultados(agrupado);
    } catch (err) {
      console.error('Erro ao buscar treinos (personal):', err);
    } finally {
      setCarregando(false);
    }
  }

  // === ALUNO ===
  async function carregarTreinosAluno() {
    try {
      setCarregando(true);
      const res = await api.get('/treinos/meus');
      if (Array.isArray(res.data)) {
        const planos = {};
        res.data.forEach((treino) => {
          const key = treino.nome_plano || 'Sem Plano';
          if (!planos[key]) planos[key] = { id_plano: treino.id_plano, treinos: [] };
          planos[key].treinos.push(treino);
        });

        setResultados([
          {
            id_usuario: usuario?.id_usuario,
            nome: usuario?.nome,
            cpf: usuario?.cpf,
            planos,
          },
        ]);
      }
    } catch (err) {
      console.error('Erro ao buscar treinos (aluno):', err);
    } finally {
      setCarregando(false);
    }
  }

  const irParaDetalhes = (id_plano) => {
    if (!id_plano) {
      Alert.alert('Aviso', 'ID do plano não encontrado.');
      return;
    }
    navigation.navigate('DetalhesPlanoTreino', { id_plano });
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 10 }}>Carregando treinos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Treinos</Text>

      {/* PERSONAL - campo de busca */}
      {usuario?.tipo_usuario === 'personal' && (
        <View style={styles.searchContainer}>
          <Icon name="search" size={18} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Buscar aluno por nome..."
            value={busca}
            onChangeText={(txt) => {
              setBusca(txt);
              carregarTreinosPersonal(txt);
            }}
          />
        </View>
      )}

      {/* Lista de treinos */}
      {resultados.length === 0 ? (
        <Text style={styles.textoVazio}>
          {usuario?.tipo_usuario === 'aluno'
            ? 'Você ainda não possui treinos cadastrados.'
            : 'Nenhum aluno encontrado com planos de treino.'}
        </Text>
      ) : (
        resultados.map((aluno) => (
          <View key={aluno.id_usuario} style={styles.cardAluno}>
            <Text style={styles.nomeAluno}>{aluno.nome}</Text>
            {usuario?.tipo_usuario === 'personal' && (
              <Text style={styles.cpfAluno}>CPF: {aluno.cpf}</Text>
            )}

            {Object.entries(aluno.planos).map(([nomePlano, plano]) => (
              <View key={nomePlano} style={styles.cardPlano}>
                <View style={styles.headerPlano}>
                  <Text style={styles.nomePlano}>{nomePlano}</Text>
                  <TouchableOpacity
                    style={styles.btnDetalhes}
                    onPress={() => irParaDetalhes(plano.id_plano)}
                  >
                    <Text style={styles.textBtnDetalhes}>Ver detalhes</Text>
                  </TouchableOpacity>
                </View>

                {plano.treinos.map((t) => (
                  <Text key={t.id_treino} style={styles.itemTreino}>
                    • {t.nome_treino}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))
      )}

      {usuario?.tipo_usuario === 'personal' && (
        <TouchableOpacity
          style={styles.btnNovo}
          onPress={() => navigation.navigate('CriarTreino')}
        >
          <Icon name="plus" color="#fff" size={16} />
          <Text style={styles.textBtnNovo}>Novo Plano de Treino</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 15 },
  textoVazio: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 15,
    marginTop: 20,
  },
  cardAluno: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  nomeAluno: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  cpfAluno: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  cardPlano: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  headerPlano: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nomePlano: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemTreino: { fontSize: 14, color: '#374151', marginLeft: 8, marginTop: 2 },
  btnDetalhes: {
    backgroundColor: '#7A3AED',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  textBtnDetalhes: { color: '#fff', fontSize: 13 },
  btnNovo: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textBtnNovo: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
