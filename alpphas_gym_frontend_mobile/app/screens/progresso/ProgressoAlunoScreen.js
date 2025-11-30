import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import GraficoBarras from "../../components/GraficoBarras";
import GraficoPizza from "../../components/GraficoPizza";
import api from "../../services/api";

export default function ProgressoAlunoScreen() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarAvaliacoes() {
      try {
        const res = await api.get("/avaliacoes/");
        setAvaliacoes(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
        Alert.alert("Erro", "Falha ao carregar dados de progresso.");
      } finally {
        setLoading(false);
      }
    }
    carregarAvaliacoes();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Carregando progresso...</Text>
      </View>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma avaliação encontrada.</Text>
      </View>
    );
  }

  const ultima = avaliacoes[avaliacoes.length - 1];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📊 Meu Progresso</Text>

      {ultima && (
        <GraficoPizza
          massa_magra={ultima.massa_magra}
          massa_gorda={ultima.massa_gorda}
          data={ultima.data_avaliacao}
        />
      )}

      <GraficoBarras avaliacoes={avaliacoes} campo="peso" />
      <GraficoBarras avaliacoes={avaliacoes} campo="percentual_gordura" />
      <GraficoBarras avaliacoes={avaliacoes} campo="imc" />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A2647",
    padding: 10,
  },
  titulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A2647",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A2647",
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
  },
});
