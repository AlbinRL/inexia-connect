import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import {
  createReservation,
  fetchAvailability,
  fetchMyReservations,
  fetchRooms,
  fetchReservation,
  cancelReservation,
  MobileReservation,
  MobileRoom,
  RoomAvailability,
} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Reservation'>;

function toUtcIso(input: string) {
  const normalized = input.trim().replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });
}

export function ReservationScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<MobileReservation[]>([]);
  const [rooms, setRooms] = useState<MobileRoom[]>([]);
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const startInputRef = useRef<HTMLInputElement | null>(null);
  const endInputRef = useRef<HTMLInputElement | null>(null);
  const [showWebStartModal, setShowWebStartModal] = useState(false);
  const [showWebEndModal, setShowWebEndModal] = useState(false);
  const [webModalDate, setWebModalDate] = useState('');
  const [webModalTime, setWebModalTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshingAvailability, setRefreshingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reservationId = route?.params?.reservationId;
  const [reservationDetail, setReservationDetail] = useState<MobileReservation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );

  const selectedAvailability = useMemo(() => {
    if (!selectedRoomId) {
      return null;
    }

    return availability.find((slot) => slot.salleId === selectedRoomId) ?? null;
  }, [availability, selectedRoomId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextReservations, nextRooms] = await Promise.all([
        fetchMyReservations(),
        fetchRooms(user?.siteId ?? null),
      ]);

      setReservations(nextReservations);
      setRooms(nextRooms);

      if (!selectedRoomId && nextRooms.length > 0) {
        setSelectedRoomId(nextRooms[0].id);
      }
    } catch {
      setError('Impossible de charger les réservations ou les salles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!reservationId) return;
    let mounted = true;
    const loadDetail = async () => {
      try {
        setLoadingDetail(true);
        const data = await fetchReservation(reservationId);
        if (mounted) setReservationDetail(data);
      } catch {
        if (mounted) setReservationDetail(null);
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    };
    loadDetail();
    return () => { mounted = false; };
  }, [reservationId]);

  useEffect(() => {
    const refreshAvailabilityForSlot = async () => {
      const start = toUtcIso(dateStart);
      const end = toUtcIso(dateEnd);

      if (!start || !end || !selectedRoomId) {
        setAvailability([]);
        return;
      }

      try {
        setRefreshingAvailability(true);
        const slots = await fetchAvailability(start, end);
        setAvailability(slots);
      } catch {
        setAvailability([]);
      } finally {
        setRefreshingAvailability(false);
      }
    };

    refreshAvailabilityForSlot();
  }, [dateStart, dateEnd, selectedRoomId]);

  const handleWebTimeChange = (raw: string) => {
    // keep only digits, allow up to 4 (HHMM)
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 4);
    if (digits.length <= 2) {
      setWebModalTime(digits);
      return;
    }
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2);
    setWebModalTime(`${hh}:${mm}`);
  };

  function formatLocalInput(date: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  const handleConfirmStart = (picked: Date) => {
    setStartPickerVisible(false);
    setDateStart(formatLocalInput(picked));
  };

  const handleConfirmEnd = (picked: Date) => {
    setEndPickerVisible(false);
    setDateEnd(formatLocalInput(picked));
  };

  const handleCreate = async () => {
    if (!selectedRoomId) {
      Alert.alert('Réservation', 'Sélectionne une salle.');
      return;
    }

    const start = toUtcIso(dateStart);
    const end = toUtcIso(dateEnd);

    if (!start || !end) {
      Alert.alert('Réservation', 'Renseigne des dates valides au format AAAA-MM-JJ HH:MM.');
      return;
    }

    try {
      setCreating(true);
      await createReservation({ salleId: selectedRoomId, dateDebut: start, dateFin: end });
      await loadData();
      setDateStart('');
      setDateEnd('');
      Alert.alert('Réservation', 'Réservation créée avec succès.');
    } catch {
      Alert.alert('Réservation impossible', 'Le créneau est peut-être déjà pris ou la salle est pleine.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (reservationIdToCancel: number) => {
    Alert.alert('Annuler la réservation', 'Es-tu sûr de vouloir annuler cette réservation ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await cancelReservation(reservationIdToCancel);
            await loadData();
            Alert.alert('Réservation', 'Réservation annulée.');
            navigation.goBack();
          } catch (e) {
            Alert.alert('Erreur', 'Impossible d\'annuler la réservation.');
          }
        },
      },
    ]);
  };

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
    <>
    {reservationId ? (
      // detail view
      <ScrollView contentContainerStyle={styles.container} stickyHeaderIndices={[0]}>
        <AppHeader subtitle={user ? `${user.prenom} ${user.nom}` : 'Réservations'} />
        <View style={styles.header}>
          <Text style={styles.title}>Détail réservation</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </Pressable>
        </View>

        {loadingDetail ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : reservationDetail ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{reservationDetail.salle.nom}</Text>
            <Text style={styles.reservationMeta}>{formatDate(reservationDetail.dateDebut)} → {formatDate(reservationDetail.dateFin)}</Text>
            <Text style={[styles.reservationStatus, getStatusBadgeStyle(reservationDetail.status)]}>{getStatusLabel(reservationDetail.status)}</Text>
            <Text style={[styles.label, { marginTop: 12 }]}>Équipements</Text>
            {reservationDetail.salle.equipements?.length ? (
              reservationDetail.salle.equipements.map((eq, i) => (
                <Text key={i} style={styles.emptyText}>{eq.materiel?.nom ?? eq.materiel?.libelle ?? 'Matériel'} x{eq.quantite}</Text>
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun équipement renseigné.</Text>
            )}

            {/* cancel button if cancellable */}
            {new Date(reservationDetail.dateFin) > new Date() && reservationDetail.status !== 'CANCELLED' ? (
              <Pressable style={[styles.button, { backgroundColor: '#E53935', marginTop: 12 }]} onPress={() => handleCancel(reservationDetail.id)}>
                <Text style={styles.buttonText}>Annuler la réservation</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <Text style={styles.error}>Impossible de charger le détail de la réservation.</Text>
        )}
      </ScrollView>
    ) : (
    <ScrollView contentContainerStyle={styles.container} stickyHeaderIndices={[0]}>
      <AppHeader subtitle={user ? `${user.prenom} ${user.nom}` : 'Réservations'} />
      <View style={styles.header}>
        <Text style={styles.title}>Réservations</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Créer une réservation</Text>
        <Text style={styles.label}>Salle</Text>
        <FlatList
          data={rooms}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomList}
          renderItem={({ item }) => {
            const currentAvailability = availability.find((slot) => slot.salleId === item.id);
            const available = currentAvailability?.available ?? item.capacite;
            const isSelected = selectedRoomId === item.id;

            return (
              <Pressable
                style={[styles.roomChip, isSelected && styles.roomChipSelected]}
                onPress={() => setSelectedRoomId(item.id)}
              >
                <Text style={[styles.roomChipTitle, isSelected && styles.roomChipTextSelected]}>
                  {item.nom}
                </Text>
                <Text style={[styles.roomChipMeta, isSelected && styles.roomChipTextSelected]}>
                  {available} libres / {item.capacite}
                </Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Début</Text>
            {Platform.OS === 'web' ? (
              <Pressable
                onPress={() => {
                  // open our custom web modal
                  // prefill date/time from current value
                  if (dateStart) {
                    const parts = dateStart.split(' ');
                    setWebModalDate(parts[0] ?? '');
                    setWebModalTime(parts[1] ?? '');
                  } else {
                    const now = new Date();
                    const pad = (n: number) => String(n).padStart(2, '0');
                    setWebModalDate(`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`);
                    setWebModalTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                  }
                  setShowWebStartModal(true);
                }}
                style={styles.inputPressable}
              >
                <Text style={styles.inputText}>{dateStart || 'AAAA-MM-JJ HH:MM'}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setStartPickerVisible(true)} style={styles.inputPressable}>
                <Text style={styles.inputText}>{dateStart || 'AAAA-MM-JJ HH:MM'}</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.flex1}>
            <Text style={styles.label}>Fin</Text>
            {Platform.OS === 'web' ? (
              <Pressable
                onPress={() => {
                  if (dateEnd) {
                    const parts = dateEnd.split(' ');
                    setWebModalDate(parts[0] ?? '');
                    setWebModalTime(parts[1] ?? '');
                  } else {
                    const now = new Date();
                    const pad = (n: number) => String(n).padStart(2, '0');
                    setWebModalDate(`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`);
                    setWebModalTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
                  }
                  setShowWebEndModal(true);
                }}
                style={styles.inputPressable}
              >
                <Text style={styles.inputText}>{dateEnd || 'AAAA-MM-JJ HH:MM'}</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => setEndPickerVisible(true)} style={styles.inputPressable}>
                <Text style={styles.inputText}>{dateEnd || 'AAAA-MM-JJ HH:MM'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text style={styles.helperText}>
          Saisis les horaires en heure locale. Le mobile convertit automatiquement en UTC.
        </Text>

        {selectedRoom ? (
          <View style={styles.availabilityBox}>
            <Text style={styles.availabilityTitle}>{selectedRoom.nom}</Text>
            <Text style={styles.availabilityText}>
              {selectedAvailability
                ? `${selectedAvailability.available} places disponibles sur ce créneau`
                : 'Renseigne un créneau pour voir la disponibilité.'}
            </Text>
          </View>
        ) : null}

        <Pressable style={styles.button} onPress={handleCreate} disabled={creating || refreshingAvailability}>
          {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Réserver</Text>}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mes réservations</Text>
        {loading ? (
          <ActivityIndicator color="#1E3A8A" />
        ) : reservations.length === 0 ? (
          <Text style={styles.emptyText}>Aucune réservation pour le moment.</Text>
        ) : (
          reservations.map((reservation) => (
            <View key={reservation.id} style={styles.reservationItem}>
              <Text style={styles.reservationTitle}>{reservation.salle.nom}</Text>
              <Text style={styles.reservationMeta}>{formatDate(reservation.dateDebut)} → {formatDate(reservation.dateFin)}</Text>
              <Text style={styles.reservationStatus}>{reservation.status}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Matériel de la salle sélectionnée</Text>
        {selectedRoom ? (
          <View style={{ gap: 8 }}>
            <Text style={styles.reservationMeta}>
              {selectedRoom.type ?? 'Salle'}
              {selectedRoom.etage !== undefined && selectedRoom.etage !== null ? ` • étage ${selectedRoom.etage}` : ''}
            </Text>
            {selectedRoom.equipements?.length ? (
              selectedRoom.equipements.map((equipement, index) => (
                <Text key={`${equipement.materiel?.nom ?? equipement.materiel?.libelle ?? 'equipement'}-${index}`} style={styles.emptyText}>
                  {equipement.materiel?.nom ?? equipement.materiel?.libelle ?? 'Matériel'} x{equipement.quantite}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyText}>Aucun équipement renseigné pour cette salle.</Text>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>Sélectionne une salle pour voir son matériel.</Text>
        )}
      </View>
    </ScrollView>
    )}
      {/* Web fallback using native input datetime-local */}
      {Platform.OS === 'web' ? (
        <>
          {(showWebStartModal || showWebEndModal) && (
            <div style={{ position: 'fixed', zIndex: 9999, inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '94%', maxWidth: 420, background: '#fff', borderRadius: 14, padding: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Sélectionner la date et l'heure</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input type="date" value={webModalDate} onChange={(e: any) => setWebModalDate(e.target.value)} style={{ flex: 1, padding: 8 }} />
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={webModalTime}
                      onChange={(e: any) => handleWebTimeChange(e.target.value)}
                      placeholder="HH:MM"
                      style={{ padding: 8, width: 96 }}
                    />
                    <span style={{ color: '#72819B' }}>24h</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setShowWebStartModal(false); setShowWebEndModal(false); }} style={{ padding: '8px 12px' }}>Annuler</button>
                  <button onClick={() => {
                    // normalize and validate HH:MM 24h format
                    let normalized = webModalTime;
                    // if user typed `9:30` -> pad to `09:30`
                    if (/^\d:[0-5]\d$/.test(normalized)) normalized = `0${normalized}`;
                    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
                    if (!timeRegex.test(normalized)) {
                      // eslint-disable-next-line no-alert
                      alert('Format invalide pour l\'heure. Utilise HH:MM en 24h (ex: 09:30).');
                      return;
                    }

                    const [y, m, d] = webModalDate.split('-').map(Number);
                    const [hh, mm] = normalized.split(':').map(Number);
                    const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
                    if (showWebStartModal) {
                      setDateStart(formatLocalInput(dt));
                    }
                    if (showWebEndModal) {
                      setDateEnd(formatLocalInput(dt));
                    }
                    setShowWebStartModal(false);
                    setShowWebEndModal(false);
                  }} style={{ padding: '8px 12px', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: 8 }}>OK</button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <DateTimePickerModal
            isVisible={isStartPickerVisible}
            mode="datetime"
            onConfirm={handleConfirmStart}
            onCancel={() => setStartPickerVisible(false)}
            locale="fr_FR"
            is24Hour
          />
          <DateTimePickerModal
            isVisible={isEndPickerVisible}
            mode="datetime"
            onConfirm={handleConfirmEnd}
            onCancel={() => setEndPickerVisible(false)}
            locale="fr_FR"
            is24Hour
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F5F7FB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#162033' },
  backButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#E6ECF7' },
  backButtonText: { color: '#1E3A8A', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F3' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#162033', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: '#52627D', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  input: { backgroundColor: '#F8FAFD', borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, padding: 14, marginBottom: 12 },
  inputPressable: { backgroundColor: '#F8FAFD', borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, padding: 14, marginBottom: 12, justifyContent: 'center' },
  inputText: { color: '#0F172A' },
  helperText: { fontSize: 12, color: '#72819B', marginBottom: 12 },
  button: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 16, marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  availabilityBox: { backgroundColor: '#F1F6FF', borderRadius: 16, padding: 12, marginBottom: 12 },
  availabilityTitle: { color: '#162033', fontWeight: '800', marginBottom: 4 },
  availabilityText: { color: '#1E3A8A', fontWeight: '700' },
  emptyText: { color: '#72819B' },
  error: { color: '#B42318', backgroundColor: '#FFF3F1', padding: 12, borderRadius: 12, marginBottom: 12 },
  roomList: { gap: 10, paddingBottom: 10 },
  roomChip: { borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginRight: 10, minWidth: 120, backgroundColor: '#fff' },
  roomChipSelected: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  roomChipTitle: { fontWeight: '800', color: '#162033', marginBottom: 2 },
  roomChipMeta: { color: '#52627D', fontSize: 12 },
  roomChipTextSelected: { color: '#fff' },
  reservationItem: { borderTopWidth: 1, borderTopColor: '#EEF2F8', paddingTop: 12, marginTop: 12 },
  reservationTitle: { fontWeight: '800', color: '#162033', marginBottom: 4 },
  reservationMeta: { color: '#52627D', marginBottom: 4 },
  reservationStatus: {
    alignSelf: 'flex-start',
    marginTop: 6,
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
});
