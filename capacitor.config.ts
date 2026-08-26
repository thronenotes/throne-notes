import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.thronenotes.app",
  appName: "Throne Notes",
  webDir: "dist",
  server: {
    url: "https://thronenotes.com",
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0A0A0F",
    },
  },
};

export default config;