/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */
import * as Notifications from 'expo-notifications';
import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

const prefix = Linking.createURL('');

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [prefix],
  async getInitialURL() {
    // First, you may want to do the default deep link handling
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    // Handle URL from expo push notifications
    const response = await Notifications.getLastNotificationResponseAsync();

    return response?.notification.request.content.data.url;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);

    // Listen to incoming links from deep linking
    const linkingEvent = Linking.addEventListener('url', onReceiveURL);

    // Listen to expo push notifications
    const subscriptionBackground = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data.url;

      // Any custom logic to see whether the URL needs to be handled
      //...

      // Let React Navigation handle the URL
      listener(url);
    });

    const subscriptionForeground = Notifications.addNotificationReceivedListener(notification => {
      // This listener is fired whenever a notification is received while the app is foregrounded.
      if (notification) {
        const url = notification.request.content.data.url;

        // Any custom logic to see whether the URL needs to be handled
        //...

        // Let React Navigation handle the URL
        // listener(url);
      }
    });

    return () => {
      // Clean up the event listeners
      if (linkingEvent) linkingEvent.remove();
      if (subscriptionBackground) subscriptionBackground.remove();
      if (subscriptionForeground) subscriptionForeground.remove();
    };
  },
};

export default linking;
