import {NativeModules} from 'react-native';

type ImmediateAppUpdateType = {
    startInAppUpdate(requestCode: number): void;
}

const GooglePlayApis: ImmediateAppUpdateType = NativeModules.GooglePlayApis;

export const checkToStartUpdate = (requestCode?: number) => {
    return GooglePlayApis.startInAppUpdate(requestCode || 14);
};