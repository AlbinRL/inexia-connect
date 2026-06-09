import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

type AppHeaderProps = {
  subtitle?: string;
  hideMenu?: boolean;
};

export function AppHeader({ subtitle, hideMenu = false }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Ferme d'abord le menu pour éviter un état visuel bloqué pendant le logout asynchrone.
    setMenuOpen(false);
    await signOut();
  };

  return (
    <>
      <View style={styles.bannerShell}>
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>Inexia Connect</Text>
          </View>
          {!hideMenu ? (
            <View style={styles.bannerRight}>
              <Pressable style={styles.menuButton} onPress={() => setMenuOpen((s) => !s)}>
                <Text style={styles.menuButtonText}>☰</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>

      {!hideMenu ? (
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          {/* Overlay cliquable: fermeture du menu en cliquant en dehors du panneau. */}
          <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
            <Pressable style={styles.menuDropdown} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.menuText}>{user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}</Text>
              {user ? (
                <Pressable style={styles.menuItem} onPress={handleLogout}>
                  <Text style={styles.menuItemText}>Se déconnecter</Text>
                </Pressable>
              ) : (
                <Text style={styles.menuHint}>Veuillez vous connecter pour accéder au menu.</Text>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  bannerShell: {
    backgroundColor: '#EAF0FB',
    borderWidth: 1,
    borderColor: '#D8E0EE',
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 14,
    marginBottom: 16,
    shadowColor: '#162033',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  bannerAccent: {
    height: 4,
    width: 52,
    borderRadius: 999,
    backgroundColor: '#1E3A8A',
    marginBottom: 12,
  },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#10203A' },
  subtitle: { marginTop: 4, fontSize: 18, color: '#10203A', fontWeight: '800' },
  bannerRight: { position: 'relative' },
  menuButton: { padding: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
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
    minWidth: 200,
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
  menuHint: { color: '#52627D', paddingHorizontal: 8, paddingVertical: 6 },
});