import { FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import GraficoBarras from "../../components/GraficoBarras";
import GraficoPizza from "../../components/GraficoPizza";
import api from "../../services/api";

export default function ProgressoGeralScreen() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]); // lista de alunos encontrados
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [aluno, setAluno] = useState(null);
  const [loading, setLoading] = useState(false);
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);

  // === BUSCAR ALUNO PELO NOME ===
  async function buscarAluno() {
    if (!busca.trim()) {
      return Alert.alert("Atenção", "Digite o nome do aluno para buscar.");
    }

    setLoading(true);
    setResultados([]);
    setAluno(null);
    setAvaliacoes([]);

    try {
      const res = await api.get(`/avaliacoes/buscar-aluno?nome=${encodeURIComponent(busca)}`);
      const lista = res.data || [];

      if (!lista.length) {
        Alert.alert("Aviso", "Nenhum aluno encontrado com esse nome.");
        return;
      }

      setResultados(lista);
    } catch (err) {
      console.log("Erro ao buscar alunos:", err?.response?.data || err.message);
      Alert.alert("Erro", "Falha ao buscar alunos.");
    } finally {
      setLoading(false);
    }
  }

  // === AO SELECIONAR UM ALUNO ===
  async function selecionarAluno(item) {
    setCarregandoAvaliacoes(true);
    setAluno(item);
    setResultados([]);

    try {
      const res = await api.get(`/avaliacoes/evolucao/${item.id_usuario}`);
      const dados = res.data || {};
      setAvaliacoes(dados.avaliacoes || []);
    } catch (err) {
      console.log("Erro ao buscar progresso do aluno:", err?.response?.data || err.message);
      Alert.alert("Erro", "Falha ao buscar progresso do aluno.");
    } finally {
      setCarregandoAvaliacoes(false);
    }
  }

  const ultima = avaliacoes[avaliacoes.length - 1];

  // === DETERMINAR O CAMPO DE PESO CORRETO ===
  const campoPeso =
    avaliacoes.length > 0
      ? avaliacoes[0].peso !== undefined
        ? "peso"
        : avaliacoes[0].peso_atual !== undefined
        ? "peso_atual"
        : null
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📈 Progresso de Alunos</Text>

      {/* CAMPO DE BUSCA */}
      <View style={styles.buscaBox}>
        <TextInput
          style={styles.input}
          placeholder="Buscar aluno por nome..."
          placeholderTextColor="#aaa"
          value={busca}
          onChangeText={setBusca}
        />
        <TouchableOpacity style={styles.botaoBusca} onPress={buscarAluno}>
          <FontAwesome5 name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFFF" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Buscando alunos...</Text>
        </View>
      )}

      {/* LISTA DE ALUNOS */}
      {!loading && resultados.length > 0 && (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id_usuario.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemAluno} onPress={() => selecionarAluno(item)}>
              <FontAwesome5 name="user" size={18} color="#00BFFF" />
              <Text style={styles.nomeAlunoLista}>{item.nome}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={<Text style={styles.listaTitulo}>Selecione um aluno:</Text>}
        />
      )}

      {/* PROGRESSO DO ALUNO */}
      {carregandoAvaliacoes && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BFFF" />
          <Text style={{ color: "#fff", marginTop: 10 }}>Carregando progresso...</Text>
        </View>
      )}

      {!carregandoAvaliacoes && aluno && (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <>
              <Text style={styles.nomeAluno}>{aluno.nome}</Text>

              {ultima && (
                <GraficoPizza
                  massa_magra={ultima.massa_magra}
                  massa_gorda={ultima.massa_gorda}
                  data={ultima.data_avaliacao}
                />
              )}

              {/* === GRÁFICOS === */}
              {campoPeso && <GraficoBarras avaliacoes={avaliacoes} campo={campoPeso} />}
              <GraficoBarras avaliacoes={avaliacoes} campo="percentual_gordura" />
              <GraficoBarras avaliacoes={avaliacoes} campo="imc" />
            </>
          }
        />
      )}
    </View>
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
  buscaBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#144272",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    fontSize: 16,
  },
  botaoBusca: {
    backgroundColor: "#00BFFF",
    padding: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  listaTitulo: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  itemAluno: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  nomeAlunoLista: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  nomeAluno: {
    color: "#00BFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
});
