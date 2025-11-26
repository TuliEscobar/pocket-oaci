import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oaci.app',
  appName: 'OACI.ai',
  webDir: 'out',
  server: {
    // DEVELOPMENT MODE: Uncomment to test with local Next.js server
    // url: 'http://localhost:3000',
    // cleartext: true

    // PRODUCTION MODE: Point to your deployed Vercel app
    url: 'https://oaci-ai.vercel.app',
    cleartext: false
  }
};

export default config;
