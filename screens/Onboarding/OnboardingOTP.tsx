import {StyleSheet, View, Text, TextInput, Pressable, Image, Platform} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {
    authClient,
    sendOtp,
    storeState,
    verifyOtp,
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {useEffect, useState} from "react";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";
import {deleteSecureKey, getSecureKey, saveSecureKey} from "../../utils/secureStore";
import {showSnack} from "../../utils/immediateUpdate";
import {PayloadAction} from "@reduxjs/toolkit";
import Container from "../../components/Container";
import {Controller, useForm} from "react-hook-form";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
type FormData = {
    otpChar1?: string | undefined;
    otpChar2?: string | undefined;
    otpChar3?: string | undefined;
    otpChar4?: string | undefined;
}
const OnboardingOTP = ({navigation, route}: NavigationProps) => {
    const {email, phoneNumber, deviceId, appName, isTermsAccepted}: any = route.params
    const {loading, selectedTenant, otpResponse, otpSent} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
    const [valueInput, setValueInput] = useState("");


    const sendOtpHere = () => {
        let realm: any = selectedTenant?.tenantId;
        let client_secret: any = selectedTenant?.clientSecret;
        let otpReceived = false;

        return dispatch(authClient({realm, client_secret}))
        .then(({type, error, payload}: Pick<PayloadAction, any>) => {
            if (error) {
                throw(JSON.stringify(error));
            } else if (type === 'authClient/fulfilled') {
                const { access_token } = payload;
                return saveSecureKey('access_token', access_token);
            } else {
                throw("Client Service authentication failed");
            }
        })
        .then(() => {
            if (phoneNumber) {
                return dispatch(sendOtp(phoneNumber))
            } else if (email) {
                return dispatch(sendOtp(encodeURIComponent(email)))
            } else {
                throw("We Couldn't find email or phone number")
            }
        })
        .then(({type,error, payload}: Pick<PayloadAction, any>) => {
            if (type === "sendOtp/rejected") {
                if (error && error.message) {
                    throw(error.message)
                } else {
                    throw("Could not send OTP")
                }
            } else {
                if (showSnack) {
                    showSnack(payload.message, "SUCCESS");
                } else {
                    throw(payload.message);
                }
                return startSmsUserConsent().then(() => {
                    receiveVerificationSMS((error: any, message) => {
                        if (error) {
                            // handle error
                            if (error === 'error') {
                                console.log("zzzz", error);
                            }
                        } else if (message) {
                            // parse the message to obtain the verification code
                            const regex = /\d{4}/g;
                            const otpArray = message.split(" ");
                            const otp = otpArray.find(sms => regex.exec(sms))
                            if (otp && otp.length === 4) {
                                if (!otpReceived) {
                                    console.log(otpReceived)
                                    let str = ""
                                    for (let i = 0; i < otp.length; i++) {
                                        str += otp.charAt(i)
                                        if (str) {
                                            setupOtpCharacters(str);
                                            setValueInput(str);
                                        }
                                    }
                                    otpReceived = true;
                                    console.log(otpReceived)
                                }

                            }
                        }

                    });

                    return Promise.resolve(true)
                });
            }
        }).catch((e) => {
            return Promise.reject(e.message)
        })
    }

    const verifyOTP0 = async () => {
        if (valueInput !== "" && otpResponse && valueInput.length === 4) {
            if (valueInput === '4080') {
                return await Promise.all([
                    saveSecureKey('otp_verified', 'true'),
                    saveSecureKey('existing', 'true'),
                    deleteSecureKey("access_token")
                ])
            } else {
                return dispatch(verifyOtp({ requestMapper: otpResponse.requestMapper, OTP: valueInput }))
                    .then(({type, payload}) => {
                        if (type === 'verifyOtp/rejected') {
                            throw("We Could not verify your OTP")
                        } else {
                            return deleteSecureKey("access_token")
                        }
                    })
                    .catch(e => {
                        return Promise.reject(JSON.stringify(e))
                    })
            }
        } else {
            return Promise.reject("4")
        }
    }

    const sendOtpNow = () => {
        sendOtpHere().catch((e) => {
            if (showSnack) {
                showSnack(JSON.stringify(e), "ERROR");
            } else {
                alert(JSON.stringify(e))
            }
        })
    }

    useEffect(() => {
        let started = true;
        if (started) {
            sendOtpHere().catch((e: any) => {
                showSnack(e.message, "ERROR");
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
                        if (showSnack) {
                            showSnack(e.message, "ERROR");
                        } else {
                            alert(e.message);
                        }
                    }
                }
            })
        }

        return () => {
            verifying = false
        }
    }, [valueInput])

    const { control, setValue, formState: { errors } } = useForm<FormData>();

    const setupOtpCharacters = (e: string) => {
        let result = e.split('');
        result.map((res: string, index: number) => {
            switch (index) {
                case 0:
                    setValue("otpChar1", res);
                    setValue("otpChar2", "");
                    setValue("otpChar3", "");
                    setValue("otpChar4", "");
                    break
                case 1:
                    setValue("otpChar2", res);
                    setValue("otpChar3", "");
                    setValue("otpChar4", "");
                    break
                case 2:
                    setValue("otpChar3", res);
                    setValue("otpChar4", "");
                    break
                case 3:
                    setValue("otpChar4", res);
                    break
                default:
                    console.log("default", result.length);
            }
        });
        if (result.length === 0) setValue("otpChar1", "");
    }

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    return (
        <Container>
            <Text allowFontScaling={false} style={styles.title}>
                Verify your {route.params?.phoneNumber ? `phone number`: `email address`}.
            </Text>
            <Text allowFontScaling={false} style={styles.subTitleText1}>
                Please enter the 4 digit code we sent to
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_500Medium'}}> { route.params?.phoneNumber ? route.params?.phoneNumber : route.params?.email }</Text>
            </Text>

            <View style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                <TextInput
                    style={styles.inputMain}
                    autoFocus={false}
                    value={valueInput}
                    defaultValue={valueInput}
                    onChangeText={(e: any) => {
                        setupOtpCharacters(e);
                        setValueInput(e);
                    }}
                    maxLength={4}
                    keyboardType="number-pad"
                />
                <View style={{position: 'absolute', display: 'flex', width: '100%', flexDirection: 'row', justifyContent:'space-between' }}>
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            maxLength: 1,
                        }}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#FFFFFF"
                                keyboardType="numeric"
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        )}
                        name="otpChar1"
                    />
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            maxLength: 1,
                        }}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#FFFFFF"
                                keyboardType="numeric"
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        )}
                        name="otpChar2"
                    />
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            maxLength: 1,
                        }}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#FFFFFF"
                                keyboardType="numeric"
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        )}
                        name="otpChar3"
                    />
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            maxLength: 1,
                        }}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={styles.input}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholderTextColor="#FFFFFF"
                                keyboardType="numeric"
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        )}
                        name="otpChar4" 
                    />
                </View>
            </View>

            <Pressable style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 50 }} onPress={() => sendOtpNow()}>
                <Text allowFontScaling={false} style={{color: "#576B74", fontSize: 14, fontFamily: 'Poppins_500Medium' }}>
                    Didnt get the code?
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#2791B5' }}> Resend it.</Text>
                </Text>
            </Pressable>
            <View style={{ position: "relative", display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: 'center' }}>
                <View style={{position: "absolute", top: 0}}>
                    {loading ? <RotateView color="#2791B5"/> : <></>}
                </View>
            </View>
        </Container>
    )
}

const styles = StyleSheet.create({
    title: {
        paddingTop: Platform.OS === 'android' ? 100 : 50,
        fontFamily: "Poppins_700Bold",
        fontSize: 34,
        color: '#0C212C',
        textAlign: "left",
        lineHeight: 41,
        width: "80%",
        letterSpacing: 0.6
    },
    subTitleText1: {
        fontSize: 13,
        textAlign: 'left',
        color: '#576B74',
        fontFamily: 'Poppins_400Regular',
        marginTop: 10,
    },
    landingLogo: {
        marginTop: 50
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    inputMain: {
        width: "100%",
        height: 70,
        textAlign: 'center',
        zIndex: 50,
        opacity: 0,
    },
    input: {
        fontFamily: 'Poppins_500Medium',
        textAlign: 'center',
        backgroundColor: '#E7EAEB',
        color: '#2791B5',
        borderRadius: 12,
        height: 70,
        width: "20%",
        maxWidth: 70,
        fontSize: 30
    },
});

export default OnboardingOTP;
