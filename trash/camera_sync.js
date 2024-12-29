import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useRef } from 'react';

export function CameraSync({ socket, isModerator }) {
  const { camera } = useThree();
  const cameraRef = useRef({ position: camera.position.clone(), rotation: camera.rotation.clone() });

  useEffect(() => {
    if (isModerator) {
      const syncCamera = () => {
        const cameraData = {
          position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          },
          rotation: {
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z,
          },
        };
        socket.emit('camera_update', cameraData);
      };

      const interval = setInterval(syncCamera, 100);
      return () => clearInterval(interval);
    }

    socket.on('camera_update', (cameraData) => {
      if (!isModerator) {
        camera.position.set(cameraData.position.x, cameraData.position.y, cameraData.position.z);
        camera.rotation.set(cameraData.rotation.x, cameraData.rotation.y, cameraData.rotation.z);
      }
    });

    return () => {
      socket.off('camera_update');
    };
  }, [camera, isModerator, socket]);

  return null;
}

/**
 * Features:
 * 1. **Synchronisierte Kamera:**
 *    - Teilt die Kameraansicht des Moderators mit anderen Benutzern.
 * 2. **Echtzeit-Updates:**
 *    - Kamera-Position und -Rotation werden in Echtzeit synchronisiert.
 * 3. **Moderatorenmodus:**
 *    - Nur der Moderator kann die Kamera steuern.
 */
