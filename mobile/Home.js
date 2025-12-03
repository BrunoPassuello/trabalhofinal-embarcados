import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'http://10.158.215.41:8000';

export default function HomeScreen({ navigation }) {
  const [distanciaInput, setDistanciaInput] = useState('20');
  const [distanciaAtual, setDistanciaAtual] = useState(0);
  const [distanciaEstipulada, setDistanciaEstipulada] = useState(20);
  const [lightStatus, setLightStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch(`${BACKEND_URL}/Configuracao`)
        .then(response => response.json())
        .then(json => {
          setDistanciaEstipulada(json.distancia);
          setLightStatus(json.light === 1);
          setLoading(false);
        })
        .catch(error => {
          console.log("Erro ao carregar configuração", error);
          setLoading(false);
        });

      fetch(`${BACKEND_URL}/Logs`)
        .then(response => response.json())
        .then(json => {
          if (json.length > 0) {
            setDistanciaAtual(json[0].distancia);
          }
        })
        .catch(error => {
          console.log("Erro ao carregar logs", error);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 500);
    return () => clearInterval(interval);
  }, []);

  const atualizarDistancia = () => {
    fetch(`${BACKEND_URL}/Configuracao`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({distancia: parseInt(distanciaInput)})
    })
    .then(response => response.text())
    .then(text => {
      alert('Distância atualizada com sucesso!');
      setDistanciaEstipulada(parseInt(distanciaInput));
    })
    .catch(error => alert("Erro ao atualizar distância"));
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
      <Text style={styles.title}>Sistema de Cancela</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Distância Atual (Sensor):</Text>
        <View style={styles.displayBox}>
          <Text style={styles.displayText}>{distanciaAtual} cm</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Distância Limite Configurada:</Text>
        <View style={styles.displayBox}>
          <Text style={styles.displayText}>{distanciaEstipulada} cm</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Alterar Distância Limite:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={distanciaInput}
          onChangeText={setDistanciaInput}
          placeholder="Digite a nova distância"
        />
        <Button title="Atualizar Distância" onPress={atualizarDistancia} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status do LED:</Text>
        <View style={[styles.led, lightStatus ? styles.ledOn : styles.ledOff]}>
          <Text style={styles.ledText}>{lightStatus ? 'LIGADO' : 'DESLIGADO'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Button title="Ver Histórico de Logs" onPress={() => navigation.navigate('Logs')} />
      </View>

      {/* ← NOVOS BOTÕES */}
      <View style={styles.section}>
        <Button 
          title="Ver Histórico de Aberturas" 
          onPress={() => navigation.navigate('Aberturas')} 
          color="#4CAF50"
        />
      </View>

      <View style={styles.section}>
        <Button 
          title="Ver Histórico de Configurações" 
          onPress={() => navigation.navigate('Configuracoes')} 
          color="#FF9800"
        />
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  displayBox: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  displayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  led: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  ledOn: {
    backgroundColor: '#00ff00',
  },
  ledOff: {
    backgroundColor: '#888',
  },
  ledText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});
