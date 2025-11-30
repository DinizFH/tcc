import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DetalhesAvaliacaoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const [avaliacao, setAvaliacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState('');

  const screenWidth = Dimensions.get('window').width - 40;

  useEffect(() => {
    async function carregarAvaliacao() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setTipoUsuario(perfilRes.data.tipo_usuario);

        const res = await api.get(`/avaliacoes/${id}`);
        setAvaliacao(res.data);
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
        Alert.alert('Erro', 'Falha ao carregar os detalhes da avaliação.');
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarAvaliacao();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!avaliacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Avaliação não encontrada.</Text>
      </View>
    );
  }

  const {
    nome_aluno,
    nome_profissional,
    data_avaliacao,
    imc,
    percentual_gordura,
    massa_magra,
    massa_gorda,
    peso,
    altura,
    observacoes,
    ...medidas
  } = avaliacao;

  const imcNum = Number(imc);
  const gorduraNum = Number(percentual_gordura);
  const magraNum = Number(massa_magra);
  const gordaNum = Number(massa_gorda);
  const pesoNum = Number(peso);
  const alturaNum = Number(altura);

  const chartData = [
    {
      name: 'Massa Magra',
      population: isNaN(magraNum) ? 0 : magraNum,
      color: '#2ECC71',
      legendFontColor: '#144272',
      legendFontSize: 14,
    },
    {
      name: 'Massa Gorda',
      population: isNaN(gordaNum) ? 0 : gordaNum,
      color: '#E74C3C',
      legendFontColor: '#144272',
      legendFontSize: 14,
    },
  ];

  // === Função para ajustar nomes técnicos das dobras ===
  const formatarNomeMedida = (key) => {
    if (key === 'dobra_supra_iliaca') return 'dobra suprailíaca';
    return key.replace(/_/g, ' ');
  };

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Avaliação</Text>
      </View>

      {/* INFORMAÇÕES GERAIS */}
      <View style={styles.card}>
        <Text style={styles.label}>Aluno:</Text>
        <Text style={styles.value}>{nome_aluno || 'Não informado'}</Text>

        <Text style={styles.label}>Profissional:</Text>
        <Text style={styles.value}>{nome_profissional || 'Não informado'}</Text>

        <Text style={styles.label}>Data:</Text>
        <Text style={styles.value}>
          {data_avaliacao
            ? new Date(data_avaliacao).toLocaleDateString()
            : '--/--/----'}
        </Text>

        <Text style={styles.label}>Peso / Altura:</Text>
        <Text style={styles.value}>
          {pesoNum ? `${pesoNum.toFixed(1)} kg` : '-- kg'} /{' '}
          {alturaNum ? `${alturaNum.toFixed(2)} m` : '-- m'}
        </Text>

        <Text style={styles.label}>IMC:</Text>
        <Text style={[styles.value, { fontWeight: 'bold', color: '#144272' }]}>
          {imcNum ? imcNum.toFixed(2) : '--'}
        </Text>

        <Text style={styles.label}>% Gordura:</Text>
        <Text style={[styles.value, { color: '#E67E22', fontWeight: 'bold' }]}>
          {gorduraNum ? `${gorduraNum.toFixed(1)}%` : '--'}
        </Text>

        <Text style={styles.label}>Massa Magra / Gorda:</Text>
        <Text style={styles.value}>
          {magraNum ? magraNum.toFixed(1) : '--'} kg /{' '}
          {gordaNum ? gordaNum.toFixed(1) : '--'} kg
        </Text>
      </View>

      {/* GRÁFICO DE COMPOSIÇÃO CORPORAL */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Composição Corporal</Text>
        <PieChart
          data={chartData}
          width={screenWidth}
          height={200}
          chartConfig={{
            color: () => '#144272',
            labelColor: () => '#144272',
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* MEDIDAS DETALHADAS */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dobras Cutâneas</Text>
        {Object.entries(medidas)
          .filter(([k]) => k.startsWith('dobra_'))
          .map(([k, v]) => (
            <Text key={k} style={styles.measureText}>
              {formatarNomeMedida(k)}: {v ?? '--'} mm
            </Text>
          ))}

        <Text style={styles.sectionTitle}>Perímetros</Text>
        {Object.entries(medidas)
          .filter(([k]) =>
            [
              'pescoco',
              'ombro',
              'torax',
              'cintura',
              'abdomen',
              'quadril',
              'braco_direito',
              'braco_esquerdo',
              'braco_d_contraido',
              'braco_e_contraido',
              'antebraco_direito',
              'antebraco_esquerdo',
              'coxa_direita',
              'coxa_esquerda',
              'panturrilha_direita',
              'panturrilha_esquerda',
            ].includes(k)
          )
          .map(([k, v]) => (
            <Text key={k} style={styles.measureText}>
              {k.replace(/_/g, ' ')}: {v ?? '--'} cm
            </Text>
          ))}

        {observacoes && (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.measureText}>{observacoes}</Text>
          </>
        )}
      </View>

      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#144272' }]}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={18} color="#fff" />
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 3,
  },
  label: { fontSize: 15, color: '#144272', fontWeight: 'bold', marginTop: 8 },
  value: { fontSize: 15, color: '#333', marginTop: 2 },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 3,
  },
  chartTitle: {
    color: '#144272',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#144272',
    marginTop: 10,
    marginBottom: 4,
  },
  measureText: { color: '#333', fontSize: 14, marginBottom: 2 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  errorText: { color: '#fff', textAlign: 'center', marginTop: 60, fontSize: 16 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
