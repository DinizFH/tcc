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
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';

export default function EditarAvaliacaoScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [perfil, setPerfil] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const [dados, setDados] = useState({});
  const [resultado, setResultado] = useState({ imc: 0, gordura: 0, magra: 0, gorda: 0 });

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // === CARREGAR PERFIL, ALUNOS E DADOS DA AVALIAÇÃO ===
  useEffect(() => {
    async function carregarDados() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setPerfil(perfilRes.data);

        const alunosRes = await api.get('/usuarios/alunos');
        setAlunos(Array.isArray(alunosRes.data) ? alunosRes.data : []);

        if (id) {
          const res = await api.get(`/avaliacoes/${id}`);
          const a = res.data;

          setAlunoSelecionado(a.id_aluno);
          setDados({
            idade: a.idade?.toString() || '',
            peso: a.peso?.toString() || '',
            altura: a.altura?.toString() || '',
            dobra_peitoral: a.dobra_peitoral?.toString() || '',
            dobra_triceps: a.dobra_triceps?.toString() || '',
            dobra_subescapular: a.dobra_subescapular?.toString() || '',
            dobra_biceps: a.dobra_biceps?.toString() || '',
            dobra_axilar_media: a.dobra_axilar_media?.toString() || '',
            dobra_supra_iliaca: a.dobra_supra_iliaca?.toString() || '',
            pescoco: a.pescoco?.toString() || '',
            ombro: a.ombro?.toString() || '',
            torax: a.torax?.toString() || '',
            cintura: a.cintura?.toString() || '',
            abdomen: a.abdomen?.toString() || '',
            quadril: a.quadril?.toString() || '',
            braco_direito: a.braco_direito?.toString() || '',
            braco_esquerdo: a.braco_esquerdo?.toString() || '',
            braco_d_contraido: a.braco_d_contraido?.toString() || '',
            braco_e_contraido: a.braco_e_contraido?.toString() || '',
            antebraco_direito: a.antebraco_direito?.toString() || '',
            antebraco_esquerdo: a.antebraco_esquerdo?.toString() || '',
            coxa_direita: a.coxa_direita?.toString() || '',
            coxa_esquerda: a.coxa_esquerda?.toString() || '',
            panturrilha_direita: a.panturrilha_direita?.toString() || '',
            panturrilha_esquerda: a.panturrilha_esquerda?.toString() || '',
            observacoes: a.observacoes || '',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        Alert.alert('Erro', 'Falha ao carregar informações.');
      } finally {
        setLoadingInit(false);
      }
    }

    carregarDados();
  }, [id]);

  // === ATUALIZAR CAMPOS ===
  const handleChange = (key, value) => {
    setDados((prev) => ({ ...prev, [key]: value }));
  };

  // === CÁLCULOS AUTOMÁTICOS ===
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
      const gordura = somaDobras > 0 ? somaDobras * 0.14 : 0;
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

  // === ATUALIZAR AVALIAÇÃO ===
  async function handleSalvar() {
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

      console.log('Payload enviado PUT:', payload);

      await api.put(`/avaliacoes/${id}`, payload);
      Alert.alert('Sucesso', 'Avaliação atualizada com sucesso!');
      navigation.goBack();
    } catch (err) {
      console.error('Erro ao atualizar avaliação:', err);
      Alert.alert('Erro', 'Falha ao atualizar a avaliação.');
    } finally {
      setLoading(false);
    }
  }

  // === UI ===
  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando avaliação...
        </Text>
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
          <Text style={styles.title}>Editar Avaliação Física</Text>

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

          {/* CAMPOS NUMÉRICOS */}
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={dados.peso}
            onChangeText={(v) => handleChange('peso', v)}
          />

          <Text style={styles.label}>Altura (m)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={dados.altura}
            onChangeText={(v) => handleChange('altura', v)}
          />

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
