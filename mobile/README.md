# Inexia Mobile

Projet Expo React Native pour la version mobile d'Inexia Connect.

## Lancement

```bash
cd mobile
npm install
npm start
```

## API

Par défaut, l'app utilise `http://localhost:3000` sur web, `http://10.0.2.2:3000` sur Android, et `http://localhost:3000` sur iOS.

Pour un téléphone réel, définis `EXPO_PUBLIC_API_URL` avant de lancer Expo :

```bash
set EXPO_PUBLIC_API_URL=http://192.168.1.20:3000
npm start
```

## Étape suivante

- Brancher l'authentification sur l'API NestJS.
- Ajouter la liste des réservations et le formulaire avec disponibilité.
