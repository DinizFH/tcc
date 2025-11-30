import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";

export default function GraficoBarras({ avaliacoes = [], campo }) {
  if (!avaliacoes.length) return null;

  const data = {
    labels: avaliacoes.map((a) =>
      new Date(a.data_avaliacao).toLocaleDateString("pt-BR").slice(0, 5)
    ),
    datasets: [
      {
        data: avaliacoes.map((a) => parseFloat(a[campo]) || 0),
      },
    ],
  };

  const nomeCampo = campo
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nomeCampo}</Text>

      <BarChart
        data={data}
        width={Dimensions.get("window").width - 40}
        height={220}
        fromZero
        showValuesOnTopOfBars={false}
        withInnerLines={true}
        withHorizontalLabels={true}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 1,
          barPercentage: 0.5,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          labelColor: () => "#333",
          propsForBackgroundLines: {
            strokeDasharray: "", // linhas contínuas
          },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    marginVertical: 10,
    alignItems: "center",
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#144272",
    marginBottom: 10,
  },
  chart: {
    borderRadius: 12,
  },
});
