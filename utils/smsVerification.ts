import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { Platform } from 'react-native';
import {NativeModules, EmitterSubscription} from 'react-native';

type AndroidSmsVerificationApiType = {
    multiply(a: number, b: number): Promise<number>;
    requestPhoneNumber(requestCode?: number): Promise<string>;
    requestPhoneNumberFormat(alpha2Code?: string, phone_number?: string): Promise<string>;
    getContact(requestCode?: number, alpha2Code?: string): Promise<string>;
    pickContact({}): Promise<string>;
    startSmsRetriever(): Promise<boolean>;

    // remove after implementation

    getAppSignatures(): Promise<string[]>;


    startSmsUserConsent(
        senderPhoneNumber: string | null,
        userConsentRequestCode: number
    ): Promise<boolean>;
};

type Callback = (error: Error | null, message: string | null) => any;

let cb: Callback | null = null;

const AndroidSmsVerificationApi: AndroidSmsVerificationApiType = NativeModules.AndroidSmsVerificationApi;
const IOSSmsVerificationApi: AndroidSmsVerificationApiType = NativeModules.ContactsPicker;

const onMessageSuccess = (message: string) => {
    if (typeof cb === 'function') {
        cb(null, message);
    }
};

const onMessageError = (error: string) => {
    if (typeof cb === 'function') {
        cb(Error(error), null);
    }
};

export const requestPhoneNumber = (requestCode?: number) => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.requestPhoneNumber(requestCode || 420);
    } else {
        return null
    }
};
export const requestPhoneNumberFormat = (alpha2Code: string = 'KE', phone_number: string) => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.requestPhoneNumberFormat(alpha2Code, phone_number);
    } else {
        const {countryCallingCode, nationalNumber} = parsePhoneNumber(`${phone_number}`, alpha2Code as CountryCode)
        return JSON.stringify({
            country_code: countryCallingCode,
            phone_no: nationalNumber
        })
    }
};

export const getContact = (requestCode?: number, alpha2Code?: string) => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return new Promise((resolve, reject) => {
            AndroidSmsVerificationApi.getContact(requestCode || 421, alpha2Code || 'KE').then((response: any) => {
                resolve(response)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    if (Platform.OS === 'ios') {
        return new Promise((resolve, reject) => {
            IOSSmsVerificationApi.pickContact({}).then((result: any) => {
                const {countryCallingCode, nationalNumber} = parsePhoneNumber(
                    `${result.phoneNumbers[0].digits}`,
                    (alpha2Code ? alpha2Code : result.phoneNumbers[0].countryCode.toUpperCase()) as CountryCode
                )

                resolve({
                    name: result.fullName,
                    country_code: countryCallingCode,
                    phone_no: nationalNumber
                })
            }).catch((error: any) => {
                reject(error)
            })
        })
    }

    return Promise.reject('Unknown Platform')
};

export const receiveVerificationSMS = (callback: Callback) => {
    cb = callback;
};

export const getAppSignatures = () => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.getAppSignatures();
    } else {
        return Promise.resolve(null);
    }
};

export const startSmsRetriever = () => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.startSmsRetriever();
    } else {
        return null
    }
};

export const startSmsUserConsent = (
    senderPhoneNumber?: string,
    userConsentRequestCode?: number
) => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.startSmsRetriever();
    } else {
        return Promise.resolve(null)
    }
};
