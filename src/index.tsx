import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { init } from './init.ts';
import { Root } from './Root.tsx';
import './index.css';
import { EnvUnsupported } from './components/EnvUnsupported.tsx';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// 👇 SHU YERGA YOZASAN
async function bootstrap() {
  try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;

    const debug =
      (launchParams.tgWebAppStartParam || '').includes('debug') ||
      import.meta.env.DEV;

    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });

    root.render(
      <StrictMode>
        <Root />
      </StrictMode>
    );
  } catch (e) {
    root.render(<EnvUnsupported />);
  }
}

// 👇 FUNCTIONNI CHAQRISH
bootstrap();