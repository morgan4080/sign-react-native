import {
    Dimensions,
    Image, Keyboard,
    NativeModules,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from "react-native";
import {RotateView} from "../Auth/VerifyOTP";
const { width, height } = Dimensions.get("window");
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";

import {Controller, useForm} from "react-hook-form";
import {authenticate, getTenants, storeState} from "../../stores/auth/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {store} from "../../stores/store";
import {useEffect, useRef, useState} from "react";
import {getSecureKey, saveSecureKey} from "../../utils/secureStore";
import {Ionicons} from "@expo/vector-icons";
const { CSTM, CountriesModule } = NativeModules;

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
    countryCode: string;
}

const GetTenants = ({ navigation }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { isJWT, isLoggedIn, loading, tenants } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const [phn, setPhn] = useState('')

    const [code, setCode] = useState('+')

    const [country, setCountry] = useState<{name: string, code: string, numericCode: string, flag: string}>()

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            phoneNumber: phn,
            countryCode: code
        }
    });

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                try {
                    const response = await dispatch(authenticate());
                    if (response.type === 'authenticate/rejected') {
                        return
                    }
                    if (response.type === 'authenticate/fulfilled') {
                        navigation.navigate('ProfileMain')
                    }
                } catch (e: any) {
                    console.log(e.message)
                }
            })()
        }
        return () => {
            // when destroying component delete form fields/ selections
            Keyboard.removeAllListeners('keyboardDidShow');
            authenticating = false;
        }
    }, []);

    useEffect(() => {
        let tenantsFetched = true;

        if (tenants.length > 0 && tenantsFetched) {
            navigation.navigate('ShowTenants');
        }  else {
            setError('phoneNumber', {type: 'custom', message: "Kindly check the number and try again"});
        }

        return () => {
            tenantsFetched = false;
        };
    }, [tenants])

    useEffect(() => {
        let isLoggedInSubscribed = true;

        (async () => {
            if (isLoggedIn) {
                navigation.navigate('ProfileMain')
            } else {
                try {
                    const ph = await getSecureKey('phone_number_without');
                    const code = await getSecureKey('phone_number_code');
                    if (ph && ph !== '') {
                        setValue('phoneNumber', ph)
                        setPhn(ph)
                    }
                    if (code && code !== '') {
                        setValue('countryCode', code);
                        let countriesJson = await CountriesModule.getCountries();
                        if (countriesJson) {
                            let countries: {name: string, code: string, numericCode: string, alpha2Code: string}[] = JSON.parse(countriesJson);
                            const country = countries.find((country: {name: string, code: string, numericCode: string, alpha2Code: string}) => country.code === code.replace("+", ""));
                            console.log(country);
                            if (country && country.alpha2Code) {
                                setCountry({
                                    ...country,
                                    flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                                });
                            }
                        }
                        setCode(code)
                    }
                } catch (e: any) {
                    console.log(e.message)
                }
            }
        })()
        return () => {
            // cancel the subscription
            isLoggedInSubscribed = false;
        };
    }, [isLoggedIn]);

    const onSubmit = async (value: any): Promise<void> => {
        if (value) {
            try {
                if (value.phoneNumber.length < 8) {
                    setError('phoneNumber', {type: 'custom', message: 'Please provide a valid phone number'});
                    return
                }
                let phone: string = ''
                let identifier: string = `${value.countryCode}${value.phoneNumber}`
                if (identifier[0] === '+') {
                    let number = identifier.substring(1);
                    phone = `${number.replace(/ /g, "")}`;
                } else if (identifier[0] === '0') {
                    let number = identifier.substring(1);
                    phone = `254${number.replace(/ /g, "")}`;
                }

                const { type, error }: any = await dispatch(getTenants(phone !== '' ? phone : value.phoneNumber));
                if (type === 'getTenants/rejected' && error) {
                    if (error.message === "Network request failed") {
                        CSTM.showToast(error.message);
                    } else {
                        setError('phoneNumber', {type: 'custom', message: error.message});
                    }
                } else {
                    await saveSecureKey('phone_number_code', value.countryCode);
                    await saveSecureKey('phone_number_without', value.phoneNumber);
                }
            } catch (e: any) {
                console.log('Error Get Tenants', e);
            }
        }
    }

    const scrollViewRef = useRef<any>();

    Keyboard.addListener('keyboardDidShow', () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    });

    const focusCountryCode = useRef<any>();

    const focusPhoneNumber = useRef<any>();

    if (!isJWT && fontsLoaded) {
        return (
            <SafeAreaView style={{
                flex: 1,
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25
            }}>
                <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/DarkLogo.png')}
                        />
                    </View>
                    <View style={styles.container2}>
                        <Text allowFontScaling={false} style={styles.titleText}>Enter registered phone number</Text>
                        <Text allowFontScaling={false} style={styles.subTitleText}>Verify Membership</Text>
                        <View style={{ paddingHorizontal: 30, position: 'relative' }}>
                            <View style={{ ...styles.input, position: 'absolute', top: 7, left: width/14, width: width/5.5, borderRadius: 0, height: 35, paddingHorizontal: 15, borderWidth: 0, paddingRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Image source={{ uri: country?.flag}} style={{ width: 20, height: 15 }}/>
                            </View>

                            <TextInput
                                style={{...styles.input}}
                                placeholder="Country"
                                value={country?.name}
                                onFocus={() => {
                                    Keyboard.dismiss();
                                    navigation.navigate('Countries');
                                }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 30, position: 'relative' }}>
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                    maxLength: 12,
                                }}
                                render={( { field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        ref={focusCountryCode}
                                        allowFontScaling={false}
                                        style={{...styles.input, position: 'absolute', top: 7, left: width/12, width: width/5.5, borderRadius: 0, height: 35, borderWidth: 0, zIndex: 11, paddingHorizontal: 15, paddingRight: 0}}
                                        editable={false}
                                        value={value}
                                        onBlur={onBlur}
                                        onChangeText={(e) => {
                                            if (e.length > 4) {
                                                focusPhoneNumber.current.focus();
                                                setValue('phoneNumber', e[e.length-1])
                                                return
                                            }
                                            if (e.length < 1) {
                                                return
                                            } else {
                                                return onChange(e)
                                            }
                                        }}
                                        keyboardType="phone-pad"
                                        autoFocus={false}
                                        maxLength={5}
                                    ></TextInput>
                                )}
                                name="countryCode"
                            />

                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                    maxLength: 12,
                                }}
                                render={( { field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        ref={focusPhoneNumber}
                                        allowFontScaling={false}
                                        style={styles.input}
                                        keyboardType="phone-pad"
                                        onBlur={onBlur}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Backspace') {
                                                if(value === '') {
                                                    focusCountryCode.current.focus();
                                                }
                                            }
                                        }}
                                        onChangeText={onChange}
                                        value={value}
                                        autoFocus={false}
                                    />
                                )}
                                name="phoneNumber"
                            />
                            {errors.phoneNumber && <Text  allowFontScaling={false}  style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Kindly use the required format'}</Text>}

                        </View>
                    </View>
                </ScrollView>
                <View style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    width,
                    backgroundColor: 'rgba(52,52,52,0)'
                }}>
                    <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} >
                        {   !loading ?
                            <Ionicons name="arrow-forward-circle" size={55} color="#489AAB" />
                            :
                            <View style={{backgroundColor: '#489AAB', borderRadius: 25, padding: 10, marginBottom: 8, marginRight: 8}}>
                                <RotateView color="#FFFFFF"/>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width,
        height: height - height/3
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
        fontSize: 15,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_500Medium',
        paddingTop: 10
    },
    subTitleText: {
        fontSize: 12,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular'
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
    landingLogo: {
        marginTop: 30,
        width: width/2,
        height: width/2
    },
    input: {
        borderWidth: .5,
        borderColor: '#bbbbbb',
        borderRadius: 10,
        height: 50,
        marginTop: 20,
        paddingHorizontal: width/5,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#757575'
    },
    error: {
        fontSize: 12,
        color: '#f30000',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
});

export default GetTenants;
