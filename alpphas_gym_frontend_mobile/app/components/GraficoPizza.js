import { Dimensions, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-chart-kit";

export default function GraficoPizza({ massa_magra = 0, massa_gorda = 0, data }) {
  const magra = parseFloat(massa_magra) || 0;
  const gorda = parseFloat(massa_gorda) || 0;
  const total = magra + gorda || 1;
  const percentMagra = ((magra / total) * 100).toFixed(1);
  const percentGorda = ((gorda / total) * 100).toFixed(1);

  const dataGrafico = [
    {
      name: `Massa Magra (${percentMagra}%)`,
      population: magra,
      color: "#2ECC71",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
    {
      name: `Massa Gorda (${percentGorda}%)`,
      population: gorda,
      color: "#E74C3C",
      legendFontColor: "#333",
      legendFontSize: 13,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Composição Corporal</Text>

      <PieChart
        data={dataGrafico}
        width={Dimensions.get("window").width - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"8"}
        absolute
      />

      {data && (
        <Text style={styles.subtitle}>
          Avaliação em {new Date(data).toLocaleDateString("pt-BR")}
        </Text>
      )}
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#144272",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 8,
  },
});
