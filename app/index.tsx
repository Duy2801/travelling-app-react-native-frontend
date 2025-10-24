import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login screen as default
  return <Redirect href="/login" />;
}
