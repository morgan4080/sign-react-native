import {NativeModules} from 'react-native';

type ImmediateAppUpdateType = {
    startInAppUpdate(requestCode: number): void;
    popSnackBarForUserConfirmation(message: string, status?: string, actionText?: string, callback?: () => void): void;
}

const GooglePlayApis: ImmediateAppUpdateType = NativeModules.GooglePlayApis;

export const checkToStartUpdate = (requestCode?: number) => {
    return GooglePlayApis.startInAppUpdate(requestCode || 14);
};

export const showSnack = (message: string, status?: string, actionText?: string, callback?: () => void) => {
    return GooglePlayApis.popSnackBarForUserConfirmation(message, status, actionText, callback);
}