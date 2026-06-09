import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReservationScreen } from './src/screens/ReservationScreen';
import { DirectorRoomsScreen } from './src/screens/DirectorRoomsScreen';
import { DirectionScreen } from './src/screens/DirectionScreen';
import { DirectorReservationsScreen } from './src/screens/DirectorReservationsScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Reservation: { reservationId?: number } | undefined;
  Dashboard: undefined;
  Direction: undefined;
  DirectorRooms: undefined;
  DirectorReservations: undefined;
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

function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FB' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={require('./src/screens/DashboardScreen').DashboardScreen} />
          <Stack.Screen name="Direction" component={DirectionScreen} />
          <Stack.Screen name="DirectorRooms" component={DirectorRoomsScreen} />
          <Stack.Screen name="DirectorReservations" component={DirectorReservationsScreen} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
