// app/screens/registros/EditarRegistroTreinoScreen.js
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RegistroTreinoService from './RegistroTreinoService';

export default function EditarRegistroTreinoScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { id_registro } = params || {};

  const [registro, setRegistro] = useState(null);
  const [cargas, setCargas] = useState({});
  const [observacoes, setObservacoes] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await RegistroTreinoService.buscarPorId(id_registro);
        setRegistro(data);
        setObservacoes(data.observacoes || '');
        const base = {};
        (data.exercicios || []).forEach(ex => { base[ex.id_exercicio] = ex.carga ?? ''; });
        setCargas(base);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o registro.');
        navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
      } finally {
        setCarregando(false);
      }
    }
    load();
  }, [id_registro, navigation]);

  const onChangeCarga = (id_exercicio, valor) => setCargas(prev => ({ ...prev, [id_exercicio]: valor }));

  const salvar = async () => {
    try {
      const payload = {
        observacoes,
        cargas: Object.entries(cargas).map(([id_exercicio, carga]) => ({
          id_exercicio: Number(id_exercicio),
          carga: String(carga ?? '').trim() || null,
        })),
      };
      await RegistroTreinoService.atualizar(id_registro, payload);
      Alert.alert('Sucesso', 'Registro atualizado!');
      navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar.');
    }
  };

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 8 }}>Carregando registro...</Text>
      </View>
    );
  }

  if (!registro) {
    return (
      <View style={styles.container}>
        <Text style={styles.vazio}>Registro não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Editar Registro</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Treino</Text>
        <Text style={styles.value}>{registro.nome_treino}</Text>
        {registro.nome_plano ? (<>
          <Text style={styles.label}>Plano</Text>
          <Text style={styles.value}>{registro.nome_plano}</Text>
        </>) : null}
        <Text style={styles.label}>Data</Text>
        <Text style={styles.value}>{new Date(registro.data_execucao).toLocaleString('pt-BR')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Exercícios</Text>
        {(registro.exercicios || []).length === 0 ? (
          <Text style={styles.vazio}>Nenhum exercício lançado.</Text>
        ) : (registro.exercicios || []).map(ex => (
          <View key={ex.id_exercicio} style={styles.row}>
            <View style={{ flex:1 }}>
              <Text style={styles.nomeEx}>{ex.nome}</Text>
              {ex.grupo_muscular ? <Text style={styles.sub}>{ex.grupo_muscular}</Text> : null}
            </View>
            <TextInput
              placeholder="Carga (kg)"
              style={styles.input}
              keyboardType="numeric"
              value={(cargas[ex.id_exercicio] ?? '').toString()}
              onChangeText={(v) => onChangeCarga(ex.id_exercicio, v)}
            />
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Observações</Text>
        <TextInput
          placeholder="Ajustes, ocorrências, etc."
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          style={[styles.input, { height: 80 }]}
        />
      </View>

      <TouchableOpacity style={styles.btnSalvar} onPress={salvar}>
        <Icon name="save" size={16} color="#fff" />
        <Text style={styles.btnSalvarTxt}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#F9FAFB', padding:16 },
  titulo:{ fontSize:22, fontWeight:'bold', color:'#1F2937', marginBottom:12 },
  card:{ backgroundColor:'#fff', borderRadius:10, padding:14, marginBottom:12, elevation:2 },
  label:{ fontSize:13, color:'#6B7280', marginTop:6 },
  value:{ fontSize:15, color:'#111827', fontWeight:'600' },
  subtitulo:{ fontSize:16, fontWeight:'bold', color:'#111827', marginBottom:8 },
  row:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  nomeEx:{ fontSize:15, fontWeight:'600', color:'#111827' },
  sub:{ color:'#6B7280', fontSize:12 },
  input:{ backgroundColor:'#F3F4F6', borderRadius:8, paddingHorizontal:10, paddingVertical:8, minWidth:110 },
  btnSalvar:{ flexDirection:'row', backgroundColor:'#16A34A', padding:14, borderRadius:10, justifyContent:'center', alignItems:'center', marginTop:10 },
  btnSalvarTxt:{ color:'#fff', fontWeight:'600', marginLeft:8 },
  vazio:{ textAlign:'center', color:'#6B7280', marginTop:10 },
  loading:{ flex:1, justifyContent:'center', alignItems:'center' },
});
