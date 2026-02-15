import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sparkfocus.os',
  appName: 'Spark Focus OS',
  webDir: 'dist',
  android: {
    backgroundColor: '#000000',
    allowMixedContent: false,
    overScrollMode: 'never',
  },
  plugins: {
    StatusBar: {
      backgroundColor: '#000000',
      style: 'LIGHT',
      overlaysWebView: false,
    },
    SplashScreen: {
      backgroundColor: '#000000',
      launchAutoHide: true,
      launchShowDuration: 1000,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
