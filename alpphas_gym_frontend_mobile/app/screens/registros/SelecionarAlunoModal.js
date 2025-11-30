// app/screens/registros/SelecionarAlunoModal.js
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function SelecionarAlunoModal({ visible, onClose, onSelecionar }) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (!visible) return;
      if (busca.trim().length < 2) {
        setResultados([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/avaliacoes/buscar-aluno?nome=${encodeURIComponent(busca)}`);
        if (!cancel) setResultados(res.data || []);
      } catch (e) {
        if (!cancel) setResultados([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    const t = setTimeout(run, 300);
    return () => { clearTimeout(t); cancel = true; };
  }, [busca, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.titulo}>Selecionar Aluno</Text>
          <View style={styles.search}>
            <Icon name="search" size={16} color="#6B7280" />
            <TextInput
              placeholder="Digite o nome do aluno..."
              style={styles.input}
              value={busca}
              onChangeText={setBusca}
            />
          </View>

          <ScrollView style={{ maxHeight: 300 }}>
            {loading ? (
              <ActivityIndicator color="#7A3AED" />
            ) : resultados.length === 0 ? (
              <Text style={styles.vazio}>Digite ao menos 2 letras para buscar.</Text>
            ) : resultados.map(a => (
              <TouchableOpacity key={a.id_usuario} style={styles.item} onPress={() => onSelecionar(a)}>
                <Text style={styles.nome}>{a.nome}</Text>
                <Text style={styles.sub}>{a.cpf}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.btnFechar} onPress={onClose}>
            <Text style={styles.btnFecharTxt}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  box:{ width:'90%', backgroundColor:'#fff', borderRadius:12, padding:16 },
  titulo:{ fontSize:18, fontWeight:'bold', color:'#111827', marginBottom:10 },
  search:{ flexDirection:'row', alignItems:'center', backgroundColor:'#F3F4F6', paddingHorizontal:10, borderRadius:8, marginBottom:10, gap:8 },
  input:{ flex:1, paddingVertical:8, fontSize:15 },
  item:{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
  nome:{ fontWeight:'600', color:'#111827' },
  sub:{ color:'#6B7280', fontSize:12 },
  vazio:{ textAlign:'center', color:'#6B7280', marginVertical:12 },
  btnFechar:{ backgroundColor:'#144272', padding:12, borderRadius:8, marginTop:12, alignItems:'center' },
  btnFecharTxt:{ color:'#fff', fontWeight:'600' },
});
