import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import { fetchSite, fetchSiteReservations, MobileReservation, MobileSiteDetail } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Direction'>;

function isToday(value: string) {
  return new Date(value).toDateString() === new Date().toDateString();
}

export function DirectionScreen({ navigation }: Props) {
  const { user } = useAuth();
  const siteId = user?.siteId ?? null;
  const [site, setSite] = useState<MobileSiteDetail | null>(null);
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const todayReservations = useMemo(() => reservations.filter((reservation) => isToday(reservation.dateDebut)), [reservations]);

  useEffect(() => {
    if (!siteId || user?.role !== 'DIRECTEUR') {
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [siteData, reservationsData] = await Promise.all([fetchSite(siteId), fetchSiteReservations(siteId)]);
        if (!mounted) return;
        setSite(siteData);
        setReservations(reservationsData);
      } catch {
        if (mounted) {
          setSite(null);
          setReservations([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [siteId, user?.role]);

  if (user?.role !== 'DIRECTEUR') {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Accès réservé au directeur</Text>
        <Text style={styles.text}>Cette page regroupe les outils du site lié au compte.</Text>
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
        <Text style={styles.text}>Le directeur doit être lié à un site pour accéder à Direction.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader subtitle={site ? `${site.nom}${site.ville ? ` • ${site.ville}` : ''}` : 'Direction'} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
        <View>
          <Text style={styles.title}>Direction</Text>
          <Text style={styles.text}>{site ? `${site.nom}${site.ville ? ` • ${site.ville}` : ''}` : 'Chargement du site...'}</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
        </View>

        <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('DirectorRooms')}>
          <Text style={styles.actionButtonText}>Salles</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => navigation.navigate('DirectorReservations')}>
          <Text style={styles.actionButtonText}>Réservations</Text>
        </Pressable>
        </View>

        <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{loading ? '…' : site?.salles?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Salles du site</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{loading ? '…' : todayReservations.length}</Text>
          <Text style={styles.statLabel}>Réservations du jour</Text>
        </View>
        </View>

        {loading ? <ActivityIndicator color="#1E3A8A" /> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
  container: { padding: 24, backgroundColor: '#F5F7FB', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#162033', marginBottom: 6 },
  text: { fontSize: 15, color: '#52627D' },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#E6ECF7' },
  backButtonText: { color: '#1E3A8A', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionButton: { flex: 1, backgroundColor: '#1E3A8A', borderRadius: 16, alignItems: 'center', paddingVertical: 16 },
  actionButtonText: { color: '#fff', fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F3', padding: 16 },
  statValue: { fontSize: 28, fontWeight: '900', color: '#162033', marginBottom: 6 },
  statLabel: { color: '#52627D', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F5F7FB' },
  primaryButton: { marginTop: 16, backgroundColor: '#1E3A8A', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});