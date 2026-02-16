import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/constants';

// Lazy-load expo-notifications to avoid startup crashes
let Notifications: typeof import('expo-notifications') | null = null;
function getNotifications() {
  if (!Notifications) {
    Notifications = require('expo-notifications');
  }
  return Notifications;
}

export interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

// Track if handler has been set up
let notificationHandlerConfigured = false;

function configureNotificationHandler() {
  if (notificationHandlerConfigured) return;
  try {
    const N = getNotifications();
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  } catch (error) {
    console.warn('Failed to configure notification handler:', error);
  }
}

// Called lazily from _layout.tsx via require()
export function initPushNotifications() {
  configureNotificationHandler();
  registerForPushNotificationsAsync().then(token => {
    if (token) {
      storage.set(STORAGE_KEYS.PUSH_TOKEN, token);
    }
  }).catch(error => {
    console.warn('Failed to register for push notifications:', error);
  });
}

export function usePushNotifications(): PushNotificationState {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const notificationListener = useRef<any | null>(null);
  const responseListener = useRef<any | null>(null);

  useEffect(() => {
    try {
      const N = getNotifications();
      configureNotificationHandler();

      registerForPushNotificationsAsync().then(token => {
        if (token) {
          setExpoPushToken(token);
          storage.set(STORAGE_KEYS.PUSH_TOKEN, token);
        }
      }).catch(error => {
        console.warn('Failed to register for push notifications:', error);
      });

      notificationListener.current = N.addNotificationReceivedListener(notification => {
        setNotification(notification);
      });

      responseListener.current = N.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
      });

      return () => {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      };
    } catch (error) {
      console.warn('Push notification setup failed:', error);
    }
  }, []);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  const N = getNotifications();

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'default',
      importance: N.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0891b2',
    });

    await N.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance Reminders',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
    });

    await N.setNotificationChannelAsync('alerts', {
      name: 'Parameter Alerts',
      importance: N.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#ef4444',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await N.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await N.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await N.getExpoPushTokenAsync({
      projectId: '4b77890a-0c32-41d4-a99f-e1009bbce051',
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Helper to schedule local notifications
export async function scheduleMaintenanceReminder(
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  const N = getNotifications();
  const identifier = await N.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: { type: 'maintenance' },
    },
    trigger: {
      date: triggerDate,
      channelId: 'maintenance',
    },
  });
  return identifier;
}

export async function scheduleParameterAlert(
  title: string,
  body: string
): Promise<string> {
  const N = getNotifications();
  const identifier = await N.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      priority: N.AndroidNotificationPriority.HIGH,
      data: { type: 'alert' },
    },
    trigger: null, // Immediate
  });
  return identifier;
}

export async function cancelNotification(identifier: string): Promise<void> {
  const N = getNotifications();
  await N.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications(): Promise<void> {
  const N = getNotifications();
  await N.cancelAllScheduledNotificationsAsync();
}
