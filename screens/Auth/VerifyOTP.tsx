import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Animated,
    Easing,
    Keyboard, Dimensions, SafeAreaView, NativeModules
} from 'react-native';
import AppLoading from 'expo-app-loading';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { sendOtp, authenticate, setLoading, verifyOtp } from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef, useState} from "react";
// import types
import { storeState } from "../../stores/auth/authSlice"
import {getSecureKey} from "../../utils/secureStore";

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    otpChar1?: string | undefined;
    otpChar2?: string | undefined;
    otpChar3?: string | undefined;
    otpChar4?: string | undefined;
}

const { width, height } = Dimensions.get("window");

export const RotateView = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                rotateAnim,
                {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, [rotateAnim])

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    return (
        <Animated.Image
            style={{transform: [{rotate: spin}] }}
            source={require('../../assets/images/OTPloader.png')} />
    );
}

export default function VerifyOTP({ navigation }: NavigationProps) {

    const { isLoggedIn, user, loading, otpResponse, optVerified } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();
    const resendOtp = async (): Promise<any> => {
        if (user) {
            const phoneNumber = await getSecureKey('phone_number');
            const {type, error, payload}: any = await dispatch(sendOtp(phoneNumber));
            if (type === "sendOtp/rejected") {
                console.log(error.message);
            } else {
                console.log(payload.message);
            }
            return Promise.resolve(true)
        } else {
            return Promise.resolve(false)
        }
    }

    useEffect(() => {
        let setupUser = true;

        if (setupUser) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    console.log("500: Internal Server Error");
                } else {
                    const phoneNumber = await getSecureKey('phone_number');
                    const {type, error, payload}: any = await dispatch(sendOtp(phoneNumber));
                    if (type === "sendOtp/rejected") {
                        console.log(error.message);
                    } else {
                        console.log(payload.message);
                    }
                }
            })()
        }
        return (() => {
            Keyboard.removeAllListeners('keyboardDidShow');
            setupUser = false;
        })
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            navigation.navigate('GetTenants')
        }
    }, [isLoggedIn]);

    useEffect(() => {
        let determineRedirect = true;

        if (determineRedirect) {
            if (optVerified) {
                navigation.navigate('ProfileMain');
            }
        }

        return (() => {
            determineRedirect = false
        })
    }, [optVerified]);


    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { control, setValue, formState: { errors } } = useForm<FormData>()

    const [valueInput, setValueInput] = useState("")

    const onChange = (e: any) => {
        setValueInput(e)
    }

    useEffect(() => {
        setValueInput(valueInput.slice(0, 4))
        let result = valueInput.split('')
        if (result.length > 0) {
            let valName: any = `otpChar${result.length}`
            setValue(valName, result[result.length - 1])
            if (result.length === 4 && otpResponse) {
                Keyboard.dismiss();
                (async () => {
                    try {
                        const {type, error}: any = await dispatch(verifyOtp({ requestMapper: otpResponse.requestMapper, OTP: valueInput }))
                        if (type === 'verifyOtp/rejected' && error) {
                            if (error.message === "Network request failed") {
                                console.log(error.message);
                            } else {
                                console.log(error.message);
                            }
                            return false
                        }
                    } catch (e: any) {
                        console.log(e.message);
                    } finally {
                        setValue('otpChar1', undefined);
                        setValue('otpChar2', undefined);
                        setValue('otpChar3', undefined);
                        setValue('otpChar4', undefined);
                        setValueInput("");
                    }
                })()
            } else {
                if (!otpResponse && !loading) {
                    console.log("OTP not sent");
                }
            }
            let len = 4 - result.length
            for (let i = 0; i < len; i++) {
                let em: any = `otpChar${4-i}`
                setValue(em, '')
            }
        } else {
            setValue('otpChar1', '')
        }
    }, [valueInput])

    const scrollViewRef = useRef<any>();

    Keyboard.addListener('keyboardDidShow', () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    });

    if (isLoggedIn && fontsLoaded) {
        return(
            <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#489AAB' }}>
                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
                    <View>
                        <Text allowFontScaling={false} style={styles.titleText}>Verify account</Text>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <Image
                                style={styles.landingLogo}
                                source={require('../../assets/images/verifyillustration.png')}
                            />
                        </View>

                        <Text allowFontScaling={false} style={styles.titleText1}>Enter your verification code</Text>
                        <Text allowFontScaling={false} style={styles.subTitleText1}>Kindly enter the verification code that was sent to <Text allowFontScaling={false} style={{textDecorationLine: 'underline'}}>{user && user.username}</Text></Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, position: 'relative' }}>
                            <TextInput
                                allowFontScaling={false}
                                style={{ position: 'absolute', top: 30, left: 30, height: 70, width: '100%', zIndex: 5, opacity: 0, backgroundColor: 'rgba(255,255,255,0)'}}
                                onChangeText={onChange}
                                keyboardType="numeric"
                                selectTextOnFocus={false}
                                value={valueInput}
                                defaultValue={valueInput}
                                autoFocus={true}
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
                                        placeholder="*"
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
                                        placeholder="*"
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
                                        placeholder="*"
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
                                        placeholder="*"
                                        placeholderTextColor="#FFFFFF"
                                        keyboardType="numeric"
                                        editable={false}
                                        selectTextOnFocus={false}
                                    />
                                )}
                                name="otpChar4"
                            />
                        </View>

                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => resendOtp()} >
                                <Text allowFontScaling={false} style={styles.subTitleText1}>
                                    Did't receive code? <Text allowFontScaling={false} style={{ textDecorationLine: 'underline' }}>Resend code</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: height/8, marginTop: height/8 }}>
                        {loading && <RotateView/>}
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    } else {
        return (
            <AppLoading/>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: height
    },
    titleText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 100,
    },
    titleText1: {
        fontSize: 20,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 20,
    },
    subTitleText1: {
        fontSize: 14,
        paddingHorizontal: 60,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 30,
    },
    landingLogo: {
        marginTop: 50,
    },
    input: {
        textAlign: 'center',
        borderColor: '#ffffff',
        color: '#ffffff',
        borderWidth: 2,
        borderRadius: 20,
        height: 70,
        width: 70,
        marginTop: 30,
        paddingHorizontal: 20,
        fontSize: 30
    },
    loader: {

    }
})
