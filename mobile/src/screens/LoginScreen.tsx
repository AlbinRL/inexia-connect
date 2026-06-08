import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, motDePasse: password });
      if (response.data?.access_token) {
        await signIn(response.data.access_token, response.data.utilisateur);
        navigation.replace('Home');
      } else {
        Alert.alert('Connexion impossible', 'Réponse de connexion invalide.');
      }
    } catch (error) {
      Alert.alert('Connexion impossible', 'Vérifie tes identifiants ou le serveur API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inexia Connect</Text>
      <Text style={styles.subtitle}>Version mobile collaborateur</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Mot de passe" secureTextEntry style={styles.input} />
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FB' },
  title: { fontSize: 32, fontWeight: '800', color: '#162033', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#52627D', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D8E0EE', borderRadius: 14, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#1E3A8A', borderRadius: 14, alignItems: 'center', padding: 16, marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
