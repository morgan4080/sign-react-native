import * as Notifications from 'expo-notifications';
import {Platform} from "react-native";
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';


const MY_TASK_NAME = 'BACKGROUND-NOTIFICATION-TASK';

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
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

export const registerTask = () => {
    (async () => {
        await Notifications.registerTaskAsync(MY_TASK_NAME);
        console.log('Task: ' + MY_TASK_NAME + '(Registered)');
    })();
};

export const handleNotificationTask = (): void => {

    TaskManager.defineTask(MY_TASK_NAME, ({data, error}) => {
        // Received a notification in the background!

        if (error) {
            console.log('background task error', error);
            return
        }

        console.log('background notification task defined', data);
    });
};

export const NotificationResponse = () => {
    return Notifications.useLastNotificationResponse();
}
