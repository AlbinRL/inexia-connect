import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { fetchMyReservations, MobileReservation } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.appTitle}>Inexia Connect</Text>
        <View style={styles.bannerRight}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen((s) => !s)}>
            <Text style={styles.menuButtonText}>☰</Text>
          </Pressable>
        </View>
      </View>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuDropdown} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.menuText}>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</Text>
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemText}>Se déconnecter</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      <Text style={styles.subtitle}>Bonjour {user ? `${user.prenom} ${user.nom}` : 'collaborateur'}</Text>
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
              <Text style={styles.reservationStatus}>{reservation.status}</Text>
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
              <Text style={styles.reservationStatus}>{reservation.status}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
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
  container: { padding: 24, backgroundColor: '#F5F7FB' },
  title: { fontSize: 28, fontWeight: '800', color: '#162033', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '600', color: '#1E3A8A', marginBottom: 8 },
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
  reservationStatus: { color: '#1E3A8A', fontWeight: '700' },
  emptyText: { color: '#72819B' },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#162033' },
  bannerRight: { position: 'relative' },
  menuButton: { padding: 8, borderRadius: 8, backgroundColor: '#E6ECF7' },
  menuButtonText: { color: '#1E3A8A', fontWeight: '800' },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    top: 72,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F3',
    minWidth: 180,
    zIndex: 50,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
  menuText: { color: '#162033', fontWeight: '700', marginBottom: 8 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 8, width: '100%' },
  menuItemText: { color: '#E53935', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
});
