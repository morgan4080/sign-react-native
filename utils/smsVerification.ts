import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { Platform } from 'react-native';
import {NativeModules, NativeEventEmitter, EmitterSubscription} from 'react-native';

type AndroidSmsVerificationApiType = {
    multiply(a: number, b: number): Promise<number>;
    requestPhoneNumber(requestCode?: number): Promise<string>;
    requestPhoneNumberFormat(alpha2Code?: string, phone_number?: string): Promise<string>;
    getContact(requestCode?: number, alpha2Code?: string): Promise<string>;
    startSmsRetriever(): Promise<boolean>;

    // remove after implementation

    getAppSignatures(): Promise<string[]>;


    startSmsUserConsent(
        senderPhoneNumber: string | null,
        userConsentRequestCode: number
    ): Promise<boolean>;
};

type Callback = (error: Error | null, message: string | null) => any;

const EmitterMessages = {
    SMS_RECEIVED: 'SMS_RECEIVED',
    SMS_ERROR: 'SMS_ERROR',
};

let cb: Callback | null = null;

const AndroidSmsVerificationApi: AndroidSmsVerificationApiType = NativeModules.AndroidSmsVerificationApi;
// NativeModules.AndroidSmsVerificationApi
// const eventEmitter = new NativeEventEmitter(NativeModules.AndroidSmsVerificationApi);

const subscriptions:  EmitterSubscription[] = [];

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

const startListeners = () => {
    // check if event exists, add listener if it doesn't
    // eventEmitter.addListener(EmitterMessages.SMS_RECEIVED, onMessageSuccess);
    // eventEmitter.addListener(EmitterMessages.SMS_ERROR, onMessageError);
};

export const removeAllListeners = () => {
    // eventEmitter.removeAllListeners(EmitterMessages.SMS_RECEIVED);
    // eventEmitter.removeAllListeners(EmitterMessages.SMS_ERROR);
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
        return AndroidSmsVerificationApi.getContact(requestCode || 421, alpha2Code || 'KE');
    } else {
        return null
    }
};

export const receiveVerificationSMS = (callback: Callback) => {
    cb = callback;
    startListeners();
};

// remove after getting app signature

export const getAppSignatures = () => {
    if (Platform.OS === 'android' && AndroidSmsVerificationApi) { 
        return AndroidSmsVerificationApi.getAppSignatures();
    } else {
        return null
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
        return null
    }
    /*return AndroidSmsVerificationApi.startSmsUserConsent(
        senderPhoneNumber || null,
        userConsentRequestCode || 69
    );*/
};
