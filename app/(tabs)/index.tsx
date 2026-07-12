import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { styled } from 'nativewind'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

//SafeAreaView is the 3rd party component and does not support style so
//nativewind need styled component to enable style support
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">Go to onboarding</Link>
      <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white p-4">SignIn</Link>
      <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white p-4">Create an account</Link>

      <Link href='/subscriptions/spotify'>Spotify subscription</Link>
      <Link href={{
        pathname: '/subscriptions/[id]',
        params: {id: 'claude'}
      }}>Claude Max subscription</Link>
    </SafeAreaView>
  );
}