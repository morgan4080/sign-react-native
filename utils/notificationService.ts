import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import {Platform} from "react-native";
import * as TaskManager from 'expo-task-manager';


const MY_TASK_NAME = 'BACKGROUND-NOTIFICATION-TASK';

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    if (!Constants.isDevice) {
        alert("Must use physical device for Push Notifications");
        return null;
    }

    const {status} = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
        alert("Failed to get push token for push notification!");
        return null;
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    return (await Notifications.getExpoPushTokenAsync()).data;

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
