import * as React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, Image, ScrollView, TextInput, Animated, Easing } from 'react-native';
import AppLoading from 'expo-app-loading';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { loginUser, checkForJWT, authenticate } from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef, useState} from "react";
// import types
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {Ionicons} from "@expo/vector-icons";
import {UseFormWatch} from "react-hook-form/dist/types/form";


type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    otpChar1: string | undefined;
    otpChar2: string | undefined;
    otpChar3: string | undefined;
    otpChar4: string | undefined;
}

const RotateView = () => {
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

    const [loading, setLoading] = useState(false);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(checkForJWT())
    }, []);

    const { isJWT, isLoggedIn } = useSelector((state: { auth: storeState })=>state.auth);

    if (isJWT && !isLoggedIn) {
        dispatch(authenticate())
    } else if (isLoggedIn) {
        navigation.navigate('UserProfile')
    }

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>()

    const onSubmit = async (value: any): Promise<void> => {
        console.log(value)
        setLoading(true)
    }

    const getMissingData = (arr: any[]) => {
        return arr.reduce((acc, obj) => {
            let emptyKeys = []
            for (const [key, value] of Object.entries(obj)) {
                if (value === null || value === '') {
                    emptyKeys.push(key)
                    obj = {
                        ...obj,
                        emptyKeys: emptyKeys
                    }
                    acc.push(obj)
                }
            }
            return acc
        },[]);
    };

    useEffect(() => {
        const subscription = watch((value) => {
            value = [value].reduce((acc, { otpChar1, otpChar2, otpChar3, otpChar4 }) => {
                let v = {
                    otpChar1: otpChar1 ?  otpChar1.slice(0, 1) : otpChar1,
                    otpChar2: otpChar2 ?  otpChar2.slice(0, 1) : otpChar2,
                    otpChar3: otpChar3 ?  otpChar3.slice(0, 1) : otpChar3,
                    otpChar4: otpChar4 ?  otpChar4.slice(0, 1) : otpChar4,
                }
                return v
            },{});
            console.log(value)
            /*setValue('otpChar1', value.otpChar1, {
                shouldValidate: true,
                shouldDirty: true
            })*/
        });
        /*
                setValue('otpChar2', v.otpChar2)
                setValue('otpChar3', v.otpChar3)
                setValue('otpChar4', v.otpChar4)*/
        return () => subscription.unsubscribe();
    }, [watch]);


    if (!isJWT && fontsLoaded) {
        return(
            <ScrollView contentContainerStyle={styles.container}>
                <View>
                    <Text style={styles.titleText}>Verify account</Text>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/verifyillustration.png')}
                        />
                    </View>

                    <Text style={styles.titleText1}>Enter your verification code</Text>
                    <Text style={styles.subTitleText1}>Kindly enter the verification code that was sent to <Text style={{textDecorationLine: 'underline'}}>+254720753971</Text></Text>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 30 }}>
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                maxLength: 1,
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
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
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
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
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
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
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="*"
                                    placeholderTextColor="#FFFFFF"
                                    keyboardType="numeric"
                                />
                            )}
                            name="otpChar4"
                        />
                    </View>

                    <Text style={styles.subTitleText1}>Did't receive code? <Text style={{textDecorationLine: 'underline', fontFamily: 'Poppins_600SemiBold' }}>Resend code</Text></Text>

                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: 100 }}>
                    {loading && <RotateView/>}
                </View>
            </ScrollView>
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
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#489AAB'
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 100,
    },
    titleText1: {
        fontSize: 25,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_600SemiBold',
        marginTop: 20,
    },
    subTitleText1: {
        fontSize: 16,
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
