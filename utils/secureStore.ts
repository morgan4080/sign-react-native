import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export function saveSecureKey(key: string, value: any): Promise<any> {
    try {
        return Promise.resolve(storage.set(key, value));
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export function deleteSecureKey(key: string): Promise<any> {
    try {
        return Promise.resolve(storage.delete(key));
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export function getSecureKey(key: string): Promise<any> {
    try {
        return Promise.resolve(storage.getString(key));
    } catch (e: any) {
        return Promise.reject(e);
    }
}
