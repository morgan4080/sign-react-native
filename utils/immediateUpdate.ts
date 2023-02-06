import {NativeModules} from 'react-native';

type ImmediateAppUpdateType = {
    startInAppUpdate(requestCode: number): void;
    dismissSnack(): void;
    popSnackBarForUserConfirmation(message: string, status?: string, actionText?: string, INDEFINITE?: boolean, callback?: () => void): void;
}

const GooglePlayApis: ImmediateAppUpdateType = NativeModules.GooglePlayApis;

export const checkToStartUpdate = (requestCode?: number) => {
    return GooglePlayApis.startInAppUpdate(requestCode || 14);
};

export const showSnack = (message: string, status?: string, actionText?: string, indefinite: boolean = false, callback?: () => void) => {
    return GooglePlayApis.popSnackBarForUserConfirmation(message, status, actionText, indefinite, callback);
}

export const dismissSnack = () => {
    return GooglePlayApis.dismissSnack();
}