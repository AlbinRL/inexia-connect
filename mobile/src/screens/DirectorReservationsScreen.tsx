import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { cancelReservation, fetchSiteReservations, MobileReservation } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'DirectorReservations'>;

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });
}

export function DirectorReservationsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const siteId = user?.siteId ?? null;
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const sortedReservations = useMemo(
    () => reservations.slice().sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()),
    [reservations],
  );

  const load = async () => {
    if (!siteId) return;
    try {
      setLoading(true);
      const data = await fetchSiteReservations(siteId);
      setReservations(data);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'DIRECTEUR' || !siteId) {
      setLoading(false);
      return;
    }

    load();
  }, [siteId, user?.role]);

  const handleCancel = (reservationId: number, roomName: string) => {
    Alert.alert('Annuler la réservation', `Annuler la réservation de ${roomName} ?`, [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancellingId(reservationId);
            await cancelReservation(reservationId);
            await load();
          } catch {
            Alert.alert('Erreur', 'Impossible d’annuler la réservation.');
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  };

  if (user?.role !== 'DIRECTEUR') {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Accès réservé au directeur</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (!siteId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Aucun site rattaché</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Réservations du site</Text>
          <Text style={styles.subtitle}>Toutes les réservations liées à ton site</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      {loading ? <ActivityIndicator color="#1E3A8A" /> : null}

      {!loading && sortedReservations.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Aucune réservation pour ce site.</Text>
        </View>
      ) : null}

      {sortedReservations.map((reservation) => (
        <View key={reservation.id} style={styles.card}>
          <View style={styles.rowTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomTitle}>{reservation.salle.nom}</Text>
              <Text style={styles.meta}>{formatDate(reservation.dateDebut)} → {formatDate(reservation.dateFin)}</Text>
              <Text style={styles.meta}>{reservation.utilisateur ? `${reservation.utilisateur.prenom} ${reservation.utilisateur.nom}` : 'Utilisateur inconnu'}</Text>
            </View>
            <Text style={styles.status}>{reservation.status ?? reservation.statut ?? ''}</Text>
          </View>
          <Pressable
            style={[styles.cancelButton, cancellingId === reservation.id && styles.cancelButtonDisabled]}
            onPress={() => handleCancel(reservation.id, reservation.salle.nom)}
            disabled={cancellingId === reservation.id}
          >
            <Text style={styles.cancelButtonText}>{cancellingId === reservation.id ? 'Annulation...' : 'Annuler'}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F5F7FB', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#162033' },
  subtitle: { color: '#52627D', marginTop: 4 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#E6ECF7' },
  backButtonText: { color: '#1E3A8A', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#E2E8F3', marginBottom: 12 },
  rowTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  roomTitle: { fontSize: 17, fontWeight: '800', color: '#162033', marginBottom: 4 },
  meta: { color: '#52627D', marginBottom: 3 },
  status: { color: '#1E3A8A', fontWeight: '800' },
  cancelButton: { marginTop: 12, backgroundColor: '#E53935', borderRadius: 14, alignItems: 'center', paddingVertical: 12 },
  cancelButtonDisabled: { opacity: 0.7 },
  cancelButtonText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#72819B' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F5F7FB' },
  primaryButton: { marginTop: 16, backgroundColor: '#1E3A8A', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});