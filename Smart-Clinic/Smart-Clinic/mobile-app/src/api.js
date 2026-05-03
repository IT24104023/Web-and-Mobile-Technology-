import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 for host's localhost. iOS simulator uses localhost.
// Change this to your computer's local IP address (e.g. 192.168.1.10) if testing on a physical device.
export const API_URL = Platform.OS === 'android'
  ? 'http://192.168.1.100:5000/api'
  : 'http://localhost:5000/api';

