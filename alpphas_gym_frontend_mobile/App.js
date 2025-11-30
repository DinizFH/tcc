import { NavigationContainer } from '@react-navigation/native';
import { LogBox } from 'react-native';
import 'react-native-reanimated'; // ⚠️ deve ser o primeiro import SEMPRE!
import { AuthProvider } from './app/context/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';

// Exibe todos os avisos e erros durante o desenvolvimento
LogBox.ignoreAllLogs(false);

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
