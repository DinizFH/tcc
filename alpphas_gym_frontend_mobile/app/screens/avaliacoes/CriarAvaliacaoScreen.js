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

export default function CriarAvaliacaoScreen({ navigation }) {
  const [perfil, setPerfil] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [dados, setDados] = useState({
    idade: '',
    peso: '',
    altura: '',
    dobra_peitoral: '',
    dobra_triceps: '',
    dobra_subescapular: '',
    dobra_biceps: '',
    dobra_axilar_media: '',
    dobra_supra_iliaca: '',
    pescoco: '',
    ombro: '',
    torax: '',
    cintura: '',
    abdomen: '',
    quadril: '',
    braco_direito: '',
    braco_esquerdo: '',
    braco_d_contraido: '',
    braco_e_contraido: '',
    antebraco_direito: '',
    antebraco_esquerdo: '',
    coxa_direita: '',
    coxa_esquerda: '',
    panturrilha_direita: '',
    panturrilha_esquerda: '',
    observacoes: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [resultado, setResultado] = useState({ imc: 0, gordura: 0, magra: 0, gorda: 0 });

  // === CARREGAR PERFIL E ALUNOS ===
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

  // === ATUALIZA CAMPOS ===
  const handleChange = (key, value) => {
    setDados((prev) => ({ ...prev, [key]: value }));
  };

  // === CÁLCULOS ===
  useEffect(() => {
    const peso = parseFloat(dados.peso);
    const altura = parseFloat(dados.altura);
    const somaDobras =
      (parseFloat(dados.dobra_peitoral) || 0) +
      (parseFloat(dados.dobra_triceps) || 0) +
      (parseFloat(dados.dobra_subescapular) || 0) +
      (parseFloat(dados.dobra_biceps) || 0) +
      (parseFloat(dados.dobra_axilar_media) || 0) +
      (parseFloat(dados.dobra_supra_iliaca) || 0);

    if (peso > 0 && altura > 0) {
      const imc = peso / Math.pow(altura, 2);
      const gordura = somaDobras > 0 ? somaDobras * 0.14 : 0; // coeficiente simbólico
      const massaGorda = (peso * gordura) / 100;
      const massaMagra = peso - massaGorda;

      setResultado({
        imc: imc.toFixed(2),
        gordura: gordura.toFixed(1),
        gorda: massaGorda.toFixed(1),
        magra: massaMagra.toFixed(1),
      });
    }
  }, [dados]);

  // === SALVAR AVALIAÇÃO ===
  async function handleSalvar() {
    if (!alunoSelecionado) {
      Alert.alert('Atenção', 'Selecione um aluno.');
      return;
    }

    try {
      setLoading(true);
      const imc = parseFloat(resultado.imc) || null;
      const gordura = parseFloat(resultado.gordura) || null;
      const massa_magra = parseFloat(resultado.magra) || null;
      const massa_gorda = parseFloat(resultado.gorda) || null;

      const payload = {
        id_aluno: Number(alunoSelecionado),
        imc,
        percentual_gordura: gordura,
        massa_magra,
        massa_gorda,
        ...Object.fromEntries(
          Object.entries(dados).map(([k, v]) => [k, v === '' ? null : parseFloat(v) || v])
        ),
      };

      console.log('Payload avaliação:', payload);
      const res = await api.post('/avaliacoes/', payload);

      if (res.status === 201 || res.status === 200) {
        Alert.alert('Sucesso', 'Avaliação criada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Não foi possível criar a avaliação.');
      }
    } catch (err) {
      console.error('Erro ao criar avaliação:', err);
      Alert.alert('Erro', 'Falha ao salvar avaliação.');
    } finally {
      setLoading(false);
    }
  }

  // === UI ===
  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando informações...</Text>
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
          <Text style={styles.title}>Nova Avaliação Física</Text>

          {/* ALUNO */}
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

          {/* DADOS BÁSICOS */}
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dados.idade}
                onChangeText={(v) => handleChange('idade', v)}
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Altura (m)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dados.altura}
                onChangeText={(v) => handleChange('altura', v)}
              />
            </View>
          </View>

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={dados.peso}
            onChangeText={(v) => handleChange('peso', v)}
          />

          {/* DOBRAS */}
          <Text style={styles.section}>Dobras Cutâneas (mm)</Text>
          {[
            'dobra_peitoral',
            'dobra_triceps',
            'dobra_subescapular',
            'dobra_biceps',
            'dobra_axilar_media',
            'dobra_supra_iliaca',
          ].map((key) => {
            const label =
              key === 'dobra_supra_iliaca'
                ? 'dobra suprailíaca'
                : key.replace(/_/g, ' ');
            return (
              <TextInput
                key={key}
                placeholder={label}
                style={styles.input}
                keyboardType="numeric"
                value={dados[key]}
                onChangeText={(v) => handleChange(key, v)}
              />
            );
          })}

          {/* PERÍMETROS */}
          <Text style={styles.section}>Perímetros (cm)</Text>
          {[
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
          ].map((key) => (
            <TextInput
              key={key}
              placeholder={key.replace(/_/g, ' ')}
              style={styles.input}
              keyboardType="numeric"
              value={dados[key]}
              onChangeText={(v) => handleChange(key, v)}
            />
          ))}

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={dados.observacoes}
            onChangeText={(v) => handleChange('observacoes', v)}
          />

          {/* RESULTADOS AUTOMÁTICOS */}
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Resultados Automáticos</Text>
            <Text style={styles.resultText}>IMC: {resultado.imc}</Text>
            <Text style={styles.resultText}>Gordura: {resultado.gordura}%</Text>
            <Text style={styles.resultText}>Massa Magra: {resultado.magra} kg</Text>
            <Text style={styles.resultText}>Massa Gorda: {resultado.gorda} kg</Text>
          </View>

          {/* BOTÕES */}
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
                <Text style={styles.buttonText}>Salvar Avaliação</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldHalf: { flex: 1, marginHorizontal: 4 },
  section: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#eaf4ff',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
  },
  resultTitle: { color: '#144272', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  resultText: { color: '#144272', fontSize: 15 },
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
  cancelButton: { flexDirection: 'row', alignItems: 'center', marginTop: 18, alignSelf: 'center' },
  cancelText: { color: '#144272', fontSize: 15, fontWeight: '600', marginLeft: 6 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
