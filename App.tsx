import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import {Linking} from 'react-native';

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
                {/*<View style={{position: 'absolute', top: '10%', right: 50, zIndex: 20}}>
                    <Text>Test</Text>
                </View>*/}
                <Navigation />
                <StatusBar />
            </SafeAreaProvider>
        </Provider>
    );
}
