import { Platform } from 'react-native';
import {NativeModules} from 'react-native';

type ImmediateAppUpdateType = {
    startInAppUpdate(requestCode: number): void;
    dismissSnack(): void;
    popSnackBarForUserConfirmation(message: string, status?: string, actionText?: string, INDEFINITE?: boolean, callback?: () => void): void;
}

const GooglePlayApis: ImmediateAppUpdateType = NativeModules.GooglePlayApis;

export const checkToStartUpdate = (requestCode?: number) => {
    if (Platform.OS === 'android' && GooglePlayApis) {
        return GooglePlayApis.startInAppUpdate(requestCode || 14);
    }
};

export const showSnack = (message: string, status?: string, actionText?: string, indefinite: boolean = false, callback?: () => void) => {
    if (Platform.OS === 'android' && GooglePlayApis) { 
        return GooglePlayApis.popSnackBarForUserConfirmation(message, status, actionText, indefinite, callback);
    } else {
        alert(message)
    }
}

export const dismissSnack = () => {
    if (Platform.OS === 'android' && GooglePlayApis) {
        return GooglePlayApis.dismissSnack();
    }
}