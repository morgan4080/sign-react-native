import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';


const MY_TASK_NAME = 'BACKGROUND-NOTIFICATION-TASK';

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
