import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

const BACKEND_URL = 'http://10.158.215.41:8000';

export default function ConfiguracoesScreen() {
  const [configuracoes, setConfiguracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConfiguracoes = () => {
    fetch(`${BACKEND_URL}/HistoricoConfiguracoes`)
      .then(response => response.json())
      .then(json => {
        setConfiguracoes(json);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.log("Erro ao carregar configurações", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchConfiguracoes();
    const interval = setInterval(fetchConfiguracoes, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConfiguracoes();
  };

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Total de alterações: {configuracoes.length}
      </Text>
      <FlatList
        data={configuracoes}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item, index}) => (
          <View style={styles.configItem}>
            <Text style={styles.configDistancia}>
              Distância: {item.distancia} cm
            </Text>
            <Text style={styles.configData}>
              {formatarData(item.timestamp)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF9800',
  },
  configItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  configDistancia: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  configData: {
    fontSize: 14,
    color: '#666',
  },
});
