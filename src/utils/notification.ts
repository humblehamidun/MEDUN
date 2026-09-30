import { ReminderNotification } from '../types';
import { soundChime } from './audio';

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export function triggerSystemNotification(
  notification: Omit<ReminderNotification, 'id' | 'timestamp' | 'isRead'>,
  enableSound: boolean = true,
  enableBrowserNotification: boolean = true
) {
  // Play sound chime if enabled
  if (enableSound) {
    soundChime.playChime();
  }

  // Trigger browser push notification if supported & permitted
  if (enableBrowserNotification && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Failed to send browser notification:', e);
      }
    }
  }
}
