import * as SecureStore from 'expo-secure-store';

export async function saveSecureKey(key: string, value: any) {
    await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureKey(key: string) {
    await SecureStore.deleteItemAsync(key);
}

export async function getSecureKey(key: string) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result
    } else {
        return undefined
    }
}
