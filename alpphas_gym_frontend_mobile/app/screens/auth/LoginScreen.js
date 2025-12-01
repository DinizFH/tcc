import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth(); 

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, senha });

      console.log('Resposta do login:', res.data);

      // Compatível com backend Flask
      const token = res.data.access_token || res.data.token || null;
      const tipo = res.data.tipo_usuario || res.data.tipo || 'aluno';

      if (!token) {
        Alert.alert('Erro', 'Token não recebido do servidor.');
        return;
      }

      // Usa o AuthContext para autenticar globalmente
      await login({ token, tipo });
    } catch (err) {
      console.error('Erro no login:', err?.response?.data || err.message);

      const status = err?.response?.status;
      const msg = err?.response?.data?.msg?.toLowerCase?.() || '';

      if (status === 404 || msg.includes('não encontrado')) {
        Alert.alert('Usuário não cadastrado', 'Verifique o e-mail informado.');
      } else if (status === 401 || msg.includes('senha incorreta')) {
        Alert.alert('Senha incorreta', 'Verifique sua senha e tente novamente.');
      } else {
        Alert.alert('Erro', 'Falha no login. Verifique suas credenciais.');
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {/* LOGO */}
          <Image
            source={require('../../../assets/alpphas_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* TÍTULO */}
          <Text style={styles.title}>Entrar</Text>

          {/* INPUTS */}
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            placeholderTextColor="#888"
          />

          {/* BOTÃO */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          {/* LINK DE CADASTRO */}
          <Text style={styles.footerText}>
            Não tem uma conta?{' '}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate('Register')}
            >
              Cadastre-se
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#144272',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 18,
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#144272',
    fontWeight: 'bold',
  },
});
