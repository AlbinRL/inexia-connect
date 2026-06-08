import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ReservationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réservation</Text>
      <Text style={styles.text}>Écran à brancher sur l’API des salles et la disponibilité.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F7FB' },
  title: { fontSize: 28, fontWeight: '800', color: '#162033', marginBottom: 8 },
  text: { fontSize: 16, color: '#52627D' },
});
