import {StyleSheet, View, Text, StatusBar, TextInput, Pressable, NativeModules, Dimensions} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Controller, useForm} from "react-hook-form";
import {RotateView} from "../Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {sendOtpBeforeToken, storeState, verifyOtpBeforeToken} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {useEffect} from "react";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";
type NavigationProps = NativeStackScreenProps<any>;
type FormData = {
    otp: string
}
type AppDispatch = typeof store.dispatch;
const { width } = Dimensions.get("window");
const { CSTM } = NativeModules;
const OnboardingOTP = ({navigation, route}: NavigationProps) => {
    console.log("route", route.params)
    const {email, phoneNumber, deviceId, appName}: any = route.params
    const {loading, selectedTenant} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
    const {
        control,
        clearErrors,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>(
        {
            defaultValues: {

            }
        }
    )
    const sendOtpHere = async () => {
        await startSmsUserConsent()
        dispatch(sendOtpBeforeToken({email, phoneNumber, deviceId, appName})).then(response => {
            CSTM.showToast("OTP sent please wait");
        }).catch(e => {
            console.log("Item: sendOtpBeforeToken", e.message)
        })
    }
    const verifyOTP0 = async (otp: string) => {
        alert(otp)
    }

    useEffect(() => {
        (async () => {
            await sendOtpHere()
            await startSmsUserConsent()
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
                        setValue('otp', otp);
                    }
                }
            });
        })()
    }, [])
    return (
        <View style={styles.container}>
            <Text allowFontScaling={false} style={styles.header}>OTP Verification</Text>
            <Text allowFontScaling={false} style={styles.tagLine}>A one time password has been sent to {route.params?.phoneNumber}</Text>
            <Text allowFontScaling={false} style={{...styles.tagLine, marginBottom: 35}}>Key in the 4 digit pin below</Text>
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <Controller
                    control={control}
                    render={( { field: { onChange, onBlur, value } }) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            autoFocus={false}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={async ({ nativeEvent: { eventCount, target, text} }) => {
                                if(text.length === 4) {
                                    await verifyOTP0(text)
                                }
                                clearErrors()
                            }}
                            keyboardType="numeric"
                        />
                    )}
                    name="otp"
                />
                {
                    errors.otp &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.otp?.message ? errors.otp?.message : 'OTP not verified'}</Text>
                }
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
