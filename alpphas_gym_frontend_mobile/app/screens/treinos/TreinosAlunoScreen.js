import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function TreinosAlunoScreen() {
  const navigation = useNavigation();
  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarTreinos() {
      try {
        const res = await api.get('/treinos/meus');
        if (Array.isArray(res.data)) {
          // Agrupa por nome do plano
          const agrupado = {};
          res.data.forEach((t) => {
            const nomePlano = t.nome_plano || 'Sem Plano';
            if (!agrupado[nomePlano]) {
              agrupado[nomePlano] = {
                id_plano: t.id_plano,
                nome_plano: nomePlano,
                treinos: [],
              };
            }
            agrupado[nomePlano].treinos.push({
              id_treino: t.id_treino,
              nome_treino: t.nome_treino,
            });
          });
          setPlanos(Object.values(agrupado));
        } else {
          setPlanos([]);
        }
      } catch (err) {
        console.error('Erro ao carregar treinos do aluno:', err);
        Alert.alert('Erro', 'Não foi possível carregar seus treinos.');
      } finally {
        setCarregando(false);
      }
    }
    carregarTreinos();
  }, []);

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 10 }}>Carregando planos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Meus Planos de Treino</Text>

      {planos.length === 0 ? (
        <Text style={styles.textoVazio}>Você ainda não possui planos de treino.</Text>
      ) : (
        planos.map((plano) => (
          <View key={plano.id_plano} style={styles.cardPlano}>
            <View style={styles.headerPlano}>
              <Text style={styles.nomePlano}>{plano.nome_plano}</Text>
              <TouchableOpacity
                style={styles.btnDetalhes}
                onPress={() =>
                  navigation.navigate('DetalhesTreinoAluno', {
                    id_plano: plano.id_plano,
                  })
                }
              >
                <Icon name="eye" color="#fff" size={14} />
                <Text style={styles.textBtn}>Ver Detalhes</Text>
              </TouchableOpacity>
            </View>

            {plano.treinos.map((t) => (
              <Text key={t.id_treino} style={styles.itemTreino}>
                • {t.nome_treino}
              </Text>
            ))}
          </View>
        ))
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
  cardPlano: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerPlano: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nomePlano: { fontSize: 17, fontWeight: '600', color: '#111827' },
  itemTreino: { fontSize: 14, color: '#374151', marginLeft: 6, marginTop: 2 },
  btnDetalhes: {
    flexDirection: 'row',
    backgroundColor: '#7A3AED',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  textBtn: { color: '#fff', fontSize: 13, fontWeight: '500', marginLeft: 6 },
  textoVazio: { textAlign: 'center', color: '#6B7280', fontSize: 15, marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
