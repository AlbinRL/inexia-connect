import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { fetchMyReservations, MobileReservation } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

function formatDateShort(value: string) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' });
}

function isToday(value: string) {
  const current = new Date();
  const date = new Date(value);
  return current.toDateString() === date.toDateString();
}

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMyReservations();
        if (mounted) setReservations(data);
      } catch {
        if (mounted) setReservations([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const upcoming = useMemo(() => {
    return reservations
      .slice()
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
      .slice(0, 10);
  }, [reservations]);

  const todayReservations = upcoming.filter((reservation) => isToday(reservation.dateDebut));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Planning</Text>
          <Text style={styles.subtitle}>{user ? `${user.prenom} ${user.nom}` : 'collaborateur'}</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Aujourd’hui</Text>
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : todayReservations.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation aujourd’hui.</Text>
        ) : (
          todayReservations.map((reservation) => (
            <Pressable key={reservation.id} style={styles.rowItem} onPress={() => navigation.navigate('Reservation', { reservationId: reservation.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{reservation.salle.nom}</Text>
                <Text style={styles.rowMeta}>{formatDateShort(reservation.dateDebut)} → {formatDateShort(reservation.dateFin)}</Text>
              </View>
              <Text style={styles.rowStatus}>{reservation.status}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>À venir</Text>
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : upcoming.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation planifiée.</Text>
        ) : (
          upcoming.slice(0, 5).map((reservation) => (
            <Pressable key={reservation.id} style={styles.rowItem} onPress={() => navigation.navigate('Reservation', { reservationId: reservation.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{reservation.salle.nom}</Text>
                <Text style={styles.rowMeta}>{formatDateShort(reservation.dateDebut)}</Text>
              </View>
              <Text style={styles.rowStatus}>{reservation.status}</Text>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Reservation')}>
          <Text style={styles.buttonText}>Créer une réservation</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F5F7FB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#162033' },
  backButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#E6ECF7' },
  backButtonText: { color: '#1E3A8A', fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#52627D', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F3' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#162033', marginBottom: 8 },
  emptyText: { color: '#72819B' },
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#EEF2F8' },
  rowTitle: { fontWeight: '800', color: '#162033' },
  rowMeta: { color: '#52627D', fontSize: 12 },
  rowStatus: { color: '#1E3A8A', fontWeight: '700', marginLeft: 12 },
  button: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
