import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';

export default function ConfigAdmin() {
  const [emailSuporte, setEmailSuporte] = useState('');
  const [telefoneSuporte, setTelefoneSuporte] = useState('');

  async function salvarConfiguracoes() {
    try {
      await api.put('/admin/config', {
        email_suporte: emailSuporte,
        telefone_suporte: telefoneSuporte,
      });
      Alert.alert('Sucesso', 'Configurações atualizadas.');
    } catch {
      Alert.alert('Erro', 'Falha ao salvar configurações.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações do Sistema</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail de Suporte"
        placeholderTextColor="#888"
        value={emailSuporte}
        onChangeText={setEmailSuporte}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone de Suporte"
        placeholderTextColor="#888"
        value={telefoneSuporte}
        onChangeText={setTelefoneSuporte}
      />

      <TouchableOpacity style={styles.button} onPress={salvarConfiguracoes}>
        <Text style={styles.buttonText}>Salvar Configurações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#144272',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
