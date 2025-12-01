import { useNavigation, useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import logo from '../../../assets/alpphas_logo.png';
import api from '../../services/api';

export default function DetalhesPlanoTreinoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id_plano } = route.params || {};

  const [plano, setPlano] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);

  // === CARREGAR PLANO DE TREINO ===
  useEffect(() => {
    async function carregarPlano() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setUsuario(perfilRes.data);

        const planoRes = await api.get(`/treinos/plano/${id_plano}/detalhes`);
        setPlano(planoRes.data.plano);
      } catch (err) {
        console.error('Erro ao carregar plano de treino:', err);
        Alert.alert('Erro', 'Falha ao carregar os dados do plano de treino.');
      } finally {
        setCarregando(false);
      }
    }

    if (id_plano) carregarPlano();
  }, [id_plano]);

  // === GERAR PDF LOCAL COM LOGO ===
  async function exportarPDF() {
    try {
      if (!plano) {
        Alert.alert('Aviso', 'Plano de treino ainda não foi carregado.');
        return;
      }

      const logoBase64 = Image.resolveAssetSource(logo).uri;
      const dataAtual = new Date().toLocaleDateString('pt-BR');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
              h1 { text-align: center; color: #144272; margin-bottom: 5px; }
              h2 { color: #144272; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
              .logo { display: block; margin: 0 auto 10px auto; width: 100px; }
              .info { margin-bottom: 20px; font-size: 14px; }
              .treino { margin-top: 20px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; }
              .exercicio { margin-left: 10px; font-size: 13px; }
              footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <img src="${logoBase64}" class="logo" />
            <h1>Plano de Treino</h1>
            <div class="info">
              <p><strong>Personal Trainer:</strong> ${usuario?.nome || 'Não informado'}</p>
              <p><strong>Data:</strong> ${dataAtual}</p>
            </div>

            ${plano.treinos
              .map(
                (t, i) => `
                <div class="treino">
                  <h2>${t.nome_treino || `Treino ${i + 1}`}</h2>
                  ${
                    t.exercicios && t.exercicios.length
                      ? t.exercicios
                          .map(
                            (ex) => `
                            <p class="exercicio">
                              🏋️ <strong>${ex.nome}</strong> - ${
                              ex.series || '--'
                            }x${ex.repeticoes || '--'} ${
                              ex.observacoes
                                ? `<br><em>Obs:</em> ${ex.observacoes}`
                                : ''
                            }
                            </p>`
                          )
                          .join('')
                      : '<p class="exercicio"><em>Nenhum exercício cadastrado.</em></p>'
                  }
                </div>`
              )
              .join('')}

            <footer>
              <p>📘 Gerado automaticamente pelo sistema <strong>Alpphas Gym</strong></p>
              <p>www.alpphasgym.com.br</p>
            </footer>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF Gerado', `Arquivo salvo em: ${uri}`);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  }

  // === EXCLUIR PLANO COMPLETO ===
  const handleExcluirPlano = () => {
    const id = route.params?.id_plano || plano?.id_plano;
    if (!id) {
      Alert.alert('Erro', 'Plano não identificado.');
      return;
    }

    Alert.alert(
      'Excluir plano',
      'Tem certeza que deseja excluir este plano e todos os treinos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setExcluindo(true);
              await api.delete(`/treinos/plano/${id}`);
              Alert.alert('Sucesso', 'Plano excluído com sucesso.');
              navigation.reset({ index: 0, routes: [{ name: 'Treinos' }] });
            } catch (err) {
              console.error('Erro ao excluir plano:', err);
              Alert.alert('Erro', 'Falha ao excluir o plano de treino.');
            } finally {
              setExcluindo(false);
            }
          },
        },
      ]
    );
  };

  // === EXCLUIR TREINO INDIVIDUAL ===
  const handleExcluirTreino = (id_treino) => {
    Alert.alert(
      'Excluir treino',
      'Tem certeza que deseja excluir este treino?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/treinos/${id_treino}`);
              Alert.alert('Sucesso', 'Treino excluído com sucesso.');
              navigation.reset({ index: 0, routes: [{ name: 'Treinos' }] });
            } catch (err) {
              console.error('Erro ao excluir treino:', err);
              Alert.alert('Erro', 'Não foi possível excluir o treino.');
            }
          },
        },
      ]
    );
  };

  // === ADICIONAR NOVO TREINO AO PLANO ===
  const handleAdicionarTreino = () => {
    const id = route.params?.id_plano || plano?.id_plano;
    if (!id) {
      Alert.alert('Erro', 'Não foi possível identificar o plano de treino.');
      return;
    }
    navigation.navigate('CriarTreino', { id_plano: id });
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando plano...</Text>
      </View>
    );
  }

  if (!plano) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plano de treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano de Treino</Text>
      </View>

      {/* PERSONAL */}
      <View style={styles.card}>
        <Text style={styles.label}>Personal Trainer:</Text>
        <Text style={styles.value}>{usuario?.nome || 'Não informado'}</Text>
      </View>

      {/* LISTAGEM DE TREINOS */}
      {plano.treinos && plano.treinos.length > 0 ? (
        plano.treinos.map((treino) => (
          <View key={treino.id_treino} style={styles.card}>
            <View style={styles.treinoHeader}>
              <Text style={styles.refTitle}>🏋️ {treino.nome_treino}</Text>

              {usuario?.tipo_usuario === 'personal' && (
                <View style={styles.acoesTreino}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={() =>
                      navigation.navigate('EditarTreino', {
                        id_treino: treino.id_treino,
                      })
                    }
                  >
                    <Icon name="edit" size={15} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnExcluir}
                    onPress={() => handleExcluirTreino(treino.id_treino)}
                  >
                    <Icon name="trash" size={15} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {treino.exercicios && treino.exercicios.length > 0 ? (
              treino.exercicios.map((ex, idx) => (
                <View key={idx} style={styles.alimentoBox}>
                  <Icon name="dumbbell" size={16} color="#144272" />
                  <Text style={styles.alimentoText}>
                    {ex.nome} - {ex.series}x{ex.repeticoes}{' '}
                    {ex.observacoes ? `(${ex.observacoes})` : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum exercício cadastrado.</Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Nenhum treino cadastrado.</Text>
        </View>
      )}

      {/* BOTÕES */}
      <View style={styles.buttonsRow}>
        {usuario?.tipo_usuario === 'personal' && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#16A34A' }]}
            onPress={handleAdicionarTreino}
          >
            <Icon name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#8E44AD' }]}
          onPress={exportarPDF}
        >
          <Icon name="file-pdf" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#DC2626' }]}
          onPress={handleExcluirPlano}
        >
          {excluindo ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="trash" size={18} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#144272' }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// === ESTILOS ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 3,
  },
  treinoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acoesTreino: { flexDirection: 'row', gap: 8 },
  btnEditar: { backgroundColor: '#2563EB', padding: 8, borderRadius: 8 },
  btnExcluir: { backgroundColor: '#DC2626', padding: 8, borderRadius: 8 },
  label: { fontSize: 15, color: '#144272', fontWeight: 'bold', marginTop: 8 },
  value: { fontSize: 15, color: '#333', marginTop: 2 },
  refTitle: { fontSize: 17, fontWeight: 'bold', color: '#144272', marginBottom: 6 },
  alimentoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  alimentoText: { marginLeft: 8, fontSize: 14, color: '#333' },
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
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
