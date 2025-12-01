import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview';
import api from '../../services/api';
import RegistroTreinoService from './RegistroTreinoService';

export default function CriarRegistroTreinoScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { id_treino, id_plano, nome_treino, nome_plano, id_aluno } = params || {};

  const [usuario, setUsuario] = useState(null);
  const [exercicios, setExercicios] = useState([]);
  const [cargas, setCargas] = useState({});
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    async function carregar() {
      if (!id_treino || !id_plano) {
        Alert.alert('Erro', 'Dados incompletos do treino/plano.');
        navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
        return;
      }
      try {
        const perfil = await api.get('/usuarios/perfil');
        setUsuario(perfil.data);

        let lista = [];
        try {
          const plano = await RegistroTreinoService.detalhesPlano(id_plano);
          const tSel = (plano.treinos || []).find((t) => t.id_treino === id_treino);
          if (tSel) lista = tSel.exercicios || [];
        } catch {}
        if (!lista.length) {
          try {
            const tdet = await RegistroTreinoService.detalhesTreino(id_treino);
            lista = tdet?.exercicios || [];
          } catch {}
        }
        setExercicios(lista);

        // Pré-carregar última carga
        const ultimas = {};
        for (const ex of lista) {
          try {
            const data = await RegistroTreinoService.ultimaCarga({
              id_exercicio: ex.id_exercicio,
              id_treino,
              id_aluno,
            });
            ultimas[`${id_treino}_${ex.id_exercicio}`] = data?.ultima_carga ?? null;
          } catch {
            ultimas[`${id_treino}_${ex.id_exercicio}`] = null;
          }
        }
        setCargas((prev) => ({ ...ultimas, ...prev }));
      } catch (e) {
        Alert.alert('Erro', 'Falha ao carregar treino.');
        navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id_treino, id_plano, id_aluno, navigation]);

  const onChangeCarga = (id_exercicio, valor) => {
    setCargas((prev) => ({ ...prev, [`${id_treino}_${id_exercicio}`]: valor }));
  };

  const salvar = async () => {
    try {
      const payload = {
        id_treino,
        id_plano,
        observacoes,
        cargas: exercicios.map((ex) => ({
          id_exercicio: ex.id_exercicio,
          carga: String(cargas[`${id_treino}_${ex.id_exercicio}`] ?? '').trim() || null,
        })),
      };
      if (id_aluno) payload.id_aluno = id_aluno;

      await RegistroTreinoService.criar(payload);
      Alert.alert('Sucesso', 'Registro de treino salvo!');
      navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
    } catch (e) {
      console.log(e);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 8 }}>Carregando treino...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.titulo}>Novo Registro</Text>

        <View style={styles.card}>
          {nome_plano ? (
            <>
              <Text style={styles.label}>Plano</Text>
              <Text style={styles.value}>{nome_plano}</Text>
            </>
          ) : null}
          <Text style={styles.label}>Treino</Text>
          <Text style={styles.value}>{nome_treino}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Exercícios</Text>
          {exercicios.length === 0 ? (
            <Text style={styles.vazio}>Nenhum exercício encontrado.</Text>
          ) : (
            exercicios.map((ex) => (
              <View key={ex.id_exercicio} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.nomeEx}>{ex.nome}</Text>
                    {ex.video && (
                      <TouchableOpacity onPress={() => setVideoUrl(ex.video)}>
                        <Icon name="video" size={18} color="#144272" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {ex.grupo_muscular ? (
                    <Text style={styles.sub}>{ex.grupo_muscular}</Text>
                  ) : null}
                  {cargas[`${id_treino}_${ex.id_exercicio}`] !== undefined && (
                    <Text style={styles.ultima}>
                      Última carga: {cargas[`${id_treino}_${ex.id_exercicio}`] ?? '—'}
                    </Text>
                  )}
                </View>
                <TextInput
                  placeholder="Carga (kg)"
                  style={styles.input}
                  keyboardType="numeric"
                  value={(cargas[`${id_treino}_${ex.id_exercicio}`] ?? '').toString()}
                  onChangeText={(v) => onChangeCarga(ex.id_exercicio, v)}
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            placeholder="Ex: dor no ombro, ajustar carga no próximo..."
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            style={[styles.input, { height: 80 }]}
          />
        </View>

        <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
          <Icon name="save" size={16} color="#fff" />
          <Text style={styles.btnSalvarTxt}>Salvar Registro</Text>
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2 },
  label: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  value: { fontSize: 15, color: '#111827', fontWeight: '600' },
  subtitulo: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nomeEx: { fontSize: 15, fontWeight: '600', color: '#111827' },
  sub: { color: '#6B7280', fontSize: 12 },
  ultima: { color: '#2563EB', fontSize: 12, marginTop: 4 },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 110,
  },
  btnSalvar: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnSalvarTxt: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  vazio: { textAlign: 'center', color: '#6B7280', marginTop: 10 },

  // Modal
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
