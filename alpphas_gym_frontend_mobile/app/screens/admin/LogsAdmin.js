import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../services/api';

export default function LogsAdmin() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function carregarLogs() {
      try {
        const res = await api.get('/admin/logs');
        setLogs(res.data || []);
      } catch (err) {
        console.error('Erro ao carregar logs:', err);
        Alert.alert('Erro', 'Falha ao carregar registros de log.');
      }
    }
    carregarLogs();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Logs do Sistema</Text>

      {logs.map((log, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.logUser}>{log.usuario}</Text>
          <Text style={styles.logAction}>{log.acao}</Text>
          <Text style={styles.logDate}>
            {new Date(log.data).toLocaleString('pt-BR')}
          </Text>
        </View>
      ))}

      {logs.length === 0 && (
        <Text style={styles.emptyText}>Nenhum log encontrado.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2647' },
  scroll: { padding: 16, paddingBottom: 60 },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 4,
  },
  logUser: { color: '#144272', fontWeight: 'bold', fontSize: 15 },
  logAction: { color: '#555', marginTop: 4 },
  logDate: { color: '#999', fontSize: 13, marginTop: 6 },
  emptyText: { color: '#ccc', textAlign: 'center', marginTop: 20 },
});
