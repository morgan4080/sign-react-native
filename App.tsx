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
        const getUrlAsync = async () => {
            // Get the deep link used to open the app
            const initialUrl = await Linking.getInitialURL();

            // The setTimeout is just for testing purpose
            setTimeout(() => {
                console.log("initialUrl", initialUrl);
            }, 1000);
        };

        getUrlAsync();
    });

    useEffect(() => {
        (async () => {
            try {
                if (lastNotificationResponse?.notification.request.content.data.url) {
                    console.log('notification data background', lastNotificationResponse?.notification.request.content.data);
                    // store.dispatch("");
                    await Linking.openURL("presta-sign://app/loan-request");
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
