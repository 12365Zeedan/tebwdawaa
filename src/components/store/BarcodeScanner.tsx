import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { ScanLine, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const t = {
    scanBarcode: language === 'ar' ? 'مسح الباركود' : 'Scan Barcode',
    scanInstructions: language === 'ar' 
      ? 'وجّه الكاميرا نحو الباركود أو رمز QR' 
      : 'Point your camera at a barcode or QR code',
    cameraError: language === 'ar' 
      ? 'تعذر الوصول إلى الكاميرا' 
      : 'Unable to access camera',
    close: language === 'ar' ? 'إغلاق' : 'Close',
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timeout = setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner(
            'barcode-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 150 },
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
              rememberLastUsedCamera: true,
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              onScan(decodedText);
              setIsOpen(false);
            },
            (errorMessage) => {
              // Ignore frequent scan errors
              console.debug('Scan error:', errorMessage);
            }
          );
        } catch (err) {
          setError(t.cameraError);
          console.error('Scanner initialization error:', err);
        }
      }, 100);

      return () => {
        clearTimeout(timeout);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen, onScan, t.cameraError]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <ScanLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t.scanBarcode}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t.scanInstructions}
          </p>
          
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <div 
              id="barcode-reader" 
              className="w-full overflow-hidden rounded-lg"
              style={{ minHeight: '300px' }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
