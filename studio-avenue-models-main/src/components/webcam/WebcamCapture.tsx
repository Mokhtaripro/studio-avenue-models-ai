import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, CheckCircle2 } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (blob: Blob) => void;
  capturedImage: string | null;
  onRetake: () => void;
}

const WebcamCapture = ({ onCapture, capturedImage, onRetake }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  }, [onCapture, stopCamera]);

  const handleRetake = () => {
    onRetake();
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="aspect-[4/3] bg-muted border-2 border-foreground overflow-hidden">
          <img 
            src={capturedImage} 
            alt="Photo capturée" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-center gap-2 text-foreground">
          <CheckCircle2 size={20} />
          <span className="text-sm font-sans">Photo capturée avec succès</span>
        </div>
        <Button
          variant="luxuryOutline"
          size="xl"
          className="w-full"
          onClick={handleRetake}
        >
          <RefreshCw size={18} />
          Reprendre la photo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] bg-muted border-2 border-dashed border-border overflow-hidden relative">
        {!stream && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera size={48} className="text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center font-sans px-8">
              Cliquez pour activer votre caméra et prendre une photo de vérification
            </p>
            {error && (
              <p className="text-sm text-destructive text-center font-sans px-8 mt-4">
                {error}
              </p>
            )}
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${stream ? "block" : "hidden"}`}
        />
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      {!stream ? (
        <Button
          variant="luxuryOutline"
          size="xl"
          className="w-full"
          onClick={startCamera}
          disabled={isLoading}
        >
          <Camera size={18} />
          {isLoading ? "Activation..." : "Activer la caméra"}
        </Button>
      ) : (
        <Button
          variant="luxury"
          size="xl"
          className="w-full"
          onClick={capturePhoto}
        >
          <Camera size={18} />
          Capturer ma photo
        </Button>
      )}
    </div>
  );
};

export default WebcamCapture;
