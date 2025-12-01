import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../services/api';

export default function PerfilScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const res = await api.get('/usuarios/perfil');
        const data = res.data;
        setCpf(data.cpf || '');
        setDataNascimento(data.data_nascimento || '');
        setEndereco(data.endereco || '');
        setTelefone(data.telefone || '');
        setWhatsapp(data.whatsapp || '');
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        Alert.alert('Erro', 'Não foi possível carregar o perfil.');
      } finally {
        setLoading(false);
      }
    }
    carregarPerfil();
  }, []);

  async function handleSalvar() {
    if (!cpf || cpf.length < 11) return Alert.alert('Atenção', 'Informe um CPF válido.');
    if (!dataNascimento) return Alert.alert('Atenção', 'Informe sua data de nascimento.');
    if (!endereco) return Alert.alert('Atenção', 'Informe seu endereço.');
    if (!whatsapp) return Alert.alert('Atenção', 'Informe seu número de WhatsApp.');

    const form = new FormData();
    form.append('cpf', cpf);
    form.append('data_nascimento', dataNascimento);
    form.append('endereco', endereco);
    form.append('telefone', telefone);
    form.append('whatsapp', whatsapp);

    try {
      setSaving(true);
      await api.put('/usuarios/completar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <Text style={styles.label}>CPF</Text>
      <TextInput
        style={styles.input}
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        placeholder="00000000000"
      />

      <Text style={styles.label}>Data de Nascimento</Text>
      <TextInput
        style={styles.input}
        value={dataNascimento}
        onChangeText={setDataNascimento}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Endereço</Text>
      <TextInput
        style={styles.input}
        value={endereco}
        onChangeText={setEndereco}
        placeholder="Rua, número, bairro..."
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
        placeholder="(xx) xxxx-xxxx"
      />

      <Text style={styles.label}>WhatsApp</Text>
      <TextInput
        style={styles.input}
        value={whatsapp}
        onChangeText={setWhatsapp}
        keyboardType="phone-pad"
        placeholder="(xx) 9xxxx-xxxx"
      />

      <TouchableOpacity style={styles.button} onPress={handleSalvar} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  label: { marginTop: 10, fontSize: 14, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a84ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
