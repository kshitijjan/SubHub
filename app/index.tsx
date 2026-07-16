import { Redirect } from "expo-router";

/**
 * Redirects the initial route to the tab navigation.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
