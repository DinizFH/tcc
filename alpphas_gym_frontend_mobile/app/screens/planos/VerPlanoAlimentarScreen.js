import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../services/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import logo from '../../../assets/alpphas_logo.png'; // ✅ garante o uso da logo local

export default function VerPlanoAlimentarScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [plano, setPlano] = useState(null);
  const [loading, setLoading] = useState(true);

  // === CARREGAR PLANO ALIMENTAR ===
  useEffect(() => {
    async function carregarPlano() {
      try {
        const res = await api.get(`/planos/${id}`);
        setPlano(res.data);
      } catch (err) {
        console.error('Erro ao carregar plano:', err);
        Alert.alert('Erro', 'Falha ao carregar os dados do plano alimentar.');
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarPlano();
  }, [id]);

  // === GERAR PDF LOCAL COM LOGO ===
  async function exportarPDF() {
    try {
      if (!plano) {
        Alert.alert('Aviso', 'Plano ainda não foi carregado.');
        return;
      }

      const { nome_aluno, nome_profissional, data_criacao, refeicoes = [] } = plano;

      // Converte imagem para base64
      const logoBase64 = Image.resolveAssetSource(logo).uri;

      // Monta HTML para o PDF com estilo e logo
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
              h1 { text-align: center; color: #144272; margin-bottom: 5px; }
              h2 { color: #144272; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
              .logo { display: block; margin: 0 auto 10px auto; width: 100px; }
              .info { margin-bottom: 20px; font-size: 14px; }
              .refeicao { margin-top: 20px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; }
              .alimento { margin-left: 10px; font-size: 13px; }
              footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; }
            </style>
          </head>
          <body>
            <img src="${logoBase64}" class="logo" />
            <h1>Plano Alimentar</h1>
            <div class="info">
              <p><strong>Aluno:</strong> ${nome_aluno || 'Não informado'}</p>
              <p><strong>Nutricionista:</strong> ${nome_profissional || 'Não informado'}</p>
              <p><strong>Data:</strong> ${
                data_criacao
                  ? new Date(data_criacao).toLocaleDateString('pt-BR')
                  : '--/--/----'
              }</p>
            </div>

            ${refeicoes
              .map(
                (ref, i) => `
                <div class="refeicao">
                  <h2>${ref.titulo || `Refeição ${i + 1}`}</h2>
                  ${
                    ref.calorias_estimadas
                      ? `<p><strong>Calorias:</strong> ${ref.calorias_estimadas} kcal</p>`
                      : ''
                  }
                  <div>
                    ${
                      ref.alimentos && ref.alimentos.length
                        ? ref.alimentos
                            .map(
                              (a) =>
                                `<p class="alimento">🍽️ ${a.nome} - ${a.peso || '--'}</p>`
                            )
                            .join('')
                        : '<p class="alimento"><em>Nenhum alimento cadastrado.</em></p>'
                    }
                  </div>
                </div>`
              )
              .join('')}

            <footer>
              <p>📘 Gerado automaticamente pelo sistema <strong>Alpphas Gym</strong></p>
              <p>www.alpphasgym.com.br</p>
            </footer>
          </body>
        </html>
      `;

      // Gera o PDF localmente
      const { uri } = await Print.printToFileAsync({ html });

      // Compartilha ou abre
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('PDF Gerado', `Arquivo salvo em: ${uri}`);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando plano...</Text>
      </View>
    );
  }

  if (!plano) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Plano não encontrado.</Text>
      </View>
    );
  }

  const { nome_aluno, nome_profissional, data_criacao, refeicoes = [] } = plano;

  return (
    <ScrollView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plano Alimentar</Text>
      </View>

      {/* DADOS GERAIS */}
      <View style={styles.card}>
        <Text style={styles.label}>Aluno:</Text>
        <Text style={styles.value}>{nome_aluno || 'Não informado'}</Text>

        <Text style={styles.label}>Nutricionista:</Text>
        <Text style={styles.value}>{nome_profissional || 'Não informado'}</Text>

        <Text style={styles.label}>Data de Criação:</Text>
        <Text style={styles.value}>
          {data_criacao
            ? new Date(data_criacao).toLocaleDateString('pt-BR')
            : '--/--/----'}
        </Text>
      </View>

      {/* REFEIÇÕES */}
      {refeicoes.length > 0 ? (
        refeicoes.map((ref, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.refTitle}>
              🍽️ {ref.titulo || `Refeição ${index + 1}`}
            </Text>

            {ref.calorias_estimadas && (
              <Text style={styles.caloriasText}>
                Calorias: {ref.calorias_estimadas} kcal
              </Text>
            )}

            {ref.alimentos && ref.alimentos.length > 0 ? (
              ref.alimentos.map((a, i) => (
                <View key={i} style={styles.alimentoBox}>
                  <Icon name="utensils" size={16} color="#144272" />
                  <Text style={styles.alimentoText}>
                    {a.nome} - {a.peso || '--'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhum alimento cadastrado.</Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Nenhuma refeição cadastrada.</Text>
        </View>
      )}

      {/* BOTÕES */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#8E44AD' }]}
          onPress={exportarPDF}
        >
          <Icon name="file-pdf" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#144272' }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// === ESTILOS ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#144272',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 3,
  },
  label: {
    fontSize: 15,
    color: '#144272',
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: '#333',
    marginTop: 2,
  },
  refTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 6,
  },
  caloriasText: {
    fontSize: 14,
    color: '#E67E22',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  alimentoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alimentoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A2647',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
