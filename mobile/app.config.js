export default {
  expo: {
    name: "REEFX",
    slug: "reefx",
    version: "0.6.0", // ← back to version 6
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
      buildNumber: "6", // ← rollback build number
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Take livestock photos"
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
    extra: {
      eas: {
        projectId: "72f1f0e0-1fd7-4bcf-a189-202fd92282ee"
      }
    }
  }
};