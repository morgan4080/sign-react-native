import {
    Dimensions,
    Image,
    NativeModules,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    VirtualizedList,
    View, KeyboardAvoidingView
} from "react-native";
import {RotateView} from "../Auth/VerifyOTP";
const { width, height } = Dimensions.get("window");
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {requestPhoneNumber} from "../../utils/smsVerification";
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
import {AntDesign, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
const { CSTM, CountriesModule, DeviceInfModule } = NativeModules;

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
    countryCode: string;
    email: string;
}

const GetTenants = ({ navigation, route }: NavigationProps) => {

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

    const [code, setCode] = useState(route.params?.code ? `+${route.params.code}` : '+254')

    const [country, setCountry] = useState<{name: string, code: string, numericCode: string, flag: string}>()

    const defaultValues = phn && phn !== "" ? {
        phoneNumber: phn,
        countryCode: code
    } : {
        countryCode: code
    };

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        clearErrors,
        getValues,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues
    });

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                try {
                    const [response] = await Promise.all([
                        dispatch(authenticate())
                    ]);

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
    }, [tenants]);

    const [deviceId, setDeviceId] = useState<string | null>(null)

    const [tab, setTab] = useState<number>(1)


    useEffect(() => {
        if (code === '+254') {
            setTab(0)
        } else {
            setTab(1)
        }
    }, [code]);

    useEffect(() => {
        let isLoggedInSubscribed = true;

        (async () => {
            if (isLoggedIn) {
                navigation.navigate('ProfileMain')
            } else {
                try {
                    const [ph, x] = await Promise.all([
                        getSecureKey('phone_number_without'),
                        DeviceInfModule.getUniqueId(),
                    ]);
                    setDeviceId(x);
                    const codex = route.params?.code ? `+${route.params.code}` : await getSecureKey('phone_number_code');
                    if (ph && ph !== '') {
                        setValue('phoneNumber', ph);
                        setPhn(ph);
                    } else {
                        const [pn] = await Promise.all([
                            requestPhoneNumber()
                        ]);
                        setValue('phoneNumber', pn);
                        setPhn(pn);
                    }
                    if (codex && codex !== '') {
                        setValue('countryCode', route.params?.code ? code : codex);
                        let countriesJson = await CountriesModule.getCountries();
                        if (countriesJson) {
                            let countries: {name: string, code: string, numericCode: string, alpha2Code: string}[] = JSON.parse(countriesJson);
                            setValue('countryCode', codex);
                            const country = countries.find((country: {name: string, code: string, numericCode: string, alpha2Code: string}) => (country.code === codex.replace("+", "") && country.numericCode === route.params?.numericCode && country.alpha2Code === route.params?.alpha2Code));
                            if (country && country.alpha2Code) {
                                setCountry({
                                    ...country,
                                    flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                                });
                            } else {
                                const countryLight = countries.find((country: {name: string, code: string, numericCode: string, alpha2Code: string}) => (country.code === codex.replace("+", "")));
                                if (countryLight) {
                                    setCountry({
                                        ...countryLight,
                                        flag: `https://flagcdn.com/28x21/${countryLight.alpha2Code.toLowerCase()}.png`
                                    });
                                }
                            }
                        }
                        setCode(codex)
                    } else {
                        setValue('countryCode', defaultValues.countryCode);
                        let countriesJson = await CountriesModule.getCountries();
                        if (countriesJson) {
                            let countries: {name: string, code: string, numericCode: string, alpha2Code: string}[] = JSON.parse(countriesJson);
                            setValue('countryCode', defaultValues.countryCode);
                            const country = countries.find((country: {name: string, code: string, numericCode: string, alpha2Code: string}) => (country.code === defaultValues.countryCode.replace("+", "")));
                            if (country && country.alpha2Code) {
                                setCountry({
                                    ...country,
                                    flag: `https://flagcdn.com/28x21/${country.alpha2Code.toLowerCase()}.png`
                                });
                            }
                        }
                        setCode(defaultValues.countryCode)
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
    }, [isLoggedIn, route.params?.code]);

    const [submitted, setSubmitted] = useState(false)

    const onSubmit = async (value: any): Promise<void> => {
        console.log("running submit");
        if (value && code === '+254') {
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
                setSubmitted(true);
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
        } else {
            try {
                const { email, phoneNumber, countryCode } = value;

                if (email && phoneNumber && countryCode) {
                    const { type, error, payload }: any = await dispatch(getTenants(email));
                    setSubmitted(true);
                    if (type === 'getTenants/rejected' && error) {
                        if (error.message === "Network request failed") {
                            CSTM.showToast(error.message);
                        } else {
                            setError('email', { type: 'custom', message: error.message });
                        }
                    } else {
                        await saveSecureKey('account_email', email);
                        await saveSecureKey('phone_number_code', countryCode);

                        if (payload.length === 0)  setError('email', {type: 'custom', message: 'Please provide a valid email'});
                    }

                } else {
                    setError('email', {type: 'custom', message: 'Please provide a valid email'});
                }

            } catch (e) {
                console.log('Error email login', e);
            }
        }
    }

    const focusCountryCode = useRef<any>();

    const focusPhoneNumber = useRef<any>();

    const Item = ({ title }: {title: string}) => {
        switch (title){
            case 'logo':
                return (
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/DarkLogo.png')}
                        />
                    </View>
                )
            case 'title':
                return (
                    <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <Text allowFontScaling={false} style={styles.titleText}>Enter registered phone number</Text>
                        <Text allowFontScaling={false} style={styles.subTitleText}>Verify Membership</Text>

                        {
                            code !== '+254' &&
                            <View style={{display: 'flex', alignItems: 'center', flexDirection: 'row', paddingTop: 15}}>
                                <TouchableOpacity onPress={() => {
                                    setTab(0)
                                }} style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start'
                                }}>
                                    <Text allowFontScaling={false} style={[{
                                        color: tab === 0 ? '#489AAB' : '#c6c6c6',
                                        paddingHorizontal: 10
                                    }, styles.tabTitle, {
                                        borderBottomWidth: tab === 0 ? 2 : 0,
                                        borderColor: '#489AAB'
                                    }]}>Phone</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    setTab(1)
                                }} style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start'
                                }}>
                                    <Text allowFontScaling={false} style={[{
                                        color: tab === 1 ? '#489AAB' : '#c6c6c6',
                                        paddingHorizontal: 10
                                    }, styles.tabTitle, {
                                        borderBottomWidth: tab === 1 ? 2 : 0,
                                        borderColor: '#489AAB'
                                    }]}>Email</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                )
            case 'country':
                return (
                    <View style={{ paddingHorizontal: 30, marginTop: 20, position: 'relative' }}>
                        <View style={{ ...styles.input, position: 'absolute', top: 7, left: width/14, width: width/5.5, borderRadius: 0, height: 35, paddingLeft: 0, borderWidth: 0, paddingRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            {
                                country ? <Image source={{uri: country?.flag}} style={{width: 20, height: 15}}/>
                                    :
                                    <MaterialCommunityIcons name="diving-scuba-flag" size={20} color="#8d8d8d"/>
                            }
                        </View>
                        <View style={{ ...styles.input, position: 'absolute', top: 7, right: width/12, width: width/5.5, borderRadius: 0, height: 35, paddingHorizontal: 15, borderWidth: 0, paddingRight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <AntDesign name="right" size={20} color="#8d8d8d" />
                        </View>

                        <View>
                            <Pressable style={{position: 'absolute', width: '100%', height: '100%'}} onPress={() => navigation.navigate('Countries')}>

                            </Pressable>
                            <TextInput
                                style={styles.input}
                                placeholder="SELECT COUNTRY"
                                value={country?.name}
                                editable={false}
                            />
                        </View>
                    </View>
                )
            case 'email':
                if (code !== '+254' && tab === 1) {
                    return (
                        <View style={{ paddingHorizontal: 30, marginTop: 10, position: 'relative' }}>

                            <AntDesign name="mail" size={20} color={errors.email && submitted ? '#d53b39' : "#757575FF"} style={{position: 'absolute', top: 33, left: width/11, width: width/5.5, borderRadius: 0, height: 35, borderWidth: 0, zIndex: 11, paddingHorizontal: 15, paddingRight: 0}} />


                            <Controller
                                control={control}
                                rules={{
                                    required: false,
                                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
                                }}
                                render={( { field: { onChange, value } }) => (
                                    <TextInput
                                        value={value}
                                        allowFontScaling={false}
                                        keyboardType="email-address"
                                        style={{
                                            ...styles.input,
                                            color: errors.email && submitted ? '#d53b39': '#757575',
                                            borderColor: errors.email && submitted ? '#d53b39': '#8d8d8d',
                                            fontSize: 12
                                        }}
                                        placeholder="example@host.tld"
                                        onChangeText={onChange}
                                    />
                                )}
                                name="email"
                            />
                            {
                                (errors.email && submitted) &&
                                <Text  allowFontScaling={false}  style={styles.error}>{errors.email?.message ? errors.email?.message : 'Kindly use the required format'}</Text>
                            }

                            {(deviceId && phn && code && (errors.email) && submitted) &&
                                <Pressable style={{paddingTop: 10}} onPress={() => {
                                    const payload = {
                                        deviceId: deviceId,
                                        phoneNumber: null,
                                        email: getValues("email")
                                    };
                                    navigation.navigate('SelectTenant', payload);
                                }}>
                                    <Text allowFontScaling={false} style={{
                                        ...styles.error,
                                        color: '#489AAB',
                                        textDecorationLine: 'underline',
                                        fontSize: 12
                                    }}>Setup Account</Text>
                                </Pressable>
                            }
                        </View>
                    )
                } else {
                    return (
                        <></>
                    )
                }
            case 'phoneNumber':
                if (tab === 0) {
                    return (
                        <View style={{paddingHorizontal: 30, marginTop: 10, position: 'relative'}}>
                            <Controller
                                control={control}
                                rules={{
                                    required: false,
                                    maxLength: 12,
                                }}
                                render={({field: {onChange, value}}) => (
                                    <TextInput
                                        ref={focusCountryCode}
                                        allowFontScaling={false}
                                        style={{
                                            ...styles.input,
                                            position: 'absolute',
                                            top: 7,
                                            left: width / 11,
                                            width: width / 5.5,
                                            borderRadius: 0,
                                            height: 35,
                                            borderWidth: 0,
                                            zIndex: 11,
                                            paddingHorizontal: 15,
                                            paddingRight: 0
                                        }}
                                        editable={false}
                                        value={value}
                                        onChangeText={(e) => {
                                            if (e.length > 4) {
                                                focusPhoneNumber.current.focus();
                                                setValue('phoneNumber', e[e.length - 1])
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
                                    required: false,
                                    maxLength: 12,
                                }}
                                render={({field: {onChange, value}}) => (
                                    <TextInput
                                        ref={focusPhoneNumber}
                                        allowFontScaling={false}
                                        style={{
                                            ...styles.input,
                                            color: errors.phoneNumber && submitted ? '#d53b39' : '#757575',
                                            borderColor: errors.phoneNumber && submitted ? '#d53b39' : '#8d8d8d'
                                        }}
                                        keyboardType="phone-pad"
                                        onKeyPress={({nativeEvent}) => {
                                            if (nativeEvent.key === 'Backspace') {
                                                if (value === '') {
                                                    focusCountryCode.current.focus();
                                                }
                                            }
                                        }}
                                        onChangeText={onChange}
                                        value={value}
                                        autoFocus={false}
                                        placeholder="722000000"
                                    />
                                )}
                                name="phoneNumber"
                            />
                            {
                                (errors.phoneNumber && submitted) &&
                                <Text allowFontScaling={false}
                                      style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Kindly use the required format'}</Text>
                            }

                            {(deviceId && phn && code && (errors.phoneNumber) && submitted) &&
                                <Pressable style={{paddingTop: 10}} onPress={async () => {
                                    const [c, p] = await Promise.all([getSecureKey('phone_number_code'), getSecureKey('phone_number_without')]);
                                    const payload = {
                                        deviceId: deviceId,
                                        phoneNumber: `${c}${p}`,
                                        email: null
                                    };
                                    navigation.navigate('SelectTenant', payload);
                                }}>
                                    <Text allowFontScaling={false} style={{
                                        ...styles.error,
                                        color: '#489AAB',
                                        textDecorationLine: 'underline',
                                        fontSize: 12
                                    }}>Setup Account</Text>
                                </Pressable>
                            }
                        </View>
                    )
                } else {
                    return (
                        <></>
                    )
                }
            case 'button':
                return (
                    <View style={{ paddingHorizontal: 30, paddingVertical: 20 }}>
                        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} style={{alignSelf: 'flex-end'}} >
                            {   !loading ?
                                <Ionicons name="arrow-forward-circle" size={70} color="#489AAB" />
                                :
                                <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC', borderRadius: 50, width: 65, height: 65}}>
                                    <RotateView color="#FFFFFF"/>
                                </View>
                            }
                        </TouchableOpacity>
                    </View>
                )
            default:
                return (
                    <>

                    </>
                )
        }

    };

    const DATA: any[] = [
        {
            id: Math.random().toString(12).substring(0),
            title: 'logo'
        },
        {
            id: Math.random().toString(12).substring(0),
            title: 'title'
        },
        {
            id: Math.random().toString(12).substring(0),
            title: 'country'
        },
        {
            id: Math.random().toString(12).substring(0),
            title: 'email'
        },
        {
            id: Math.random().toString(12).substring(0),
            title: 'phoneNumber'
        },
        {
            id: Math.random().toString(12).substring(0),
            title: 'button'
        },
    ];

    const getItem = (data: any, index: number) => (data[index]);

    const getItemCount = (data: any) => {
        return data.length
    };

    if (!isJWT && fontsLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView>
                    <VirtualizedList
                        data={DATA}
                        initialNumToRender={4}
                        renderItem={({ item }) => <Item title={item.title} />}
                        keyExtractor={item => item.id}
                        getItemCount={getItemCount}
                        getItem={getItem}
                    />
                </KeyboardAvoidingView>
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
        flex: 1,
        backgroundColor: '#FFFFFF'
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
        color: '#265D73',
        textTransform: 'capitalize',
        fontFamily: 'Poppins_600SemiBold',
        paddingTop: 10
    },
    subTitleText: {
        fontSize: 13,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_300Light'
    },
    linkText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        color: '#44A69C',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    landingLogo: {
        marginTop: 80,
        width: width/2,
        height: width/2
    },
    input: {
        borderWidth: 1,
        borderColor: '#8d8d8d',
        borderRadius: 15,
        height: 50,
        marginTop: 20,
        paddingHorizontal: width/5,
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#757575'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    tabTitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 12,
        padding: 5
    }
});

export default GetTenants;
