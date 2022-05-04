import * as React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, Image, ScrollView, TextInput} from 'react-native';
import AppLoading from 'expo-app-loading';

import Svg, { Path, Line, SvgProps } from "react-native-svg";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef} from "react";

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import {loginUser, checkForJWT, authenticate, logoutUser} from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
// import types
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {Ionicons} from "@expo/vector-icons";

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
    pin: string | undefined;
}

export default function Login({ navigation }: NavigationProps, svgProps: SvgProps) {
    const { isJWT, isLoggedIn, loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    // if user and otp phone no same take to profile

    useEffect(() => {
        dispatch(authenticate()).then(() => {
            if (isLoggedIn) {
                navigation.navigate('VerifyOTP')
            }
        })
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            navigation.navigate('VerifyOTP')
        }
    }, [isLoggedIn]);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

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

            dispatch(loginUser(payload)).then((response: any) => {
                if (response.error) {
                    console.log("login user response", response)
                    setError('phoneNumber', {type: 'custom', message: response.error.message})
                    return
                }
            }).catch((e: any) => {
                console.log("login error", e)
            })
        }
    };
    if (!isJWT && fontsLoaded && !loading) {
        return (
            <ScrollView contentContainerStyle={styles.container} >
                <View>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/Logo.png')}
                        />
                    </View>
                    <View style={styles.container2}>
                        <Text style={styles.titleText}>Enter registered phone number</Text>
                        <Text style={styles.subTitleText}>We will send you a One Time Pin. use it to verify your phone number</Text>
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
                            {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber?.message}</Text>}

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
                            {errors.pin && <Text style={styles.error}>Invalid entry</Text>}
                        </View>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30, marginTop: 40, position: 'relative' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Forgot')}><Text style={styles.linkText}>I have a lenders code</Text></TouchableOpacity>
                            <Svg
                                style={{ position: 'absolute', left: '60%' }}
                                width={1}
                                height={40}
                                viewBox="0 0 1 40"
                                {...svgProps}
                            >
                                <Line x1="0.5" y1="64" x2="0.5" stroke="#cccccc"/>
                            </Svg>
                            <TouchableOpacity onPress={() => navigation.navigate('Forgot')}><Text style={styles.linkText}>I have an invitation</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.container3}>
                    <Svg
                        style={{ position: 'absolute', top: 0 }}
                        width={429}
                        height={29}
                        viewBox="0 0 429 29"
                        {...svgProps}
                    >
                        <Path d="M428.5 -9.53674e-06C428.5 -9.53674e-06 311.695 31.5121 221 28.0002C127 24.3603 0.5 -9.53674e-06 0.5 -9.53674e-06L190 -9.53674e-06L428.5 -9.53674e-06Z" fill="#F8F8FA" />
                    </Svg>
                    <TouchableHighlight style={styles.button} onPress={handleSubmit(onSubmit)}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.buttonText}>Get Verified</Text>
                            <Ionicons
                                name="arrow-forward-outline"
                                size={25}
                                color='#fff'
                                style={{ marginLeft: 15 }}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#F8F8FA'
    },
    container2: {
        display: 'flex',
        justifyContent: 'space-between',
        height: 'auto'
    },
    container3: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 160,
        backgroundColor: '#489AAB',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    button: {
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginBottom: 35
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
        paddingTop: 30,
        marginBottom: 10,
    },
    subTitleText: {
        fontSize: 15,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
    linkText: {
        fontSize: 15,
        textDecorationLine: 'underline',
        color: '#3D889A',
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
        height: 70,
        marginTop: 30,
        paddingHorizontal: 20,
        fontSize: 15
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
});
