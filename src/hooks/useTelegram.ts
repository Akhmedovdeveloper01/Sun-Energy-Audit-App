import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

interface UseTelegramReturn {
  tg: any;
  user: any;
  themeParams: any;
  platform: string;
  isReady: boolean;
  onClose: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  hapticImpact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  setMainButtonText: (text: string) => void;
}

export function useTelegram(): UseTelegramReturn {
  const [isReady, setIsReady] = useState(false);
  const [tg, setTg] = useState<any>(null);
  const [themeParams, setThemeParams] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    
    if (webApp) {
      webApp.ready();
      webApp.expand();
      
      setTg(webApp);
      setThemeParams(webApp.themeParams);
      setUser(webApp.initDataUnsafe?.user);
      setPlatform(webApp.platform || 'web');
      setIsReady(true);
    } else {
      console.warn('Telegram WebApp not found, using mock version');
      
      const mockThemeParams = {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#999999',
        link_color: '#2481cc',
        button_color: '#2481cc',
        button_text_color: '#ffffff',
        secondary_bg_color: '#f0f0f0',
      };
      
      const mockTg = {
        ready: () => console.log('Mock: Telegram WebApp ready'),
        expand: () => console.log('Mock: Telegram WebApp expand'),
        close: () => console.log('Mock: Telegram WebApp close'),
        MainButton: {
          show: () => console.log('Mock: MainButton show'),
          hide: () => console.log('Mock: MainButton hide'),
          setText: (text: string) => console.log(`Mock: MainButton setText: ${text}`),
          onClick: (_cb: () => void) => console.log('Mock: MainButton onClick'),
          offClick: () => console.log('Mock: MainButton offClick'),
        },
        BackButton: {
          show: () => console.log('Mock: BackButton show'),
          hide: () => console.log('Mock: BackButton hide'),
          onClick: (_cb: () => void) => console.log('Mock: BackButton onClick'),
        },
        HapticFeedback: {
          impactOccurred: (style: string) => console.log(`Mock: HapticFeedback ${style}`),
        },
        showAlert: (message: string) => alert(message),
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => {
          const result = confirm(message);
          callback(result);
        },
        themeParams: mockThemeParams,
        platform: 'web',
        initDataUnsafe: {
          user: {
            id: 123456789,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'en',
          },
        },
      };
      
      setTg(mockTg);
      setThemeParams(mockThemeParams);
      setUser(mockTg.initDataUnsafe.user);
      setPlatform('web');
      setIsReady(true);
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  const showAlert = (message: string) => {
    tg?.showAlert(message);
  };

  const showConfirm = async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (tg?.showConfirm) {
        tg.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else {
        const result = confirm(message);
        resolve(result);
      }
    });
  };

  const hapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    tg?.HapticFeedback?.impactOccurred(style);
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.onClick(onClick);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
      tg.MainButton.offClick();
    }
  };

  const setMainButtonText = (text: string) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
    }
  };

  return {
    tg,
    user,
    themeParams,
    platform,
    isReady,
    onClose,
    showAlert,
    showConfirm,
    hapticImpact,
    showMainButton,
    hideMainButton,
    setMainButtonText,
  };
}