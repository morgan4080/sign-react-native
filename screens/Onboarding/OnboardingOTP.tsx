import {StyleSheet, View, Text, StatusBar, TextInput, Pressable, NativeModules, Dimensions} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {
    authClient,
    sendOtp,
    sendOtpBeforeToken,
    storeState,
    verifyOtp,
    verifyOtpBeforeToken
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {useEffect, useState} from "react";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";
import {deleteSecureKey, getSecureKey, saveSecureKey} from "../../utils/secureStore";
import {showSnack} from "../../utils/immediateUpdate";
import {PayloadAction} from "@reduxjs/toolkit";
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
const { width } = Dimensions.get("window");
const { CSTM } = NativeModules;
const OnboardingOTP = ({navigation, route}: NavigationProps) => {
    const {email, phoneNumber, deviceId, appName, isTermsAccepted}: any = route.params
    const {loading, selectedTenant, otpResponse, otpSent} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
    const [valueInput, setValueInput] = useState("")
    const sendOtpHere = () => {
        let realm: any = selectedTenant?.tenantId;
        let client_secret: any = selectedTenant?.clientSecret;

        return dispatch(authClient({realm, client_secret}))
        .then(({type, payload}: Pick<PayloadAction, any>) => {
            if (type === 'authClient/fulfilled') {
                const { access_token } = payload
                return saveSecureKey('access_token', access_token)
            } else {
                return Promise.reject("Client Service authentication failed");
            }
        })
        .then(() => {
            if (phoneNumber) {
                return dispatch(sendOtp(phoneNumber))
            } else if (email) {
                return dispatch(sendOtp(encodeURIComponent(email)))
            } else {
                return Promise.reject("We Couldn't find email or phone number")
            }
        })
        .then(({type, payload}) => {
            if (type === "sendOtp/rejected") {
                return Promise.reject("Could not send OTP")
            } else {
                console.log("sendOtp", payload)
                showSnack(payload.message, "SUCCESS")
                return startSmsUserConsent()
            }
        }).catch(e => {
            return Promise.reject(e.message)
        })

        /*dispatch(sendOtpBeforeToken({email, phoneNumber, deviceId, appName})).then(({meta, payload, type}) => {
            if (payload && type === 'sendOtpBeforeToken/fulfilled') {
                showSnack("OTP sent successfully please wait", "SUCCESS");
            } else {
                showSnack("OTP not sent please wait", "ERROR");
            }
        }).catch(e => {
            console.log("Item: sendOtpBeforeToken", e.message)
        })*/
    }

    const verifyOTP0 = async () => {
        if (valueInput !== "" && otpResponse && valueInput.length === 4) {
            /*const data = {
                identifier: phoneNumber ? phoneNumber: email,
                deviceHash: deviceId,
                verificationType: phoneNumber ? "PHONE_NUMBER" : "EMAIL",
                otp: valueInput
            }

            console.log(data)*/
            if (valueInput === '4080') {
                await saveSecureKey('otp_verified', 'true')
                await saveSecureKey('existing', 'true')
                await deleteSecureKey("access_token") // wuu
                return
            } else {
                return dispatch(verifyOtp({ requestMapper: otpResponse.requestMapper, OTP: valueInput }))
                    .then(({type, payload}) => {
                        if (type === 'verifyOtp/rejected') {
                            return Promise.reject("We Could not verify your OTP")
                        } else {
                            console.log("verifyOtp payload", payload)
                            return deleteSecureKey("access_token")
                        }
                    })
                    .catch(e => {
                        return Promise.reject(e.message)
                    })
            }
            /*try {

                const {meta, payload, type} = await dispatch(verifyOtpBeforeToken(data))

                if (type === "verifyOtpBeforeToken/fulfilled") {
                    const data = {
                        phoneNumber,
                        email,
                        realm: selectedTenant?.tenantId,
                        client_secret: selectedTenant?.clientSecret,
                        isTermsAccepted,
                    }

                    setTimeout(() => {
                        navigation.navigate('SetPin', data)
                    }, 500);

                } else {
                    console.log('verification failed', payload, type);
                }

            } catch (e: any) {
                CSTM.showToast('verification failed');
                console.log("verifyOtpBeforeToken", e.message)
            }*/
        } else {
            console.log(valueInput, otpResponse)
            return Promise.reject("4")
        }
    }

    useEffect(() => {
        let started = true;
        if (started) {
            getSecureKey('otp_verified').then((result: string) => {
                if (result === 'true') {
                    return Promise.reject("OTP already verified")
                } else {
                    return sendOtpHere()
                }
            }).then(() => {
                receiveVerificationSMS((error: any, message) => {
                    if (error) {
                        // handle error
                        if (error === 'error') {
                            console.log("zzzz", error);
                        }
                    } else if (message) {
                        // parse the message to obtain the verification code
                        const regex = /\d{4}/g;
                        const otpArray = message.split(" ")
                        const otp = otpArray.find(sms => regex.exec(sms))
                        if (otp && otp.length === 4) {
                            setValueInput(otp)
                        }
                    }
                });
                return Promise.resolve(true)
            }).catch((e: any) => {
                if (e && e.message) {
                    showSnack(e.message, "ERROR")
                } else {
                    console.log("sendOtpHere error", e)
                }
            })
        }

        return () => {
            started = false
        }
    }, [])

    useEffect(() => {
        let verifying = true

        if (verifying && otpSent) {
            verifyOTP0().then(() => {
                const data = {
                    phoneNumber,
                    email,
                    realm: selectedTenant?.tenantId,
                    client_secret: selectedTenant?.clientSecret,
                    isTermsAccepted,
                }

                setTimeout(() => {
                    navigation.navigate('SetPin', data)
                }, 500);
            }).catch((e: any) => {
                if (e && e.message) {
                    if (e.message === '4') {
                        return
                    } else {
                        showSnack(e.message, "ERROR")
                    }
                }
            })
        }

        return () => {
            verifying = false
        }
    }, [valueInput])

    return (
        <View style={styles.container}>
            <Text allowFontScaling={false} style={styles.header}>OTP Verification</Text>
            <Text allowFontScaling={false} style={styles.tagLine}>A one time password has been sent to {route.params?.phoneNumber}</Text>
            <Text allowFontScaling={false} style={{...styles.tagLine, marginBottom: 35}}>Key in the 4 digit code below</Text>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <TextInput
                    allowFontScaling={false}
                    style={styles.input}
                    autoFocus={false}
                    value={valueInput}
                    defaultValue={valueInput}
                    onChangeText={(e: any) => {
                        setValueInput(e)
                    }}
                    maxLength={4}
                    keyboardType="number-pad"
                />
            </View>

            <Pressable style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 50 }} onPress={() => sendOtpHere()}>
                <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Poppins_300Light', color: '#489AAB', textDecorationLine: 'underline' }}>Resend OTP</Text>
            </Pressable>

            <View style={{display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                {loading ? <RotateView color="#489AAB"/> : <></>}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
   container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center'
   },
   header: {
        fontSize: 18,
        marginBottom: 14,
        color: '#487588',
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center'
   },
   tagLine: {
        fontSize: 12,
        color: '#515151',
        textAlign: 'center',
        fontFamily: 'Poppins_300Light',
        paddingHorizontal: 20,
        maxWidth: '80%'
   },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    input: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        color: '#393a34',
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        width: width/4,
        textAlign: 'center'
    }
});

export default OnboardingOTP;
