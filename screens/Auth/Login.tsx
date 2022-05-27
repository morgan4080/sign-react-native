import * as React from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Dimensions, SafeAreaView
} from 'react-native';
import AppLoading from 'expo-app-loading';

import Svg, { Path, Line, SvgProps } from "react-native-svg";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef} from "react";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import {loginUser, checkForJWT, authenticate, logoutUser, setLoading} from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
// import types
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "./VerifyOTP";
const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
    pin: string | undefined;
}

export default function Login({ navigation }: NavigationProps, svgProps: SvgProps) {
    const { isJWT, isLoggedIn, loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    // if user and otp phone no same take to profile

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    return
                }
                if (response.type === 'authenticate/fulfilled') {
                    navigation.navigate('VerifyOTP')
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, []);

    useEffect(() => {
        let isLoggedInSubscribed = true;
        if (isLoggedIn) {
            if (isLoggedInSubscribed) navigation.navigate('VerifyOTP')
        }
        return () => {
            // cancel the subscription
            isLoggedInSubscribed = false;
        };
    }, [isLoggedIn]);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            phoneNumber: '254720753971',
            pin: '1234'
        }
    })

    const onSubmit = async (value: any): Promise<void> => {
        if (value) {
            // make redux action to login
            // once logged in move to next page
            const payload: loginUserType = {
                phoneNumber: value.phoneNumber,
                pin: value.pin,
            }

            try {
                const { type, error }: any = await dispatch(loginUser(payload))
                if (type === 'loginUser/rejected' && error) {
                    setError('phoneNumber', {type: 'custom', message: error.message})
                }
                if (type === 'loginUser/fulfilled') {
                    // console.log('login successful')
                }
            } catch (e: any) {
                // console.log("login error", e)
            }
        }
    };

    if (!isJWT && fontsLoaded) {
        return (
            <>
                <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#e8e8e8', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                    <ScrollView contentContainerStyle={styles.container} >
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <Image
                                style={styles.landingLogo}
                                source={require('../../assets/images/Logo.png')}
                            />
                        </View>
                        <View style={styles.container2}>
                            <Text allowFontScaling={false} style={styles.titleText}>Enter registered phone number</Text>
                            <Text allowFontScaling={false} style={styles.subTitleText}>We will send you a One Time Pin. use it to verify your phone number</Text>
                            <View style={{ paddingHorizontal: 30 }}>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 12,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Phone no. i.e 254722000000"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="phoneNumber"
                                />
                                {errors.phoneNumber && <Text  allowFontScaling={false}  style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Field is required'}</Text>}

                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                        maxLength: 4,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            secureTextEntry={true}
                                            placeholder="Registered pin. max 4 characters"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="pin"
                                />
                                {errors.pin && <Text  allowFontScaling={false}  style={styles.error}>Field is required</Text>}
                            </View>
                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 35, marginTop: 20 }}>
                                <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
                                    <Text allowFontScaling={false} style={styles.linkText}>
                                        Forgot Pin
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
                <View style={{ backgroundColor: '#323492', width, display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative' }}>
                    <Svg
                        style={{ position: 'absolute', top: 0 }}
                        width={429}
                        height={29}
                        viewBox="0 0 429 29"
                        {...svgProps}
                    >
                        <Path d="M428.5 -9.53674e-06C428.5 -9.53674e-06 311.695 31.5121 221 28.0002C127 24.3603 0.5 -9.53674e-06 0.5 -9.53674e-06L190 -9.53674e-06L428.5 -9.53674e-06Z" fill="#F8F8FA" />
                    </Svg>
                    {!loading && <TouchableOpacity onPress={handleSubmit(onSubmit)} style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderColor: '#FFFFFF',
                        borderWidth: 1,
                        width: width / 2,
                        paddingHorizontal: 20,
                        paddingVertical: 15,
                        borderRadius: 25,
                        marginTop: 45,
                        marginBottom: 25
                    }}>
                        <Text allowFontScaling={false} style={styles.buttonText}>Get OTP</Text>
                    </TouchableOpacity>}
                    {loading &&
                        <View style={{marginTop: 45, marginBottom: 25}}>
                            <RotateView/>
                        </View>
                    }
                </View>
            </>
        )
    }  else {
        return (
            <AppLoading/>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: height,
        backgroundColor: '#F8F8FA'
    },
    container2: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium'
    },
    button: {
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#323492',
        fontFamily: 'Poppins_600SemiBold',
        paddingTop: 30,
        marginBottom: 10,
    },
    subTitleText: {
        fontSize: 14,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
    linkText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: '#323492',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    landingLogo: {
        marginTop: 80,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 60,
        marginTop: 30,
        paddingHorizontal: 20,
        fontSize: 14
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
});
