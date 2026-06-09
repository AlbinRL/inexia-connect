import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { fetchMyReservations, MobileReservation } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const upcoming = useMemo(() => {
    return reservations
      .slice()
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
      .slice(0, 10);
  }, [reservations]);

  const todayReservations = useMemo(() => {
    const today = new Date().toDateString();
    return upcoming.filter((reservation) => new Date(reservation.dateDebut).toDateString() === today);
  }, [upcoming]);

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
    return () => {
      mounted = false;
    };
  }, []);

  function formatDate(value: string) {
    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    });
  }

  const getStatusBadgeStyle = (value?: string | null) => {
    const normalized = (value ?? '').toUpperCase();

    if (normalized.includes('CANCEL')) {
      return styles.statusCancelled;
    }

    if (normalized.includes('CONFIRM') || normalized.includes('CONFIRMED')) {
      return styles.statusConfirmed;
    }

    if (normalized.includes('EN COURS')) {
      return styles.statusInProgress;
    }

    if (normalized.includes('TERM')) {
      return styles.statusFinished;
    }

    return styles.statusDefault;
  };

  const getStatusLabel = (value?: string | null) => {
    const normalized = (value ?? '').toUpperCase();

    if (normalized.includes('CANCEL')) return 'Annulée';
    if (normalized.includes('CONFIRM') || normalized.includes('CONFIRMED')) return 'Confirmée';
    if (normalized.includes('EN COURS')) return 'En cours';
    if (normalized.includes('TERM')) return 'Terminée';
    return value ?? '';
  };

  return (
    <View style={styles.screen}>
      <AppHeader subtitle="Accueil" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Bonjour {user ? user.prenom : 'collaborateur'}</Text>
        <View style={styles.actionsRow}>
        <Pressable style={styles.button} onPress={() => navigation.navigate('Reservation')}>
          <Text style={styles.buttonText}>+ Nouvelle réservation</Text>
        </Pressable>
        {user?.role === 'DIRECTEUR' ? (
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Direction')}>
            <Text style={styles.secondaryButtonText}>Direction</Text>
          </Pressable>
        ) : null}
        </View>

        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Aujourd’hui</Text>
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : todayReservations.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation aujourd’hui.</Text>
        ) : (
          todayReservations.map((reservation) => (
            <Pressable key={reservation.id} style={styles.reservationItem} onPress={() => navigation.navigate('Reservation', { reservationId: reservation.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reservationTitle}>{reservation.salle.nom}</Text>
                <Text style={styles.reservationMeta}>{formatDateShort(reservation.dateDebut)} → {formatDateShort(reservation.dateFin)}</Text>
              </View>
              <Text style={[styles.reservationStatus, getStatusBadgeStyle(reservation.status)]}>{getStatusLabel(reservation.status)}</Text>
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
            <Pressable key={reservation.id} style={styles.reservationItem} onPress={() => navigation.navigate('Reservation', { reservationId: reservation.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reservationTitle}>{reservation.salle.nom}</Text>
                <Text style={styles.reservationMeta}>{formatDateShort(reservation.dateDebut)}</Text>
              </View>
              <Text style={[styles.reservationStatus, getStatusBadgeStyle(reservation.status)]}>{getStatusLabel(reservation.status)}</Text>
            </Pressable>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
  container: { padding: 24, backgroundColor: '#F5F7FB' },
  greeting: { fontSize: 24, fontWeight: '900', color: '#10203A', marginBottom: 12, marginTop: 2 },
  title: { fontSize: 28, fontWeight: '800', color: '#162033', marginBottom: 8 },
  text: { fontSize: 16, color: '#52627D', marginBottom: 24 },
  button: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 16 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#E6ECF7', borderRadius: 14, alignItems: 'center', padding: 16 },
  secondaryButtonText: { color: '#1E3A8A', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F3' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#162033', marginBottom: 12 },
  reservationItem: { borderTopWidth: 1, borderTopColor: '#EEF2F8', paddingTop: 12, marginTop: 12 },
  reservationTitle: { fontWeight: '800', color: '#162033', marginBottom: 4 },
  reservationMeta: { color: '#52627D', marginBottom: 4 },
  reservationStatus: {
    minWidth: 92,
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '800',
    overflow: 'hidden',
  },
  statusDefault: { color: '#1E3A8A', backgroundColor: '#E6ECF7' },
  statusConfirmed: { color: '#166534', backgroundColor: '#DCFCE7' },
  statusCancelled: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  statusInProgress: { color: '#92400E', backgroundColor: '#FEF3C7' },
  statusFinished: { color: '#334155', backgroundColor: '#E2E8F0' },
  emptyText: { color: '#72819B' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
});
