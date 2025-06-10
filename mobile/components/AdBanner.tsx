// components/AdBanner.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { AdMobBanner } from "expo-ads-admob";

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID="ca-app-pub-3940256099942544/2934735716" // test ID
        servePersonalizedAds
        onDidFailToReceiveAdWithError={(e) => console.warn("AdMob error", e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
});