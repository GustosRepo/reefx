import "dotenv/config";

export default {
  expo: {
    name: "REEFX ONE",
    slug: "reefx",
    version: "1.0.6",
    orientation: "portrait",
    icon: "./assets/applogo.png",
    userInterfaceStyle: "dark",
    scheme: "reefx",
    splash: {
      image: "./assets/applogo.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    ios: {
      bundleIdentifier: "com.codewerx.reefx",
      buildNumber: "6",
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Take livestock photos",
        NSUserTrackingUsageDescription: "This identifier is used to deliver personalized ads and measure app performance.",
        ITSAppUsesNonExemptEncryption: false,
        NSPrivacyPolicyURL: "https://code-wrx.com/privacy-policy",
        GADApplicationIdentifier: process.env.IOS_ADMOB_APP_ID, // AdMob App ID for iOS
      }
    },
    android: {
      package: "com.codewerx.reefx",
      versionCode: 6,
      edgeToEdgeEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/applogo.png",
        backgroundColor: "#000000"
      },
      permissions: []
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    web: {
      favicon: "./assets/applogo.png"
    },
    plugins: [
      [
        "react-native-google-mobile-ads",
        {
          iosAppId: process.env.IOS_ADMOB_APP_ID, // ex: ca-app-pub-xxxxxxxx~yyyyyyyyyy
          androidAppId: process.env.ANDROID_ADMOB_APP_ID, // test or real
          userTrackingUsageDescription: "This identifier will be used to deliver personalized ads to you.",
          skAdNetworkItems: [
            "cstr6suwn9.skadnetwork",
            "4fzdc2evr5.skadnetwork",
            "2fnua5tdw4.skadnetwork",
            "5a6flpkh64.skadnetwork",
            "6g9af0c88g.skadnetwork"
          ]
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "72f1f0e0-1fd7-4bcf-a189-202fd92282ee"
      },
      iosAdUnitId: process.env.ADMOB_UNIT_ID,       // 👈 used in code for displaying banners
      androidAdUnitId: process.env.ADMOB_UNIT_ID    // even if not used now, future proofing
    }
  }
};