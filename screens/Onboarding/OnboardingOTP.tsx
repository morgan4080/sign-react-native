import {StyleSheet, View, Text, StatusBar, TextInput, Pressable, NativeModules, Dimensions} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Controller, useForm} from "react-hook-form";
import {RotateView} from "../Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {sendOtpBeforeToken, storeState, verifyOtpBeforeToken, logoutUser} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {useEffect, useState} from "react";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";
import {deleteSecureKey} from "../../utils/secureStore";
type NavigationProps = NativeStackScreenProps<any>;
type FormData = {
    otp: string
}
type AppDispatch = typeof store.dispatch;
const { width } = Dimensions.get("window");
const { CSTM } = NativeModules;
const OnboardingOTP = ({navigation, route}: NavigationProps) => {
    const {email, phoneNumber, deviceId, appName}: any = route.params
    const {loading, selectedTenant} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
    const [valueInput, setValueInput] = useState("")
    const sendOtpHere = async () => {
        await startSmsUserConsent()
        dispatch(sendOtpBeforeToken({email, phoneNumber, deviceId, appName})).then(response => {
            CSTM.showToast("OTP sent please wait");
        }).catch(e => {
            console.log("Item: sendOtpBeforeToken", e.message)
        })
    }

    const verifyOTP0 = async () => {
        if (valueInput !== "") {
            const data = {
                identifier: phoneNumber ? phoneNumber: email,
                deviceHash: deviceId,
                verificationType: phoneNumber ? "PHONE_NUMBER" : "EMAIL",
                otp: valueInput
            }

            console.log(data)

            try {

                const {meta, payload, type} = await dispatch(verifyOtpBeforeToken(data))

                if (type === "verifyOtpBeforeToken/fulfilled" && payload) {
                    const data = {
                        phoneNumber,
                        email,
                        realm: selectedTenant?.tenantId,
                        client_secret: selectedTenant?.clientSecret
                    }

                    setTimeout(() => {
                        navigation.navigate('SetPin', data)
                    }, 500);

                } else {
                    CSTM.showToast('verification failed');
                    console.log('verification failed', payload, type);
                }

            } catch (e: any) {
                CSTM.showToast('verification failed');
                console.log("verifyOtpBeforeToken", e.message)
            }
        }
    }

    useEffect(() => {
        let started = true;
        if (started) {
            (async () => {
                await Promise.all([
                    sendOtpHere(),
                    startSmsUserConsent(),
                    deleteSecureKey("access_token")
                ])

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
            })()
        }

        return () => {
            started = false
        }
    }, [])

    useEffect(() => {
        (async () => {
            await verifyOTP0()
        })()
    }, [valueInput])

    return (
        <View style={styles.container}>
            <Text allowFontScaling={false} style={styles.header}>OTP Verification</Text>
            <Text allowFontScaling={false} style={styles.tagLine}>A one time password has been sent to {route.params?.phoneNumber}</Text>
            <Text allowFontScaling={false} style={{...styles.tagLine, marginBottom: 35}}>Key in the 4 digit pin below</Text>
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
