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
// import {useURL} from "expo-linking";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
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

        try {
            token = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (e) {
            return Promise.reject(e)
        }

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
    // const url = useURL()

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                console.log("token", token);
                return saveSecureKey('notification_id', token);
            }
            return Promise.reject("Notification token missing");
        }).catch(error => {
            console.log(error);
        });
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
