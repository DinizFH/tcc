import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

export default function CriarAgendamentoScreen({ navigation, route }) {
  const { id } = route.params || {}; // ✅ se existir, modo edição
  const [modoEdicao, setModoEdicao] = useState(!!id);

  const [perfil, setPerfil] = useState(null);
  const [alunos, setAlunos] = useState([]);

  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [tipoAgendamento, setTipoAgendamento] = useState('');

  const [dataInicio, setDataInicio] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [horaFim, setHoraFim] = useState(null);

  const [showIniDate, setShowIniDate] = useState(false);
  const [showIniTime, setShowIniTime] = useState(false);
  const [showFimDate, setShowFimDate] = useState(false);
  const [showFimTime, setShowFimTime] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // === FORMATADOR MYSQL ===
  const toMySQLDatetime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

  // === CARREGAR DADOS ===
  useEffect(() => {
    async function carregarDados() {
      try {
        const perfilRes = await api.get('/usuarios/perfil');
        setPerfil(perfilRes.data);

        const alunosRes = await api.get('/usuarios/alunos');
        setAlunos(Array.isArray(alunosRes.data) ? alunosRes.data : []);

        // 🔹 Se for edição, buscar dados do agendamento
        if (modoEdicao && id) {
          const agRes = await api.get(`/agendamentos/${id}`);
          const a = agRes.data;
          console.log('Agendamento carregado para edição:', a);

          setAlunoSelecionado(a.id_aluno);
          setTipoAgendamento(a.tipo_agendamento);

          const inicio = new Date(a.data_hora_inicio);
          const fim = new Date(a.data_hora_fim);

          setDataInicio(inicio);
          setHoraInicio(inicio);
          setDataFim(fim);
          setHoraFim(fim);
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        Alert.alert('Erro', 'Falha ao carregar informações.');
      } finally {
        setLoadingInit(false);
      }
    }

    carregarDados();
  }, [id]);

  // === OPÇÕES DE TIPO ===
  const tiposPorUsuario = () => {
    if (perfil?.tipo_usuario === 'personal') {
      return [
        { label: 'Selecione o tipo de agendamento', value: '' },
        { label: 'Treino', value: 'Treino' },
        { label: 'Avaliação', value: 'Avaliação' },
      ];
    }
    if (perfil?.tipo_usuario === 'nutricionista') {
      return [
        { label: 'Selecione o tipo de agendamento', value: '' },
        { label: 'Consulta', value: 'Consulta' },
        { label: 'Avaliação', value: 'Avaliação' },
      ];
    }
    return [
      { label: 'Selecione o tipo de agendamento', value: '' },
      { label: 'Consulta', value: 'Consulta' },
      { label: 'Avaliação', value: 'Avaliação' },
      { label: 'Treino', value: 'Treino' },
    ];
  };

  const juntarDataHora = (d, h) => {
    if (!d || !h) return null;
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      h.getHours(),
      h.getMinutes(),
      0,
      0
    );
  };

  // === SALVAR (CRIAR / EDITAR) ===
  async function handleSalvar() {
    if (!alunoSelecionado) {
      Alert.alert('Atenção', 'Selecione um aluno.');
      return;
    }
    if (!tipoAgendamento) {
      Alert.alert('Atenção', 'Selecione o tipo de agendamento.');
      return;
    }
    if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
      Alert.alert('Atenção', 'Defina data e hora de início e término.');
      return;
    }

    const inicio = juntarDataHora(dataInicio, horaInicio);
    const fim = juntarDataHora(dataFim, horaFim);

    if (fim <= inicio) {
      Alert.alert('Atenção', 'O horário de término deve ser após o início.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        id_aluno: Number(alunoSelecionado),
        id_profissional: perfil?.id_usuario || perfil?.id,
        tipo_agendamento: tipoAgendamento,
        data_hora_inicio: toMySQLDatetime(inicio),
        data_hora_fim: toMySQLDatetime(fim),
      };

      console.log(modoEdicao ? 'Atualizando:' : 'Criando:', payload);

      if (modoEdicao) {
        await api.put(`/agendamentos/${id}`, payload);
        Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
      } else {
        await api.post('/agendamentos/', payload);
        Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      Alert.alert('Erro', 'Falha ao salvar agendamento.');
    } finally {
      setLoading(false);
    }
  }

  // === FORMATADORES ===
  const formatarData = (d) =>
    d
      ? `${String(d.getDate()).padStart(2, '0')}/${String(
          d.getMonth() + 1
        ).padStart(2, '0')}/${d.getFullYear()}`
      : '--/--/----';
  const formatarHora = (d) =>
    d
      ? `${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}`
      : '--:--';

  // === UI ===
  if (loadingInit) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Carregando informações...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>
            {modoEdicao ? 'Editar Agendamento' : 'Novo Agendamento'}
          </Text>

          {/* Aluno */}
          <View style={styles.field}>
            <Text style={styles.label}>Aluno</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={alunoSelecionado}
                onValueChange={(v) => setAlunoSelecionado(Number(v))}
                style={styles.picker}
              >
                <Picker.Item label="Selecione um aluno..." value={null} />
                {alunos.map((a) => (
                  <Picker.Item
                    key={a.id_usuario}
                    label={a.nome}
                    value={Number(a.id_usuario)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Tipo */}
          <View style={styles.field}>
            <Text style={styles.label}>Tipo de Agendamento</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tipoAgendamento}
                onValueChange={(v) => setTipoAgendamento(v)}
                style={styles.picker}
              >
                {tiposPorUsuario().map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Início */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>Data Início</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowIniDate(true)}
              >
                <Icon name="calendar-alt" size={16} color="#144272" />
                <Text style={styles.selectorText}>
                  {formatarData(dataInicio)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>Hora Início</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowIniTime(true)}
              >
                <Icon name="clock" size={16} color="#144272" />
                <Text style={styles.selectorText}>
                  {formatarHora(horaInicio)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Fim */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 6 }]}>
              <Text style={styles.label}>Data Fim</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowFimDate(true)}
              >
                <Icon name="calendar-alt" size={16} color="#144272" />
                <Text style={styles.selectorText}>
                  {formatarData(dataFim)}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.label}>Hora Fim</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowFimTime(true)}
              >
                <Icon name="clock" size={16} color="#144272" />
                <Text style={styles.selectorText}>
                  {formatarHora(horaFim)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PICKERS */}
          {showIniDate && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowIniDate(false);
                if (selected) {
                  setDataInicio(selected);
                  if (!dataFim) setDataFim(selected);
                }
              }}
            />
          )}
          {showIniTime && (
            <DateTimePicker
              value={horaInicio || new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowIniTime(false);
                if (selected) {
                  setHoraInicio(selected);
                  const fimAuto = new Date(
                    selected.getTime() + 60 * 60 * 1000
                  );
                  setHoraFim(fimAuto);
                  if (!dataFim) setDataFim(dataInicio || new Date());
                }
              }}
            />
          )}
          {showFimDate && (
            <DateTimePicker
              value={dataFim || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowFimDate(false);
                if (selected) setDataFim(selected);
              }}
            />
          )}
          {showFimTime && (
            <DateTimePicker
              value={horaFim || new Date()}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowFimTime(false);
                if (selected) setHoraFim(selected);
              }}
            />
          )}

          {/* BOTÕES */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check" size={18} color="#fff" />
                <Text style={styles.buttonText}>
                  {modoEdicao ? 'Salvar Alterações' : 'Criar Agendamento'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={16} color="#144272" />
            <Text style={styles.cancelText}>Voltar</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A2647',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#144272',
    marginBottom: 20,
  },
  field: { width: '100%', marginBottom: 14 },
  label: { color: '#144272', fontWeight: '600', marginBottom: 6 },
  pickerContainer: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: { height: 50, width: '100%', color: '#000' },
  row: { flexDirection: 'row', width: '100%' },
  selector: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: { marginLeft: 8, fontSize: 16, color: '#000' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#144272',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  cancelText: {
    color: '#144272',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
