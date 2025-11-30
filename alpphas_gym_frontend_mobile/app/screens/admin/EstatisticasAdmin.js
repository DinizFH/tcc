import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';

export default function EstatisticasAdmin() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    async function carregarEstatisticas() {
      try {
        const res = await api.get('/admin/estatisticas');
        setStats(res.data || {});
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        Alert.alert('Erro', 'Falha ao carregar estatísticas.');
      }
    }
    carregarEstatisticas();
  }, []);

  const cards = [
    { title: 'Total de Usuários', icon: 'users', color: '#3b82f6', value: stats.usuarios },
    { title: 'Alunos Ativos', icon: 'user-graduate', color: '#22c55e', value: stats.alunos },
    { title: 'Personais', icon: 'user-tie', color: '#f97316', value: stats.personais },
    { title: 'Nutricionistas', icon: 'user-md', color: '#8b5cf6', value: stats.nutricionistas },
    { title: 'Treinos Criados', icon: 'dumbbell', color: '#ef4444', value: stats.treinos },
    { title: 'Planos Alimentares', icon: 'apple-alt', color: '#06b6d4', value: stats.planos },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>Estatísticas Gerais</Text>
      {cards.map((card, i) => (
        <View key={i} style={styles.card}>
          <Icon name={card.icon} size={28} color={card.color} />
          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardValue}>{card.value ?? 0}</Text>
          </View>
        </View>
      ))}
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
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
  },
  cardTextBox: { marginLeft: 16 },
  cardTitle: { color: '#144272', fontSize: 16, fontWeight: 'bold' },
  cardValue: { color: '#007BFF', fontSize: 20, marginTop: 4 },
});
