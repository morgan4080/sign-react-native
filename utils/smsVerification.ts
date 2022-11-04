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
const eventEmitter = new NativeEventEmitter(NativeModules.AndroidSmsVerificationApi);

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

    const x = eventEmitter.addListener(EmitterMessages.SMS_RECEIVED, onMessageSuccess);
    subscriptions.push(x);
    const y = eventEmitter.addListener(EmitterMessages.SMS_ERROR, onMessageError);
    subscriptions.push(y);
};

export const removeAllListeners = () => {
    if(eventEmitter) {
        for (let i = 0; i < subscriptions.length; i++) {
            subscriptions[i].remove();
        }
    }
};

export const requestPhoneNumber = (requestCode?: number) => {
    return AndroidSmsVerificationApi.requestPhoneNumber(requestCode || 420);
};
export const requestPhoneNumberFormat = (alpha2Code: string, phone_number: string) => {
    return AndroidSmsVerificationApi.requestPhoneNumberFormat(alpha2Code, phone_number);
};

export const getContact = (requestCode?: number, alpha2Code?: string) => {
    return AndroidSmsVerificationApi.getContact(requestCode || 421, alpha2Code || 'KE');
};

export const receiveVerificationSMS = (callback: Callback) => {
    cb = callback;
    startListeners();
};

// remove after getting app signature

export const getAppSignatures = () => {
    return AndroidSmsVerificationApi.getAppSignatures();
};

export const startSmsRetriever = () => {
    return AndroidSmsVerificationApi.startSmsRetriever();
};

export const startSmsUserConsent = (
    senderPhoneNumber?: string,
    userConsentRequestCode?: number
) => {
    return AndroidSmsVerificationApi.startSmsUserConsent(
        senderPhoneNumber || null,
        userConsentRequestCode || 69
    );
};
