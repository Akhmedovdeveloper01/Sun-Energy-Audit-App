import { useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import App from './App';

export function Root() {
  const { tg, isReady } = useTelegram();

  useEffect(() => {
    if (isReady && tg) {
      tg.ready();
      tg.expand();
      tg.BackButton?.hide();
    }
  }, [tg, isReady]);

  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <App />;
}