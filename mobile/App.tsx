import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReservationScreen } from './src/screens/ReservationScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Reservation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F7FB',
    card: '#FFFFFF',
    text: '#162033',
    primary: '#1E3A8A',
    border: '#D8E0EE',
    notification: '#1E3A8A',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
