import { Redirect } from "expo-router";
import AdBanner from "../components/AdBanner";

export default function Index() {
  return (
    <>
      <AdBanner />
      <Redirect href="/(tabs)/home" />
    </>
  );
}