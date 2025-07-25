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
        });

  if (!__DEV__ && !adUnitId) return null;

  const requestOptions: RequestOptions = {
    requestNonPersonalizedAdsOnly: true,
  };

  // Temporarily disabled AdMob banner for App Store review.
  // return (
  //   <View style={styles.container}>
  //     <BannerAd
  //       unitId={adUnitId}
  //       size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  //       requestOptions={requestOptions}
  //       onAdFailedToLoad={(err) => console.warn("Ad failed to load:", err)}
  //     />
  //   </View>
  // );
  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    backgroundColor: "#000",
  },
});