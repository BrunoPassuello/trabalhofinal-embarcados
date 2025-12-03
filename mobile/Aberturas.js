import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

const BACKEND_URL = 'http://192.168.0.245:8000';

export default function AberturasScreen() {
  const [aberturas, setAberturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAberturas = () => {
    fetch(`${BACKEND_URL}/HistoricoAberturas`)
      .then(response => response.json())
      .then(json => {
        setAberturas(json);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.log("Erro ao carregar aberturas", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchAberturas();
    const interval = setInterval(fetchAberturas, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAberturas();
  };

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    return data.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Total de aberturas: {aberturas.length}
      </Text>
      <FlatList
        data={aberturas}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item, index}) => (
          <View style={styles.aberturaItem}>
            <Text style={styles.aberturaNumber}>Abertura #{aberturas.length - index}</Text>
            <Text style={styles.aberturaData}>{formatarData(item.timestamp)}</Text>
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
    color: '#4CAF50',
  },
  aberturaItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  aberturaNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  aberturaData: {
    fontSize: 14,
    color: '#666',
  },
});
