import { useRef, useState, useCallback } from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface PhotoCaptureProps {
  data: string[];
  update: (photos: string[]) => void;
  next: () => void;
  prev: () => void;
}

export default function PhotoCapture({ data, update, next, prev }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<string[]>(data);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tg, showAlert, hapticImpact } = useTelegram();

  // 1-usul: Telegram WebApp orqali surat olish (eng to'g'ri usul)
  const takePhotoViaTelegram = () => {
    hapticImpact('medium');
    
    // Telegram WebApp da surat olish uchun popup
    tg.showPopup({
      title: '📸 Surat olish',
      message: 'Suratni qanday olishni tanlang:',
      buttons: [
        { id: 'camera', type: 'default', text: '📷 Kamera' },
        { id: 'gallery', type: 'default', text: '🖼️ Galereya' },
        { id: 'cancel', type: 'cancel', text: '❌ Bekor qilish' }
      ]
    }, (buttonId: string) => {
      if (buttonId === 'camera') {
        // Telegram WebApp kamerasini ochish
        tg.showScanQrPopup({
          text: 'Kamerani yoqish uchun ruxsat bering'
        }, (result: string) => {
          // Bu QR kod skanerlash uchun, surat olish uchun emas
          console.log('QR result:', result);
        });
        
        // Aslida Telegram WebApp da to'g'ridan-to'g'ri kamera uchun:
        // input type="file" accept="image/*" dan foydalanish kerak
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      } else if (buttonId === 'gallery') {
        if (fileInputRef.current) {
          fileInputRef.current.accept = 'image/*';
          fileInputRef.current.click();
        }
      }
    });
  };

  // 2-usul: Input file orqali surat olish (eng ishonchli)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Faqat rasm fayllarini tanlang!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('Rasm hajmi 10MB dan kichik bo\'lishi kerak!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newPhotos = [...photos, imageData];
      setPhotos(newPhotos);
      update(newPhotos);
      hapticImpact('light');
      showAlert('✅ Surat muvaffaqiyatli qo\'shildi!');
    };
    reader.onerror = () => {
      showAlert('Suratni o\'qishda xatolik yuz berdi');
    };
    reader.readAsDataURL(file);
  };

  // 3-usul: MediaDevices API orqali (agar input file ishlamasa)
  const checkCameraSupport = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showAlert('Brauzeringiz kamerani qo‘llab-quvvatlamaydi. Iltimos, suratni fayl orqali yuklang.');
      setUseFallback(true);
      return false;
    }
    return true;
  };

  const startCamera = useCallback(async () => {
    setError('');
    const isSupported = await checkCameraSupport();
    if (!isSupported) return;

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        hapticImpact('light');
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        showAlert('Kameraga ruxsat berilmadi. Iltimos, suratni fayl orqali yuklang.');
        setUseFallback(true);
      } else if (err.name === 'NotFoundError') {
        showAlert('Kamera topilmadi. Suratni fayl orqali yuklang.');
        setUseFallback(true);
      } else {
        showAlert('Kamerani yoqishda xatolik: ' + err.message);
      }
      setError(err.message);
    }
  }, [showAlert, hapticImpact]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        const newPhotos = [...photos, imageData];
        setPhotos(newPhotos);
        update(newPhotos);
        hapticImpact('light');
        showAlert('Surat muvaffaqiyatli olindi!');
      }
    } else {
      showAlert('Kamera tayyor emas. Iltimos, qayta urinib ko\'ring.');
    }
  }, [photos, update, hapticImpact, showAlert]);

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    update(newPhotos);
    hapticImpact('light');
  };

  const handlePrev = () => {
    stopCamera();
    prev();
  };

  const handleNext = () => {
    stopCamera();
    next();
  };

  return (
    <div className="photo-capture">
      <h2>📸 Suratga olish</h2>
      <p>Panel, hisoblagich va shikastlanishlarni suratga oling</p>
      
      {/* Hidden file input for fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffeeee', borderRadius: '8px' }}>
          ⚠️ Xatolik: {error}
        </div>
      )}
      
      {useFallback && (
        <div style={{ 
          background: '#fff3cd', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #ffc107'
        }}>
          <p style={{ margin: 0, color: '#856404' }}>
            📱 Kamera to‘g‘ridan-to‘g‘ri ishlamayapti. Iltimos, quyidagi tugma orqali surat yuklang.
          </p>
        </div>
      )}
      
      {/* Telegram style camera button */}
      <button 
        onClick={takePhotoViaTelegram} 
        style={{
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          cursor: 'pointer'
        }}
      >
        📷 Surat olish / Yuklash
      </button>
      
      {/* Alternative method */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          padding: '12px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          marginBottom: '16px',
          cursor: 'pointer'
        }}
      >
        🖼️ Galereyadan surat tanlash
      </button>
      
      {/* Camera preview (agar ishlayotgan bo'lsa) */}
      {cameraActive && (
        <div className="camera-preview">
          <video ref={videoRef} autoPlay playsInline className="video-preview" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-buttons">
            <button onClick={capturePhoto} className="btn-capture">📷 Surat olish</button>
            <button onClick={stopCamera} className="btn-stop">⏹️ Kamerani to‘xtatish</button>
          </div>
        </div>
      )}
      
      {!cameraActive && !useFallback && (
        <button onClick={startCamera} className="btn-start-camera">
          📱 Kamerani yoqish (agar ishlasa)
        </button>
      )}
      
      {/* Photos gallery */}
      {photos.length > 0 && (
        <div className="photo-gallery">
          <h3>Olingan suratlar ({photos.length})</h3>
          <div className="photos-grid">
            {photos.map((photo, idx) => (
              <div key={idx} className="photo-item">
                <img src={photo} alt={`audit-${idx}`} />
                <button onClick={() => removePhoto(idx)} className="btn-remove">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="button-group">
        <button onClick={handlePrev} className="btn-prev">← Orqaga</button>
        <button onClick={handleNext} className="btn-next" disabled={photos.length === 0}>
          Keyingi → {photos.length === 0 && '(kamida 1 ta surat)'}
        </button>
      </div>
    </div>
  );
}