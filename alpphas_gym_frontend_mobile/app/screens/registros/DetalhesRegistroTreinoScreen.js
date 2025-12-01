import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';
import RegistroTreinoService from './RegistroTreinoService';

export default function DetalhesRegistroTreinoScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { id_registro } = params || {};

  const [registro, setRegistro] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const podeEditar = usuario && (usuario.tipo_usuario === 'personal' || (usuario.tipo_usuario === 'aluno' && usuario.id_usuario === registro?.id_aluno));

  useEffect(() => {
    async function load() {
      try {
        const perfil = await api.get('/usuarios/perfil');
        setUsuario(perfil.data);
        const data = await RegistroTreinoService.buscarPorId(id_registro);
        setRegistro(data);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar o registro.');
      } finally {
        setCarregando(false);
      }
    }
    load();
  }, [id_registro]);

  const excluir = () => {
    Alert.alert('Confirmar', 'Excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await RegistroTreinoService.excluir(id_registro);
          Alert.alert('Sucesso', 'Registro excluído.');
          navigation.reset({ index: 0, routes: [{ name: 'RegistrosTreino' }] });
        } catch {
          Alert.alert('Erro', 'Falha ao excluir.');
        }
      } },
    ]);
  };

  const editar = () => navigation.navigate('EditarRegistroTreino', { id_registro });

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A3AED" />
        <Text style={{ marginTop: 8 }}>Carregando...</Text>
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
      <Text style={styles.titulo}>Detalhes do Registro</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Treino</Text>
        <Text style={styles.value}>{registro.nome_treino}</Text>

        {registro.nome_plano ? (<>
          <Text style={styles.label}>Plano</Text>
          <Text style={styles.value}>{registro.nome_plano}</Text>
        </>) : null}

        <Text style={styles.label}>Data</Text>
        <Text style={styles.value}>{new Date(registro.data_execucao).toLocaleString('pt-BR')}</Text>

        <Text style={styles.label}>Observações</Text>
        <Text style={styles.value}>{registro.observacoes || '—'}</Text>
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
            <Text style={styles.badge}>{ex.carga ?? '—'} kg</Text>
          </View>
        ))}
      </View>

      {podeEditar && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#2563EB' }]} onPress={editar}>
            <Icon name="edit" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#DC2626' }]} onPress={excluir}>
            <Icon name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
  badge:{ backgroundColor:'#E5E7EB', borderRadius:999, paddingVertical:6, paddingHorizontal:10, color:'#111827', fontWeight:'600' },
  vazio:{ textAlign:'center', color:'#6B7280', marginTop:10 },
  actions:{ flexDirection:'row', justifyContent:'space-around', marginVertical:16 },
  btn:{ padding:12, borderRadius:10, alignItems:'center', justifyContent:'center', width:56 },
  loading:{ flex:1, justifyContent:'center', alignItems:'center' },
});
