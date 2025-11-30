import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function BackupsAdmin() {
  const [loading, setLoading] = useState(false);

  async function criarBackup() {
    Alert.alert('Backup', 'Deseja gerar um novo backup agora?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            setLoading(true);
            await api.post('/admin/backups/criar');
            Alert.alert('Sucesso', 'Backup criado com sucesso!');
          } catch {
            Alert.alert('Erro', 'Falha ao criar backup.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  async function restaurarBackup() {
    Alert.alert('Restauração', 'Deseja restaurar o último backup?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            setLoading(true);
            await api.post('/admin/backups/restaurar');
            Alert.alert('Sucesso', 'Backup restaurado com sucesso!');
          } catch {
            Alert.alert('Erro', 'Falha ao restaurar backup.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gerenciamento de Backups</Text>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#007BFF' }]}
        onPress={criarBackup}
        disabled={loading}
      >
        <Icon name="save" size={28} color="#fff" />
        <Text style={styles.cardText}>
          {loading ? 'Gerando backup...' : 'Criar Backup'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: '#22c55e' }]}
        onPress={restaurarBackup}
        disabled={loading}
      >
        <Icon name="history" size={28} color="#fff" />
        <Text style={styles.cardText}>
          {loading ? 'Restaurando...' : 'Restaurar Backup'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '90%',
    paddingVertical: 20,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
