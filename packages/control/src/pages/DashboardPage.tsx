import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceInfo } from '@tivi/shared';
import { useAuthStore } from '../stores/authStore';
import { socketService } from '../services/socketService';

export function DashboardPage() {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const navigate = useNavigate();
  const { token, email, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    socketService.connect(token);
    
    socketService.on('devices:list', (deviceList: DeviceInfo[]) => {
      setDevices(deviceList);
    });

    socketService.on('devices:updated', (deviceList: DeviceInfo[]) => {
      setDevices(deviceList);
    });

    socketService.emit('device:list');

    return () => {
      socketService.off('devices:list');
      socketService.off('devices:updated');
    };
  }, [token, navigate]);

  const handleConnect = (deviceId: string) => {
    navigate(`/control/${deviceId}`);
  };

  const handleLogout = () => {
    clearAuth();
    socketService.disconnect();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>Tivi Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>{email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <h2>Available Devices</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {devices.length === 0 ? (
          <p>No devices connected. Install the Tivi agent on your devices to get started.</p>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                background: device.online ? '#f0f9ff' : '#f5f5f5'
              }}
            >
              <h3>{device.name}</h3>
              <p>Platform: {device.platform}</p>
              <p>OS: {device.osVersion}</p>
              <p>Status: {device.online ? '🟢 Online' : '🔴 Offline'}</p>
              {device.capabilities && (
                <p>Resolution: {device.capabilities.resolution.width}x{device.capabilities.resolution.height}</p>
              )}
              <button
                onClick={() => handleConnect(device.id)}
                disabled={!device.online}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: device.online ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: device.online ? 'pointer' : 'not-allowed'
                }}
              >
                Connect
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}