import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RegistroTreinoService from './RegistroTreinoService';

export default function SelecionarPlanoModal({ visible, idAluno, onClose, onSelecionar }) {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      if (!visible || !idAluno) return;
      setLoading(true);
      try {
        const data = await RegistroTreinoService.planosDoAluno(idAluno);
        if (!cancel) setPlanos(data);
      } catch {
        if (!cancel) setPlanos([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, [visible, idAluno]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.titulo}>Selecionar Plano</Text>

          <ScrollView style={{ maxHeight: 320 }}>
            {loading ? (
              <ActivityIndicator color="#7A3AED" />
            ) : planos.length === 0 ? (
              <Text style={styles.vazio}>Nenhum plano de treino encontrado.</Text>
            ) : planos.map(p => (
              <TouchableOpacity key={p.id_plano} style={styles.item} onPress={() => onSelecionar(p)}>
                <Text style={styles.nome}>{p.nome_plano || 'Sem nome'}</Text>
                {p.data_criacao && <Text style={styles.sub}>Criado em {new Date(p.data_criacao).toLocaleDateString('pt-BR')}</Text>}
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
  item:{ paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#E5E7EB' },
  nome:{ fontWeight:'600', color:'#111827' },
  sub:{ color:'#6B7280', fontSize:12 },
  vazio:{ textAlign:'center', color:'#6B7280', marginVertical:12 },
  btnFechar:{ backgroundColor:'#144272', padding:12, borderRadius:8, marginTop:12, alignItems:'center' },
  btnFecharTxt:{ color:'#fff', fontWeight:'600' },
});
