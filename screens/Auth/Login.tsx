import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Dimensions, SafeAreaView, NativeModules, Alert
} from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useState} from "react";
import * as LocalAuthentication from 'expo-local-authentication';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import {loginUser, authenticate} from "../../stores/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../stores/store";
import { storeState, loginUserType } from "../../stores/auth/authSlice"
import {RotateView} from "./VerifyOTP";
import {FontAwesome5} from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
    pinChar1: string | undefined;
    pinChar2: string | undefined;
    pinChar3: string | undefined;
    pinChar4: string | undefined;
}

export default function Login({ navigation }: NavigationProps) {
    const { isJWT, tenants, selectedTenantId, isLoggedIn, loading } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const CUSTOM = NativeModules.CSTM;

    const tenant = tenants.find(t => t.id === selectedTenantId);

    if (tenants.length === 0) {
        navigation.navigate('GetTenants')
    }

    const dispatch : AppDispatch = useDispatch();

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

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

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(compatible);
        })()
    });

    const {
        control,
        setError,
        setValue,
        formState: {  }
    } = useForm<FormData>({
        defaultValues: {
            phoneNumber: tenant? tenant.phoneNumber : '',
            pinChar1: '',
            pinChar2: '',
            pinChar3: '',
            pinChar4: ''
        }
    });

    const fallBackToDefaultAuth = () => {
        console.log("fallback to phone and pin authentication")
    }

    const alertComponent = (title: string, mess: string | undefined, btnText: any, btnFunc: any) => {
        return Alert.alert(title, mess, [
            {
                text: btnText,
                onPress: btnFunc,
            }
        ])
    }

    const TwoButtonAlert = () => {
        return Alert.alert('Welcome', 'Get started by creating a new loan request', [
            {
                text: 'Back',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            {
                text: 'OK',
                onPress: () => console.log('Ok Pressed')
            }
        ])
    }

    const handleBiometricAuth = async () => {
        // check for support by hardware
        const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

        // fallback to pin in biometric not available
        if (!isBiometricAvailable) {
            return  alertComponent(
                'Please Enter your pin',
                'Biometric Auth not supported',
                'Ok',
                () => fallBackToDefaultAuth()
            );
        }

        // check biometric types available (fingerprint, facial recognition, iris recognition)

        let supportedBiometrics;

        if (isBiometricAvailable) {
            supportedBiometrics = await LocalAuthentication.supportedAuthenticationTypesAsync()
        }

        // check biometrics are saved locally in users device

        const savedBiometrics = await LocalAuthentication.isEnrolledAsync()

        if (!savedBiometrics) {
            return alertComponent(
                'Biometric record not found',
                'Please login with pin',
                'Ok',
                () => fallBackToDefaultAuth()
            )
        }

        // authenticate with biometrics
        const biometricAuth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Login with biometrics',
            cancelLabel: 'cancel',
            disableDeviceFallback: true
        })

        // log the user in on success

        if (biometricAuth && !biometricAuth.hasOwnProperty('error')) {
            TwoButtonAlert()
        }

        console.log({isBiometricAvailable})
        console.log({supportedBiometrics})
        console.log({savedBiometrics})
        console.log({biometricAuth})
    }
    let characters: number[] = []

    const onPressed = async (field: number) => {
        if (!loading) {
            if (field === -1) {
                console.log("activate finger print");
                if (isBiometricSupported) {
                    // proceed
                    // check db for biometrics activation and fill pin fields on success
                    await handleBiometricAuth()
                } else {
                    return alertComponent(
                        'Please Enter your pin',
                        'Biometric not supported',
                        'Ok',
                        () => fallBackToDefaultAuth()
                    );
                }
            } else if (field === -2) {
                // backspace
                characters = []
                setValue(`pinChar1`, ``)
                setValue(`pinChar2`, ``)
                setValue(`pinChar3`, ``)
                setValue(`pinChar4`, ``)
            } else if (field >= 0) {
                characters.push(field)
                characters.forEach((value, i) => {
                    if (i === 0) setValue(`pinChar1`, `⬤`)
                    if (i === 1) setValue(`pinChar2`, `⬤`)
                    if (i === 2) setValue(`pinChar3`, `⬤`)
                    if (i === 3) setValue(`pinChar4`, `⬤`)
                });
                if (characters.length === 4) {
                    // animate input fields
                    // handle submit
                    setTimeout(() => {
                        setValue(`pinChar1`, ``)
                        setValue(`pinChar2`, ``)
                        setValue(`pinChar3`, ``)
                        setValue(`pinChar4`, ``)
                    }, 2000)
                    const organisations = [
                        {
                            name: 'Imarisha Sacco',
                            tenantId: 't72767',
                            clientSecret: '238c4949-4c0a-4ef2-a3de-fa39bae8d9ce',
                        },
                        {
                            name: 'Wanaanga Sacco',
                            tenantId: 't74411',
                            clientSecret: '25dd3083-d494-4af5-89a1-104fa02ef782',
                        }
                    ];
                    const pin = `${characters[0]}${characters[1]}${characters[2]}${characters[3]}`;
                    const currentTenant = organisations.find(org => org.tenantId === tenant?.tenantId)
                    console.log("the pin", pin);
                    if (currentTenant && tenant) {
                        const payload: loginUserType = {
                            phoneNumber: parseInt(tenant.phoneNumber),
                            pin,
                            tenant: tenant.tenantId,
                            clientSecret: currentTenant.clientSecret,
                        };

                        try {
                            const {type, error}: any = await dispatch(loginUser(payload))
                            if (type === 'loginUser/rejected' && error) {
                                if (error.message === "Network request failed") {
                                    CUSTOM.showToast(error.message);
                                } else {
                                    setError('phoneNumber', {type: 'custom', message: error.message});
                                    CUSTOM.showToast(error.message);
                                }
                            } else {
                                navigation.navigate('VerifyOTP')
                            }
                        } catch (e: any) {
                            // console.log("login error", e)
                            console.log('errorssss', e);
                        }
                    }
                }
            }
        }
    }
    if (!isJWT && fontsLoaded) {
        return (
            <>
                <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#F8F8F8', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                    <ScrollView contentContainerStyle={styles.container} >
                        <View style={{height: height/2, display: 'flex', justifyContent: 'space-between', position: 'relative'}}>
                            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <TouchableOpacity onPress={() => navigation.navigate('GetTenants')} style={{marginTop: 45, marginBottom: 25, position: 'absolute', top: height/60, left: width/15}}>
                                    <FontAwesome5 name="sign-out-alt" size={24} color="black" style={{transform: [{ rotate: "180deg" }]}} />
                                </TouchableOpacity>
                                {loading &&
                                    <View style={{marginTop: 45, marginBottom: 25, position: 'absolute'}}>
                                        <RotateView/>
                                    </View>
                                }
                                <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: height/9 }}>
                                    <Text allowFontScaling={false} style={{fontSize: 12, fontFamily: 'Poppins_400Regular'}}>{tenant?.firstName + " " + tenant?.lastName}</Text>
                                    <Text allowFontScaling={false} style={{fontSize: 10, fontFamily: 'Poppins_300Light'}}>{tenant?.phoneNumber}</Text>
                                </View>
                            </View>

                            <View>
                                <Text allowFontScaling={false} style={{fontSize: 10, textAlign: 'center', fontFamily: 'Poppins_300Light', textTransform: 'uppercase'}}>{tenant?.tenantName}</Text>
                                <Text allowFontScaling={false} style={{fontSize: 10, textAlign: 'center', fontFamily: 'Poppins_300Light'}}>ENTER PIN</Text>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: width/4 }}>
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                            maxLength: 1,
                                        }}
                                        render={( { field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={{...styles.input, color: isLoggedIn ? '#4BB543' : '#489AAB',}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                keyboardType="numeric"
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        )}
                                        name="pinChar1"
                                    />
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                            maxLength: 1,
                                        }}
                                        render={( { field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={{...styles.input, color: isLoggedIn ? '#4BB543' : '#489AAB',}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                keyboardType="numeric"
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        )}
                                        name="pinChar2"
                                    />
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                            maxLength: 1,
                                        }}
                                        render={( { field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={{...styles.input, color: isLoggedIn ? '#4BB543' : '#489AAB',}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                keyboardType="numeric"
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        )}
                                        name="pinChar3"
                                    />
                                    <Controller
                                        control={control}
                                        rules={{
                                            required: true,
                                            maxLength: 1,
                                        }}
                                        render={( { field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                style={{...styles.input, color: isLoggedIn ? '#4BB543' : '#489AAB',}}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                keyboardType="numeric"
                                                editable={false}
                                                selectTextOnFocus={false}
                                            />
                                        )}
                                        name="pinChar4"
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{height: height/2.8, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
                            {[1,2,3,4,5,6,7,8,9,-2,0,-1].map(num => (
                                <TouchableOpacity onPress={() => onPressed(num)} key={num} style={{width: width/3, height: height/11, display: 'flex', justifyContent: 'center'}}>
                                    {
                                        num >= 0 ?
                                            <Text allowFontScaling={false} style={{fontSize: 18, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>{num}</Text>
                                            : num === -1 ?
                                            <Text allowFontScaling={false} style={{fontSize: 18, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>
                                                <FontAwesome5 name="fingerprint" size={24} color="black" />
                                            </Text>
                                            :
                                            <Text allowFontScaling={false} style={{fontSize: 11, textAlign: 'center', fontFamily: 'Poppins_400Regular'}}>
                                                CLEAR
                                            </Text>
                                    }
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </SafeAreaView>
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
        backgroundColor: '#F8F8FA',
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
    linkText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: '#489AAB',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        textAlign: 'center',
        borderColor: '#CCCCCC',
        borderWidth: 1,
        borderRadius: 100,
        height: height/20,
        width: height/20,
        fontWeight: '900',
        fontSize: 30,
        paddingBottom: 5
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
});
