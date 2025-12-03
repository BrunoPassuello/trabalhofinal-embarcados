import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Home';
import LogsScreen from './Logs';
import AberturasScreen from './Aberturas';
import ConfiguracoesScreen from './Configuracoes';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Controle de Cancela'}} />
        <Stack.Screen name="Logs" component={LogsScreen} options={{title: 'Histórico de Logs'}} />
        <Stack.Screen name="Aberturas" component={AberturasScreen} options={{title: 'Histórico de Aberturas'}} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{title: 'Histórico de Configurações'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
