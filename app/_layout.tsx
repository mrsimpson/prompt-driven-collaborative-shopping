import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  useFrameworkReady();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (session && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (!session && !inAuthGroup) {
        router.replace('/sign-in');
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      const inAuthGroup = segments[0] === '(auth)';
      
      if (session && inAuthGroup) {
        router.replace('/(tabs)');
      } else if (!session && !inAuthGroup) {
        router.replace('/sign-in');
      }
    });
  }, [segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}