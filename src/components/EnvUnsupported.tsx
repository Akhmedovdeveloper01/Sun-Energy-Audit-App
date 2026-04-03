import { useEffect, useState } from 'react';

interface EnvUnsupportedProps {
  error?: Error;
}

export function EnvUnsupported({ error }: EnvUnsupportedProps = {}) {
  const [countdown, setCountdown] = useState<number>(5);
  const [redirectAttempted, setRedirectAttempted] = useState<boolean>(false);

  useEffect(() => {
    // Avtomatik redirect qilish uchun countdown
    if (countdown > 0 && !redirectAttempted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !redirectAttempted) {
      setRedirectAttempted(true);
      // Telegram bot linkiga redirect qilish
      const botUsername = 'SunEnergyAudit_Bot';
      const webAppShortName = 'audit';
      window.location.href = `https://t.me/${botUsername}/${webAppShortName}`;
    }
  }, [countdown, redirectAttempted]);

  const handleOpenInTelegram = () => {
    const botUsername = 'SunEnergyAudit_Bot';
    const webAppShortName = 'audit';
    window.location.href = `https://t.me/${botUsername}/${webAppShortName}`;
  };

  const handleCopyLink = () => {
    const link = `https://t.me/SunEnergyAudit_Bot/audit`;
    navigator.clipboard.writeText(link);
    alert('✅ Link nusxalandi! Telegramda oching.');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.icon}>⚠️</span>
        </div>

        {/* Title */}
        <h1 style={styles.title}>Muhit qo‘llab-quvvatlanmaydi</h1>

        {/* Description */}
        <p style={styles.description}>
          Bu ilova faqat <strong>Telegram</strong> orqali ishlaydi. 
          Iltimos, ilovani Telegram'da oching.
        </p>

        {/* Error details (agar error bo'lsa) */}
        {error && (
          <details style={styles.details}>
            <summary style={styles.summary}>Texnik ma'lumot</summary>
            <pre style={styles.errorDetails}>
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Countdown */}
        <div style={styles.countdownContainer}>
          <p style={styles.countdownText}>
            Avtomatik o‘tish: <strong>{countdown}</strong> soniya
          </p>
          <div style={styles.progressBar}>
            <div 
              style={{ 
                ...styles.progressFill, 
                width: `${(5 - countdown) / 5 * 100}%` 
              }} 
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <button 
            onClick={handleOpenInTelegram} 
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📱 Telegram'da ochish
          </button>
          
          <button 
            onClick={handleCopyLink} 
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            📋 Linkni nusxalash
          </button>
        </div>

        {/* Help text */}
        <p style={styles.helpText}>
          Telegram'da <code style={styles.code}>@SunEnergyAudit_Bot</code> ni qidiring<br />
          yoki quyidagi linkni bosing:
        </p>
        
        <div style={styles.linkContainer}>
          <code style={styles.linkCode}>
            t.me/SunEnergyAudit_Bot/audit
          </code>
          <button 
            onClick={handleCopyLink}
            style={styles.copyButton}
            title="Nusxalash"
          >
            📋
          </button>
        </div>

        {/* QR Code (ixtiyoriy) */}
        <div style={styles.qrContainer}>
          <p style={styles.qrText}>QR kodni skanerlang:</p>
          <div style={styles.qrPlaceholder}>
            {/* QR kod generatori kerak bo'lsa, qr-code-react paketini o'rnating */}
            <span style={styles.qrIcon}>📱</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    background: 'white',
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center' as const,
    animation: 'fadeInUp 0.5s ease',
  },
  iconContainer: {
    marginBottom: '24px',
  },
  icon: {
    fontSize: '64px',
    display: 'inline-block',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  details: {
    marginBottom: '24px',
    textAlign: 'left' as const,
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '12px',
  },
  summary: {
    cursor: 'pointer',
    color: '#667eea',
    fontWeight: '500',
    fontSize: '14px',
  },
  errorDetails: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#f44336',
    overflow: 'auto',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-all' as const,
  },
  countdownContainer: {
    marginBottom: '32px',
  },
  countdownText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  progressBar: {
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 1s linear',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
  },
  button: {
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  buttonSecondary: {
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
  },
  helpText: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '16px',
  },
  code: {
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  linkContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#f8f9fa',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0',
  },
  linkCode: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#667eea',
    wordBreak: 'break-all' as const,
    flex: 1,
    textAlign: 'left' as const,
  },
  copyButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'background 0.3s',
  },
  qrContainer: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  qrText: {
    fontSize: '13px',
    color: '#999',
    marginBottom: '12px',
  },
  qrPlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '120px',
    height: '120px',
    margin: '0 auto',
    background: '#f8f9fa',
    borderRadius: '16px',
    border: '2px dashed #ddd',
  },
  qrIcon: {
    fontSize: '48px',
  },
};

// Animation (CSS-in-JS)
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);