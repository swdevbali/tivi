import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebRTCService } from '../services/webrtcService';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores/authStore';

export function RemoteControlPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token || !deviceId) {
      navigate('/dashboard');
      return;
    }

    const initConnection = async () => {
      webrtcRef.current = new WebRTCService(deviceId, socketService);
      
      webrtcRef.current.on('stream', (stream: MediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });

      webrtcRef.current.on('connectionStateChange', (state: string) => {
        setConnectionState(state);
      });

      socketService.emit('control:request', { targetDeviceId: deviceId });

      socketService.on('control:approved', async () => {
        await webrtcRef.current?.connect();
      });

      socketService.on('control:denied', () => {
        alert('Connection denied by device');
        navigate('/dashboard');
      });
    };

    initConnection();

    return () => {
      webrtcRef.current?.disconnect();
      socketService.off('control:approved');
      socketService.off('control:denied');
    };
  }, [token, deviceId, navigate]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectionState !== 'connected' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    webrtcRef.current?.sendMouseEvent({
      type: 'move',
      x,
      y,
      timestamp: Date.now()
    });
  };

  const handleMouseClick = (e: React.MouseEvent) => {
    if (connectionState !== 'connected' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    webrtcRef.current?.sendMouseEvent({
      type: 'click',
      x,
      y,
      button: e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle',
      timestamp: Date.now()
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (connectionState !== 'connected') return;
    
    e.preventDefault();
    webrtcRef.current?.sendKeyboardEvent({
      type: 'keyDown',
      key: e.key,
      code: e.code,
      modifiers: {
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey
      },
      timestamp: Date.now()
    });
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (connectionState !== 'connected') return;
    
    e.preventDefault();
    webrtcRef.current?.sendKeyboardEvent({
      type: 'keyUp',
      key: e.key,
      code: e.code,
      modifiers: {
        shift: e.shiftKey,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey
      },
      timestamp: Date.now()
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [connectionState]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      background: '#000'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: '#222',
        color: 'white'
      }}>
        <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        <span>Status: {connectionState}</span>
        <button onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative'
      }}>
        {connectionState === 'connecting' && (
          <div style={{ color: 'white' }}>Connecting to device...</div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: connectionState === 'connected' ? 'block' : 'none'
          }}
        />
        
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleMouseClick}
          onContextMenu={(e) => {
            e.preventDefault();
            handleMouseClick(e);
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            pointerEvents: connectionState === 'connected' ? 'auto' : 'none'
          }}
        />
      </div>
    </div>
  );
}