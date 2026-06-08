import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import {
  createRoom,
  deleteRoom,
  fetchMateriel,
  fetchRooms,
  fetchSites,
  MobileMateriel,
  MobileRoom,
  MobileSite,
  updateRoom,
} from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'DirectorRooms'>;

type EquipmentFormRow = {
  materielId: number | null;
  quantite: string;
};

type RoomFormState = {
  id: number | null;
  nom: string;
  capacite: string;
  siteId: number | null;
  equipements: EquipmentFormRow[];
};

const emptyEquipmentRow = (): EquipmentFormRow => ({ materielId: null, quantite: '1' });

export function DirectorRoomsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [sites, setSites] = useState<MobileSite[]>([]);
  const [materials, setMaterials] = useState<MobileMateriel[]>([]);
  const [rooms, setRooms] = useState<MobileRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(user?.siteId ?? null);
  const [materialPickerRow, setMaterialPickerRow] = useState<number | null>(null);
  const [form, setForm] = useState<RoomFormState>({
    id: null,
    nom: '',
    capacite: '8',
    siteId: user?.siteId ?? null,
    equipements: [emptyEquipmentRow()],
  });

  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId) ?? null,
    [sites, selectedSiteId],
  );

  const isDirector = user?.role === 'DIRECTEUR';

  const loadRooms = async (siteId: number | null) => {
    const data = await fetchRooms(siteId);
    setRooms(data);
  };

  useEffect(() => {
    if (!isDirector) return;

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [siteData, materialData] = await Promise.all([fetchSites(), fetchMateriel()]);
        if (!mounted) return;
        setSites(siteData);
        setMaterials(materialData);
        const nextSiteId = selectedSiteId ?? user?.siteId ?? siteData[0]?.id ?? null;
        setSelectedSiteId(nextSiteId);
        setForm((current) => ({ ...current, siteId: current.siteId ?? nextSiteId }));
        await loadRooms(nextSiteId);
      } catch {
        if (mounted) {
          setSites([]);
          setMaterials([]);
          setRooms([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isDirector]);

  useEffect(() => {
    if (!isDirector || selectedSiteId === null) return;

    let mounted = true;
    const refresh = async () => {
      try {
        setLoading(true);
        const data = await fetchRooms(selectedSiteId);
        if (mounted) setRooms(data);
      } catch {
        if (mounted) setRooms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [isDirector, selectedSiteId]);

  const selectedMaterialName = (materialId: number | null) => {
    if (materialId === null) return null;
    return materials.find((material) => material.id === materialId)?.nom ?? null;
  };

  const resetForm = () => {
    setForm({
      id: null,
      nom: '',
      capacite: '8',
      siteId: selectedSiteId ?? user?.siteId ?? null,
      equipements: [emptyEquipmentRow()],
    });
  };

  const editRoom = (room: MobileRoom) => {
    setForm({
      id: room.id,
      nom: room.nom,
      capacite: String(room.capacite),
      siteId: room.siteId,
      equipements: room.equipements?.length
        ? room.equipements.map((equipment) => ({
            materielId: materials.find((material) => material.nom === (equipment.materiel?.nom ?? equipment.materiel?.libelle ?? ''))?.id ?? null,
            quantite: String(equipment.quantite),
          }))
        : [emptyEquipmentRow()],
    });
    setSelectedSiteId(room.siteId);
  };

  const updateEquipmentRow = (index: number, patch: Partial<EquipmentFormRow>) => {
    setForm((current) => ({
      ...current,
      equipements: current.equipements.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    }));
  };

  const addEquipmentRow = () => {
    setForm((current) => ({ ...current, equipements: [...current.equipements, emptyEquipmentRow()] }));
  };

  const removeEquipmentRow = (index: number) => {
    setForm((current) => {
      const nextRows = current.equipements.filter((_, rowIndex) => rowIndex !== index);
      return { ...current, equipements: nextRows.length > 0 ? nextRows : [emptyEquipmentRow()] };
    });
  };

  const saveRoom = async () => {
    const nom = form.nom.trim();
    const capacite = Number(form.capacite);
    const siteId = form.siteId;

    if (!nom || !Number.isFinite(capacite) || capacite <= 0 || !siteId) {
      Alert.alert('Champs manquants', 'Nom, capacité et site sont obligatoires.');
      return;
    }

    const equipements = form.equipements
      .filter((row) => row.materielId && Number(row.quantite) > 0)
      .map((row) => ({ materielId: Number(row.materielId), quantite: Number(row.quantite) }));

    try {
      setSaving(true);
      if (form.id) {
        await updateRoom(form.id, { nom, capacite, siteId, equipements });
      } else {
        await createRoom({ nom, capacite, siteId, equipements });
      }
      await loadRooms(siteId);
      resetForm();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder la salle.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (roomId: number, roomName: string) => {
    Alert.alert('Supprimer la salle', `Supprimer ${roomName} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRoom(roomId);
            await loadRooms(selectedSiteId);
            if (form.id === roomId) {
              resetForm();
            }
          } catch {
            Alert.alert('Erreur', 'La salle ne peut pas être supprimée.');
          }
        },
      },
    ]);
  };

  if (!isDirector) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Accès réservé au directeur</Text>
        <Text style={styles.text}>Cette section mobile ne gère pas l’administration complète.</Text>
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
          <Text style={styles.title}>Gestion des salles</Text>
          <Text style={styles.text}>{selectedSite ? `${selectedSite.nom}${selectedSite.ville ? ` • ${selectedSite.ville}` : ''}` : 'Choisissez un site'}</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Site</Text>
        <View style={styles.chipsRow}>
          {sites.map((site) => {
            const active = selectedSiteId === site.id;
            return (
              <Pressable key={site.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setSelectedSiteId(site.id)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{site.nom}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.formHeader}>
          <Text style={styles.sectionTitle}>{form.id ? 'Modifier une salle' : 'Créer une salle'}</Text>
          {form.id ? (
            <Pressable onPress={resetForm}>
              <Text style={styles.link}>Annuler l’édition</Text>
            </Pressable>
          ) : null}
        </View>
        <TextInput
          value={form.nom}
          onChangeText={(value) => setForm((current) => ({ ...current, nom: value }))}
          placeholder="Nom"
          style={styles.input}
        />
        <TextInput
          value={form.capacite}
          onChangeText={(value) => setForm((current) => ({ ...current, capacite: value.replace(/[^0-9]/g, '') }))}
          placeholder="Capacité"
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.subSectionTitle}>Équipements</Text>
        {form.equipements.map((row, index) => (
          <View key={`${index}-${row.materielId ?? 'empty'}`} style={styles.equipmentRow}>
            <Pressable style={styles.materialPicker} onPress={() => setMaterialPickerRow(index)}>
              <Text style={styles.materialPickerText}>{selectedMaterialName(row.materielId) ?? 'Choisir un matériel'}</Text>
            </Pressable>
            <TextInput
              value={row.quantite}
              onChangeText={(value) => updateEquipmentRow(index, { quantite: value.replace(/[^0-9]/g, '') })}
              placeholder="Qté"
              keyboardType="numeric"
              style={[styles.input, styles.quantityInput]}
            />
            <Pressable style={styles.removeRowButton} onPress={() => removeEquipmentRow(index)}>
              <Text style={styles.removeRowButtonText}>×</Text>
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.secondaryButton} onPress={addEquipmentRow}>
          <Text style={styles.secondaryButtonText}>Ajouter un équipement</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={saveRoom} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Créer la salle'}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Salles du site</Text>
        {loading ? (
          <Text style={styles.text}>Chargement...</Text>
        ) : rooms.length === 0 ? (
          <Text style={styles.text}>Aucune salle trouvée.</Text>
        ) : (
          rooms.map((room) => (
            <Pressable key={room.id} style={[styles.roomItem, form.id === room.id && styles.roomItemActive]} onPress={() => editRoom(room)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomTitle}>{room.nom}</Text>
                <Text style={styles.roomMeta}>Capacité {room.capacite} {room.type ? `• ${room.type}` : ''}{room.etage !== null && room.etage !== undefined ? ` • étage ${room.etage}` : ''}</Text>
                {room.equipements?.length ? (
                  <Text style={styles.roomMeta}>
                    {room.equipements
                      .map((equipment) => `${equipment.quantite} ${equipment.materiel?.nom ?? equipment.materiel?.libelle ?? 'matériel'}`)
                      .join(' • ')}
                  </Text>
                ) : null}
              </View>
              <Pressable
                style={styles.deleteButton}
                onPress={(event) => {
                  event.stopPropagation();
                  confirmDelete(room.id, room.nom);
                }}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </Pressable>
            </Pressable>
          ))
        )}
      </View>

      <Modal visible={materialPickerRow !== null} transparent animationType="fade" onRequestClose={() => setMaterialPickerRow(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMaterialPickerRow(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Choisir un matériel</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {materials.map((material) => (
                <Pressable
                  key={material.id}
                  style={styles.modalItem}
                  onPress={() => {
                    if (materialPickerRow !== null) {
                      updateEquipmentRow(materialPickerRow, { materielId: material.id });
                    }
                    setMaterialPickerRow(null);
                  }}
                >
                  <Text style={styles.modalItemText}>{material.nom}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F5F7FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F5F7FB' },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#162033' },
  text: { color: '#52627D', marginTop: 4 },
  backButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#E6ECF7' },
  backButtonText: { color: '#1E3A8A', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F3' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#162033', marginBottom: 12 },
  subSectionTitle: { fontSize: 14, fontWeight: '800', color: '#162033', marginTop: 4, marginBottom: 8 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: '#1E3A8A', fontWeight: '700' },
  input: { backgroundColor: '#F8FAFD', borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, padding: 12, marginBottom: 12 },
  quantityInput: { width: 72, marginBottom: 0 },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 14, marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#E6ECF7', borderRadius: 14, alignItems: 'center', padding: 14, marginBottom: 12 },
  secondaryButtonText: { color: '#1E3A8A', fontWeight: '700' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#D8E0EE', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  chipText: { color: '#162033', fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  equipmentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  materialPicker: { flex: 1, borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#F8FAFD' },
  materialPickerText: { color: '#162033', fontWeight: '600' },
  removeRowButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE8E6' },
  removeRowButtonText: { color: '#D93025', fontSize: 24, lineHeight: 24, fontWeight: '800' },
  roomItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEF2F8' },
  roomItemActive: { backgroundColor: '#F5F7FB' },
  roomTitle: { fontWeight: '800', color: '#162033', marginBottom: 4 },
  roomMeta: { color: '#52627D', fontSize: 12 },
  deleteButton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#FCE8E6' },
  deleteButtonText: { color: '#D93025', fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.22)' },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, maxHeight: '80%' },
  modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  modalItemText: { color: '#162033', fontWeight: '600' },
});
