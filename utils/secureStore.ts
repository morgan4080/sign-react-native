import * as SecureStore from 'expo-secure-store';

export function saveSecureKey(key: string, value: any): Promise<any> {
    try {
        return Promise.resolve(SecureStore.setItemAsync(key, value));
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export function deleteSecureKey(key: string): Promise<any> {
    try {
        return Promise.resolve(SecureStore.deleteItemAsync(key));
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export function getSecureKey(key: string): Promise<any> {
    try {
        return Promise.resolve(SecureStore.getItemAsync(key));
    } catch (e: any) {
        return Promise.reject(e);
    }
}
