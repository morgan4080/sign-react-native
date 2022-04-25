import * as SecureStore from 'expo-secure-store';

export async function saveSecureKey(key: string, value: any) {
    await SecureStore.setItemAsync(key, value);
}

export async function getSecureKey(key: string) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        alert("🔐 Here's your value 🔐 \n" + result);
        return result
    } else {
        alert('No values stored under that key.');
        return false
    }
}
