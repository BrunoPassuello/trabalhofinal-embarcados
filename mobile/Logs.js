import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';

const BACKEND_URL = 'http://10.158.215.41:8000';

export default function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = () => {
    fetch(`${BACKEND_URL}/Logs`)
      .then(response => response.json())
      .then(json => {
        setLogs(json);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(error => {
        console.log("Erro ao carregar logs", error);
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({item}) => (
          <View style={styles.logItem}>
            <Text style={styles.logText}>Distância: {item.distancia} cm</Text>
            <Text style={styles.logText}>Limite: {item.distancia_estipulada} cm</Text>
            <Text style={styles.logDate}>{item.timestamp}</Text>
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
  logItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logText: {
    fontSize: 16,
    marginBottom: 5,
  },
  logDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
