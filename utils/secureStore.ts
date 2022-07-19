import * as SecureStore from 'expo-secure-store';

export async function saveSecureKey(key: string, value: any) {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export async function deleteSecureKey(key: string) {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (e: any) {
        return Promise.reject(e);
    }
}

export async function getSecureKey(key: string) {
    try {
        let result = await SecureStore.getItemAsync(key);
        if (result) {
            return result
        } else {
            return undefined
        }
    } catch (e: any) {
        return Promise.reject(e);
    }
}
