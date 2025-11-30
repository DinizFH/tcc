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
import api from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: 'aluno',
    cref: '',
    crn: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRegister = async () => {
    const { nome, email, senha, tipo_usuario, cref, crn } = formData;
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const payload = { nome, email, senha, tipo_usuario };
    if (tipo_usuario === 'personal') payload.cref = cref;
    if (tipo_usuario === 'nutricionista') payload.crn = crn;

    try {
      setLoading(true);
      const response = await api.post('/auth/register', payload);

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        navigation.replace('Login');
      }
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.msg?.toLowerCase?.() || '';

      // 🧠 Tratamento de mensagens personalizadas
      if (status === 409 || msg.includes('já existe') || msg.includes('duplicado')) {
        Alert.alert('Usuário já cadastrado', 'O e-mail informado já está em uso.');
      } else if (status === 400 || msg.includes('inválido')) {
        Alert.alert('Usuário já cadastrado', 'Verifique os dados informados e tente novamente.');
      } else {
        Alert.alert('Erro', 'Falha ao registrar. Verifique os dados e tente novamente.');
      }

      // Log leve apenas no modo desenvolvimento
      if (__DEV__) {
        console.log('Erro no registro:', msg || status);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Crie sua conta</Text>

          {/* CAMPOS BÁSICOS */}
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={formData.nome}
            onChangeText={(value) => handleChange('nome', value)}
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha (mín. 6 caracteres)"
            secureTextEntry
            value={formData.senha}
            onChangeText={(value) => handleChange('senha', value)}
            placeholderTextColor="#888"
          />

          {/* SELEÇÃO DE TIPO DE USUÁRIO */}
          <View style={styles.selectContainer}>
            <TouchableOpacity
              style={[
                styles.selectButton,
                formData.tipo_usuario === 'aluno' && styles.selectActive,
              ]}
              onPress={() => handleChange('tipo_usuario', 'aluno')}
            >
              <Text
                style={[
                  styles.selectText,
                  formData.tipo_usuario === 'aluno' && styles.selectTextActive,
                ]}
              >
                Aluno
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectButton,
                formData.tipo_usuario === 'personal' && styles.selectActive,
              ]}
              onPress={() => handleChange('tipo_usuario', 'personal')}
            >
              <Text
                style={[
                  styles.selectText,
                  formData.tipo_usuario === 'personal' && styles.selectTextActive,
                ]}
              >
                Personal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectButton,
                formData.tipo_usuario === 'nutricionista' && styles.selectActive,
              ]}
              onPress={() => handleChange('tipo_usuario', 'nutricionista')}
            >
              <Text
                style={[
                  styles.selectText,
                  formData.tipo_usuario === 'nutricionista' && styles.selectTextActive,
                ]}
              >
                Nutricionista
              </Text>
            </TouchableOpacity>
          </View>

          {/* CAMPOS ADICIONAIS */}
          {formData.tipo_usuario === 'personal' && (
            <TextInput
              style={styles.input}
              placeholder="CREF"
              value={formData.cref}
              onChangeText={(value) => handleChange('cref', value)}
              placeholderTextColor="#888"
            />
          )}

          {formData.tipo_usuario === 'nutricionista' && (
            <TextInput
              style={styles.input}
              placeholder="CRN"
              value={formData.crn}
              onChangeText={(value) => handleChange('crn', value)}
              placeholderTextColor="#888"
            />
          )}

          {/* BOTÃO DE REGISTRO */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registrando...' : 'Registrar'}
            </Text>
          </TouchableOpacity>

          {/* LINK LOGIN */}
          <Text style={styles.footerText}>
            Já tem uma conta?{' '}
            <Text style={styles.link} onPress={() => navigation.replace('Login')}>
              Entrar
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
    maxWidth: 420,
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
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
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
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  selectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectActive: {
    borderColor: '#144272',
    backgroundColor: '#E3EBF8',
  },
  selectText: {
    fontSize: 14,
    color: '#555',
  },
  selectTextActive: {
    color: '#144272',
    fontWeight: 'bold',
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
