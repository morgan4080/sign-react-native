import { Platform } from 'react-native';
import {NativeModules} from 'react-native';

type CountryModuleType = {
    getCountries(): Promise<string>
}

const AndroidCountriesModule: CountryModuleType = NativeModules.CountriesModule;
const IOSCountriesModule: CountryModuleType = NativeModules.CountryData;

export const getCountries = () => {
    if (Platform.OS === 'ios') {
        return IOSCountriesModule.getCountries();
    }

    if (Platform.OS === 'android') {
        return new Promise((resolve, reject) => {
            AndroidCountriesModule.getCountries().then((response: any) => {
                const countries = JSON.parse(response);
                resolve(countries);
            }).catch((e: any) => {
                reject(e);
            });
        });
    }

    return Promise.reject('Unknown Platform');
}