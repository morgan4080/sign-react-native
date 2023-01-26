import {NativeModules} from 'react-native';

type ImmediateAppUpdateType = {
    startInAppUpdate(requestCode: number): void;
}

const GooglePlay: ImmediateAppUpdateType = NativeModules.GooglePlay;

export const checkToStartUpdate = (requestCode?: number) => {
    return GooglePlay.startInAppUpdate(requestCode || 14);
};