import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const res = await api.get('/admin/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      Alert.alert('Erro', 'Falha ao carregar lista de usuários.');
    }
  }

  async function desativarUsuario(id) {
    Alert.alert(
      'Confirmação',
      'Deseja realmente desativar este usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/usuarios/${id}`);
              carregarUsuarios();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível desativar o usuário.');
            }
          },
        },
      ]
    );
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    filtro ? u.tipo_usuario === filtro : true
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuários do Sistema</Text>

      {/* FILTRO */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtro === '' && styles.filterSelected,
          ]}
          onPress={() => setFiltro('')}
        >
          <Text style={styles.filterText}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtro === 'aluno' && styles.filterSelected,
          ]}
          onPress={() => setFiltro('aluno')}
        >
          <Text style={styles.filterText}>Alunos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtro === 'personal' && styles.filterSelected,
          ]}
          onPress={() => setFiltro('personal')}
        >
          <Text style={styles.filterText}>Personais</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filtro === 'nutricionista' && styles.filterSelected,
          ]}
          onPress={() => setFiltro('nutricionista')}
        >
          <Text style={styles.filterText}>Nutricionistas</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE USUÁRIOS */}
      <ScrollView contentContainerStyle={styles.list}>
        {usuariosFiltrados.map((u) => (
          <View key={u.id} style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{u.nome}</Text>
              <Text style={styles.cardSubtitle}>{u.email}</Text>
              <Text style={styles.cardTag}>
                {u.tipo_usuario?.toUpperCase()} •{' '}
                {u.ativo ? 'Ativo' : 'Inativo'}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => desativarUsuario(u.id)}
                style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
              >
                <Icon name="ban" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Redefinir senha',
                    `Deseja redefinir a senha de ${u.nome}?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Confirmar',
                        onPress: async () => {
                          try {
                            await api.put(`/admin/usuarios/${u.id}/senha`, {
                              nova_senha: '123456',
                            });
                            Alert.alert(
                              'Sucesso',
                              'Senha redefinida para "123456".'
                            );
                          } catch {
                            Alert.alert('Erro', 'Falha ao redefinir senha.');
                          }
                        },
                      },
                    ]
                  )
                }
                style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
              >
                <Icon name="key" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {usuariosFiltrados.length === 0 && (
          <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2647',
    padding: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#144272',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  filterSelected: {
    backgroundColor: '#1E88E5',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  list: {
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  cardTitle: {
    color: '#144272',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#555',
    fontSize: 14,
  },
  cardTag: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
});
