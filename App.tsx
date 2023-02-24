import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, /*useState*/ } from 'react';
import {Linking} from 'react-native';

import Navigation from './navigation';
import {Provider,/* useDispatch, useSelector*/} from 'react-redux';
import { store } from "./stores/store";
// import * as Notifications from 'expo-notifications';
import {
    NotificationResponse,
    handleNotificationTask
} from "./utils/notificationService";

const useMount = (func: () => void) => useEffect(() => func(), []);

export default function App() {
    // const isLoadingComplete = useCachedResources();
    handleNotificationTask();
    const lastNotificationResponse = NotificationResponse();
    useMount(() => {
        console.log("app mounted")
    });

    useEffect(() => {
        (async () => {
            try {
                if (
                    lastNotificationResponse &&
                    lastNotificationResponse.notification.request.content.data &&
                    lastNotificationResponse.notification.request.content.data.url
                ) {
                    console.log('notification data background', lastNotificationResponse.notification.request.content.data);
                    // store.dispatch(""); 'notification_id'
                    await Linking.openURL(`${lastNotificationResponse.notification.request.content.data.url}`);
                }
            } catch (e: any) {
                console.log("notification response error", e);
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
