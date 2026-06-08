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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>Bonjour {user ? `${user.prenom} ${user.nom}` : 'collaborateur'}</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Prochaines réservations</Text>
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : upcoming.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation à venir.</Text>
        ) : (
          upcoming.map((r) => (
            <Pressable key={r.id} style={styles.rowItem} onPress={() => navigation.navigate('Reservation', { reservationId: r.id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{r.salle.nom}</Text>
                <Text style={styles.rowMeta}>{formatDateShort(r.dateDebut)} → {formatDateShort(r.dateFin)}</Text>
              </View>
              <Text style={styles.rowStatus}>{r.status}</Text>
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
