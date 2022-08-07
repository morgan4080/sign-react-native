import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import {Linking} from 'react-native';
// import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
import { Provider } from 'react-redux';
import { store } from "./stores/store";
import {NotificationResponse} from "./utils/notificationService";

export default function App() {
    // const isLoadingComplete = useCachedResources();
    const lastNotificationResponse = NotificationResponse();

    useEffect(() => {
        (async () => {
            if (lastNotificationResponse) {
                await Linking.openURL(lastNotificationResponse.notification.request.content.data.url as string)
            }
        })();
    }, [lastNotificationResponse]);

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <Navigation />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
