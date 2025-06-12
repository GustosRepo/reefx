import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  RequestOptions,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";

export default function AdBanner() {
  const adUnitId =
    __DEV__
      ? TestIds.BANNER
      : Platform.select({
          ios: Constants.expoConfig?.extra?.iosAdUnitId,
          android: Constants.expoConfig?.extra?.androidAdUnitId,
        }) || TestIds.BANNER;

  const requestOptions: RequestOptions = {
    requestNonPersonalizedAdsOnly: true,
  };

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={requestOptions}
        onAdFailedToLoad={(err) => console.warn("Ad failed to load:", err)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    backgroundColor: "#000",
  },
});