import { init as initSDK } from '@tma.js/sdk';

interface InitOptions {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}

export async function init(options: InitOptions): Promise<void> {
  const { debug, mockForMacOS } = options;

  // Debug mode
  if (debug) {
    console.log('Debug mode enabled');
  }

  // Mock environment for macOS (soddalashtirilgan)
  if (mockForMacOS) {
    // Mock environment ni oddiygina o'rnatish
    if (typeof window !== 'undefined' && !(window as any).Telegram) {
      (window as any).Telegram = {
        WebApp: {
          initData: '',
          initDataUnsafe: {},
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
          },
          version: '7.0',
          platform: 'macos',
          ready: () => console.log('Mock WebApp ready'),
          expand: () => console.log('Mock WebApp expand'),
          close: () => console.log('Mock WebApp close'),
        },
      };
    }
  }

  // SDK ni ishga tushirish
  await initSDK();
}