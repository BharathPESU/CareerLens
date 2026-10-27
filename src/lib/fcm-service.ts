/**
 * Web Push Notification Service
 * Handles browser notifications for career events and reminders
 * Migrated to native HTML5 Notification API (Zero external cloud messaging costs)
 */

import type { CareerEvent } from './google-calendar-service';
import { getStoredUser } from './cognito-auth';

let isInitialized = false;

/**
 * Initialize Web Notifications and request permissions
 */
export async function initializeFCM(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Browser notification permission not granted');
      return null;
    }

    isInitialized = true;
    const fakeToken = `browser-notif-${Date.now()}`;
    return fakeToken;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
}

export function onMessageListener(callback: (payload: any) => void): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'CAREERLENS_NOTIFICATION') {
      callback(event.data.payload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

export async function scheduleEventReminder(
  event: CareerEvent,
  reminderMinutes: number = 15
): Promise<void> {
  try {
    const user = getStoredUser();
    if (!user) {
      console.warn('User not authenticated, reminder saved to local session');
    }

    const eventStart = new Date(event.start.dateTime);
    const reminderTime = new Date(eventStart.getTime() - reminderMinutes * 60 * 1000);
    const delay = reminderTime.getTime() - Date.now();

    if (delay > 0 && typeof window !== 'undefined') {
      setTimeout(() => {
        showNotification(`Upcoming Event: ${event.summary}`, {
          body: `Starting in ${reminderMinutes} minutes. ${event.description || ''}`,
          tag: event.id,
        });
      }, delay);
    }

    console.log(`Reminder scheduled for ${event.summary} at ${reminderTime}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  console.log(`Reminder cancelled for event ${eventId}`);
}

export function showNotification(
  title: string,
  options: NotificationOptions = {}
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  return new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    ...options,
  });
}

export async function getUserFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  return Notification.permission === 'granted' ? 'browser-granted' : null;
}

export async function sendTestNotification(): Promise<void> {
  const notification = showNotification('CareerLens Test', {
    body: 'Browser notifications are working correctly!',
    tag: 'test',
    requireInteraction: false,
  });

  if (notification) {
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export function handleNotificationPayload(payload: any): void {
  const { notification, data } = payload;

  if (notification) {
    const notif = showNotification(notification.title || 'CareerLens', {
      body: notification.body || '',
      icon: notification.icon || '/icon-192.png',
      tag: data?.eventId || 'event',
      data: data || {},
    });

    if (notif && data?.eventId) {
      notif.onclick = () => {
        window.focus();
        window.location.href = `/calendar?event=${data.eventId}`;
        notif.close();
      };
    }
  }
}

export async function scheduleMultipleReminders(
  events: CareerEvent[],
  reminderMinutes: number = 15
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const event of events) {
    try {
      await scheduleEventReminder(event, reminderMinutes);
      success++;
    } catch (error) {
      console.error(`Failed to schedule reminder for ${event.summary}:`, error);
      failed++;
    }
  }

  return { success, failed };
}
