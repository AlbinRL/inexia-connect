import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { AppHeader } from '../components/AppHeader';
import {
  createRoom,
  deleteRoom,
  fetchMateriel,
  fetchSite,
  MobileMateriel,
  MobileRoom,
  MobileSiteDetail,
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
  const [site, setSite] = useState<MobileSiteDetail | null>(null);
  const [materials, setMaterials] = useState<MobileMateriel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [materialPickerRow, setMaterialPickerRow] = useState<number | null>(null);
  const [form, setForm] = useState<RoomFormState>({
    id: null,
    nom: '',
    capacite: '8',
    siteId: user?.siteId ?? null,
    equipements: [emptyEquipmentRow()],
  });

  const isDirector = user?.role === 'DIRECTEUR';
  const siteId = user?.siteId ?? null;
  const rooms = site?.salles ?? [];
  const filteredMaterials = useMemo(
    () => materials.filter((material) => material.siteId === siteId || material.siteId === undefined || material.siteId === null),
    [materials, siteId],
  );

  const selectedMaterialName = (materialId: number | null) => {
    if (materialId === null) return null;
    return filteredMaterials.find((material) => material.id === materialId)?.nom ?? null;
  };

  const refresh = async () => {
    if (!siteId) return;

    const [siteData, materialData] = await Promise.all([fetchSite(siteId), fetchMateriel()]);
    setSite(siteData);
    setMaterials(materialData);
    setForm((current) => ({
      ...current,
      siteId,
      equipements: current.equipements.length > 0 ? current.equipements : [emptyEquipmentRow()],
    }));
  };

  useEffect(() => {
    if (!isDirector || !siteId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        await refresh();
      } catch {
        if (mounted) {
          setSite(null);
          setMaterials([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [isDirector, siteId]);

  const resetForm = () => {
    setForm({
      id: null,
      nom: '',
      capacite: '8',
      siteId,
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
            materielId:
              filteredMaterials.find(
                (material) => material.nom === (equipment.materiel?.nom ?? equipment.materiel?.libelle ?? ''),
              )?.id ?? null,
            quantite: String(equipment.quantite),
          }))
        : [emptyEquipmentRow()],
    });
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

    if (!nom || !Number.isFinite(capacite) || capacite <= 0 || !siteId) {
      Alert.alert('Champs manquants', 'Nom et capacité sont obligatoires.');
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
      await refresh();
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
            await refresh();
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
        <Text style={styles.text}>Cette section mobile est limitée au site rattaché au compte.</Text>
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
        <Text style={styles.text}>Le directeur doit être lié à un site pour voir ses salles.</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader subtitle={site ? `${site.nom}${site.ville ? ` • ${site.ville}` : ''}` : 'Salles'} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gestion des salles</Text>
          <Text style={styles.text}>{site ? `${site.nom}${site.ville ? ` • ${site.ville}` : ''}` : 'Chargement du site...'}</Text>
        </View>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>
        </View>

        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Créer une salle</Text>
        <TextInput value={form.nom} onChangeText={(value) => setForm((current) => ({ ...current, nom: value }))} placeholder="Nom" style={styles.input} />
        <TextInput
          value={form.capacite}
          onChangeText={(value) => setForm((current) => ({ ...current, capacite: value.replace(/[^0-9]/g, '') }))}
          placeholder="Capacité"
          keyboardType="numeric"
          style={styles.input}
        />
        <Text style={styles.subSectionTitle}>Équipements du site</Text>
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
          <Text style={styles.text}>Aucune salle trouvée sur ce site.</Text>
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
              {filteredMaterials.map((material) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
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
  input: { backgroundColor: '#F8FAFD', borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, padding: 12, marginBottom: 12 },
  quantityInput: { width: 72, marginBottom: 0 },
  primaryButton: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 14, marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#E6ECF7', borderRadius: 14, alignItems: 'center', padding: 14, marginBottom: 12 },
  secondaryButtonText: { color: '#1E3A8A', fontWeight: '700' },
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
