import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Accueil</Text>
      <Text style={styles.text}>Accès rapide aux prochaines réservations et au planning.</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Reservation')}>
        <Text style={styles.buttonText}>Créer une réservation</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FB' },
  title: { fontSize: 28, fontWeight: '800', color: '#162033', marginBottom: 8 },
  text: { fontSize: 16, color: '#52627D', marginBottom: 24 },
  button: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 16 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
