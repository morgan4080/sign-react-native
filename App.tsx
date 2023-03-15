import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import Navigation from './navigation';
import {Provider} from 'react-redux';
import { store } from "./stores/store";
import * as Notifications from 'expo-notifications';
import {saveSecureKey} from "./utils/secureStore";
import * as Device from "expo-device";
import {Subscription} from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        alert(token);
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
};

export default function App() {
    // const isLoadingComplete = useCachedResources();
    /*handleNotificationTask();
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
    }, [lastNotificationResponse]);*/

    // register for push notifications
    /*let token;
    try {
        token = await registerForPushNotificationsAsync();
    } catch (e) {
        console.log("registerForPushNotificationsAsync", JSON.stringify(e));
        // showSnack(e.message, "ERROR", "", false)
    }
    if (token) {
        try {
            await Promise.allSettled([
                saveSecureKey('notification_id', token),
                /!*dispatch(pingBeacon({
                    appName: Constants.manifest?.android?.package,
                    notificationTok: token,
                    version: Constants.manifest?.version
                }))*!/
            ])

            registerTask();
        } catch (e) {
            console.log("registerTask", JSON.stringify(e));
        }
    }*/

    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [notification, setNotification] = useState<Notification | any>(null);
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token)
                return saveSecureKey('notification_id', token)
            }
            return Promise.reject("Notification token missing");
        }).catch(error => {
            console.log("registerForPushNotificationsAsyncNew", JSON.stringify(error));
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            // This listener is fired whenever a notification is received while the app is foregrounded.
            if (notification) setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            // This listener is fired whenever a user taps on or interacts with a notification (works when an app is foregrounded, backgrounded, or killed).
            console.log(response);
        });

        return () => {
            if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
            if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);


    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <Navigation />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
