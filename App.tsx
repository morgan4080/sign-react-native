import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import {Linking} from 'react-native';

import Navigation from './navigation';
import { Provider } from 'react-redux';
import { store } from "./stores/store";
import {
    NotificationResponse,
    registerForPushNotificationsAsync,
    handleNotificationTask,
    registerTask
} from "./utils/notificationService";

handleNotificationTask();

export default function App() {
    // const isLoadingComplete = useCachedResources();
    const lastNotificationResponse = NotificationResponse();
    const [expoPushToken, setExpoPushToken] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    setExpoPushToken(token);
                    registerTask();
                }
            } catch (e: any) {
                console.log('registerForPushNotificationsAsync error', e);
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            try {
                if (lastNotificationResponse) {
                    console.log('noti', lastNotificationResponse);
                    // await Linking.openURL(lastNotificationResponse.notification.request.content.data.url as string)
                }
            } catch (e: any) {
                console.log("notification response error", e);
            }
        })();
    }, [lastNotificationResponse]);

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                {/*<View style={{position: 'absolute', top: '10%', right: 50, zIndex: 20}}>
                    <Text>Test</Text>
                </View>*/}
                <Navigation />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
