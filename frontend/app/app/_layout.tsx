import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import { useEffect } from 'react';
import { Audio } from 'expo-av';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LanguageProvider } from '../contexts/LanguageContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      } catch (e) {
        console.warn('Failed to configure audio iOS:', e);
      }
    };
    initAudio();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="scanner/index" options={{ headerShown: true, title: 'Scanner' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

          <Stack.Screen
            name="shop/[id]"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="stall/[id]"
            options={{
              headerShown: false,
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="plans/index"
            options={{
              headerShown: false,
              title: 'Gói hội viên',
              presentation: 'card'
            }}
          />
          <Stack.Screen
            name="plans/payment"
            options={{
              headerShown: false,
              title: 'Thanh toán',
              presentation: 'modal'
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
