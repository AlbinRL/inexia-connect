import { Platform } from 'react-native';

function getWebHostUrl() {
	if (typeof window === 'undefined') {
		return 'http://localhost:3000';
	}

	return `http://${window.location.hostname}:3000`;
}

export const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_URL?.trim() ||
	(Platform.OS === 'web' ? getWebHostUrl() : Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');
