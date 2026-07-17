import { SplashScreen, Stack } from "expo-router";
import "@/global.css"
import {useFonts} from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey || publishableKey === 'pk_live_REPLACE_ME') {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

SplashScreen.preventAutoHideAsync()

function InitialLayout() {
  const { isLoaded: isAuthLoaded } = useAuth()
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  })

  useEffect(() => {
    if (fontsLoaded && isAuthLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isAuthLoaded])

  if (!fontsLoaded || !isAuthLoaded) {
    return null
  }

  return <Stack screenOptions={{headerShown: false}}/>
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
}
