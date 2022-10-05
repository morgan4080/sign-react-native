import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useDispatch, useSelector} from "react-redux";
import {
    authenticate,
    storeState,
    setSelectedTenantId,
    getTenants,
    authClient,
    searchByPhone, searchByEmail, fetchGuarantorshipRequests, verifyOtpBeforeToken, sendOtpBeforeToken, hasPinCheck
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {
    FlatList,
    NativeModules,
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions, TextInput, Pressable
} from "react-native";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getSecureKey} from "../../utils/secureStore";
import configuration from "../../utils/configuration";
import {RotateView} from "../Auth/VerifyOTP";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {Controller, useForm} from "react-hook-form";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";
type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
    </TouchableOpacity>
);

const {CSTM, DeviceInfModule} = NativeModules;

const ShowTenants = ({ navigation, route }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const [otpVerified, setOtpVerified] = useState(undefined);

    const { selectedTenantId, isLoggedIn, tenants, loading, organisations } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { countryCode, phoneNumber, email }: any = route.params;

    const reFetch = async () => {
        try {
            let otpV = await getSecureKey('otp_verified');

            setOtpVerified(otpV);

            if (email && countryCode) {

                await dispatch(getTenants(email));

            } else if (phoneNumber && countryCode) {
                let phone: string = '';
                let identifier: string = `${countryCode}${phoneNumber}`;
                if (identifier[0] === '+') {
                    let number = identifier.substring(1);
                    phone = `${number.replace(/ /g, "")}`;
                } else if (identifier[0] === '0') {
                    let number = identifier.substring(1);
                    phone = `254${number.replace(/ /g, "")}`;
                }

                await dispatch(getTenants(phone));
            }

        } catch (e:any) {
            console.log("getSecureKey otpVerified", e);
        }
    }

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    await reFetch();
                    return
                }
                if (response.type === 'authenticate/fulfilled') {
                    if (isLoggedIn) {
                        navigation.navigate('ProfileMain')
                    }
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, []);

    const [userFound, setUserFound] = useState<boolean>(false);

    const [errorSMS, setErrorSMS] = useState<string>("");

    /*useEffect(() => {
        if (!userFound) {
            handleSnapPress(1);
        } else {
            handleClosePress();
        }
    }, [userFound])*/

    const [context, setContext] = useState<string | null>(null)


    const renderItem = ({ item }: any) => {
        const backgroundColor = item.id === selectedTenantId ? "#489AAB" : "#FFFFFF";
        const color = item.id === selectedTenantId ? 'white' : 'black';

        return (
            <Item
                item={item}
                onPress={() => {
                    // if item doesn't exist in configuration
                    // communicate that it's not yet supported
                    (async () => {
                        let { countryCode, phoneNumber, email }: any = route.params;

                        const settings = configuration.find(config => config.tenantId === item.tenantId);

                        if (settings) {
                            dispatch(setSelectedTenantId(item.id));

                            let {type, payload, error} : any = await dispatch(authClient({realm: settings.tenantId, client_secret: settings.clientSecret}))

                            if (type === 'authClient/fulfilled') {
                                const { access_token } = payload;

                                if (!phoneNumber && !email) {
                                    phoneNumber = await getSecureKey('phone_number_without');
                                }

                                // check has pin here

                                if (access_token) {
                                    let {type, payload, error}: any = await dispatch(hasPinCheck({
                                        access_token: access_token,
                                        phoneNumber: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : item.ussdPhoneNumber ? item.ussdPhoneNumber.replace('+', '') : item.phoneNumber.replace('+', '')
                                    }))

                                    console.log("has pin payload", payload);

                                    if (payload.pinStatus === "SET" && type === 'hasPinCheck/fulfilled') {
                                        if (email) {
                                            const response: any = await dispatch(searchByEmail({email: encodeURIComponent(email), access_token}))

                                            if (response.type === 'searchByEmail/rejected') {
                                                CSTM.showToast(response.error.message);
                                                setErrorSMS(response.error.message);
                                            } else {
                                                // we can intercept and cereate otp here
                                                setUserFound(true);
                                                navigation.navigate('Login');
                                            }
                                        } else if (phoneNumber) {
                                            const response: any = await dispatch(searchByPhone({
                                                phoneNumber: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : item.ussdPhoneNumber ? item.ussdPhoneNumber.replace('+', '') : item.phoneNumber.replace('+', ''),
                                                access_token
                                            }))

                                            if (response.type === 'searchByPhone/rejected') {
                                                CSTM.showToast(response.error.message)
                                                setErrorSMS(response.error.message)
                                            } else {
                                                // we can intercept and cereate otp here
                                                setUserFound(true);
                                                navigation.navigate('Login');
                                            }
                                        } else {
                                            navigation.navigate('GetTenants');
                                        }
                                    } else {

                                        const [deviceId] = await Promise.all([
                                            DeviceInfModule.getUniqueId(),
                                        ]);
                                        const appName = 'presta-sign';
                                        dispatch(sendOtpBeforeToken({
                                            email: email ? email : item.email,
                                            phoneNumber: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : item.ussdPhoneNumber ? item.ussdPhoneNumber.replace('+', '') : item.phoneNumber.replace('+', ''),
                                            deviceId,
                                            appName
                                        })).then(response => {
                                            console.log("sendOtpBeforeToken", response.payload);
                                            CSTM.showToast("OTP sent please wait");
                                            handleSnapPress(1);
                                            setContext('OTP');
                                        }).catch(e => {
                                            console.log("Item: sendOtpBeforeToken", e.message)
                                        })
                                    }
                                }
                            } else {
                                CSTM.showToast(error.message)
                            }

                        } else {
                            CSTM.showToast(`${item.tenantName} is not yet supported`);
                        }
                    })()
                }}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

    useEffect(() => {

        (async () => {
            await startSmsUserConsent();
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
                    const otp = otpArray.find(message => regex.exec(message));
                    if (otp && otp.length === 4) {

                        (async () => {
                            setValue('otp', otp);

                            const [deviceId] = await Promise.all([
                                DeviceInfModule.getUniqueId(),
                            ]);

                            const currentTenant = tenants.find(tenant => tenant.id === selectedTenantId)

                            if (currentTenant) {
                                type organisationType = {
                                    id: string,
                                    tenantName: string,
                                    tenantId: string,
                                    clientSecret: string,
                                }
                                const organisation = organisations.find((org: organisationType) => org.tenantId === currentTenant.tenantId);
                                const data = {
                                    identifier: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : currentTenant ? currentTenant.ussdPhoneNumber ? currentTenant.ussdPhoneNumber : email : '',
                                    deviceHash: deviceId,
                                    verificationType:  (phoneNumber && countryCode) ||  (currentTenant && currentTenant.ussdPhoneNumber) ? "PHONE_NUMBER" : "EMAIL",
                                    otp
                                }

                                try {

                                    const {meta, payload, type} = await dispatch(verifyOtpBeforeToken(data))

                                    if (type === "verifyOtpBeforeToken/fulfilled" && payload) {
                                        handleClosePress();
                                        setTimeout(() => {
                                            navigation.navigate('SetPin', {
                                                phoneNumber: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : currentTenant ? currentTenant.ussdPhoneNumber ? currentTenant.ussdPhoneNumber : currentTenant.phoneNumber: '',
                                                email,
                                                realm: currentTenant.tenantId,
                                                client_secret: organisation?.clientSecret
                                            })
                                        }, 500);
                                    } else {
                                        setError('otp', {type: 'custom', message: 'Verification failed'});
                                        console.log('verification failed', payload, type);
                                    }

                                } catch (e: any) {
                                    console.log("verifyOtpBeforeToken", e.message)
                                }
                            }

                        })()
                    }
                }
            });
        })()

    }, [context])

    const sheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

    // callbacks
    const handleSheetChange = useCallback((index: any) => {
        console.log("handleSheetChange", index);
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

    // disappearsOnIndex={1}
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={1}
            />
        ),
        []
    );

    type FormData = {
        otp: string;
    }

    const {
        control,
        watch,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>({})

    const sendOtpHere = async () => {
        console.log('sending again')
        const [deviceId] = await Promise.all([
            DeviceInfModule.getUniqueId(),
        ]);
        const appName = 'presta-sign';
        const currentTenant = tenants.find(tenant => tenant.id === selectedTenantId)
        dispatch(sendOtpBeforeToken({
            email: email ? email : currentTenant?.email,
            phoneNumber: phoneNumber ? phoneNumber : currentTenant?.ussdPhoneNumber ? currentTenant?.ussdPhoneNumber : currentTenant?.phoneNumber,
            deviceId,
            appName
        })).then(response => {
            console.log("sendOtpBeforeToken", response.payload);
            CSTM.showToast("OTP sent please wait");
        }).catch(e => {
            console.log("Item: sendOtpBeforeToken", e.message)
        })
    }


    const verifyOTP0 = async (otp: string) => {
        const [deviceId] = await Promise.all([
            DeviceInfModule.getUniqueId(),
        ]);

        const currentTenant = tenants.find(tenant => tenant.id === selectedTenantId)

        type organisationType = {
            id: string,
            tenantName: string,
            tenantId: string,
            clientSecret: string,
        }
        const organisation = organisations.find((org: organisationType) => org.tenantId === currentTenant?.tenantId);

        const data = {
            identifier: currentTenant?.ussdPhoneNumber ? currentTenant?.ussdPhoneNumber : phoneNumber ? phoneNumber: email,
            deviceHash: deviceId,
            verificationType: (phoneNumber || currentTenant?.ussdPhoneNumber) ? "PHONE_NUMBER" : "EMAIL",
            otp
        }

        console.log(data)

        try {

            const {meta, payload, type} = await dispatch(verifyOtpBeforeToken(data))

            if (type === "verifyOtpBeforeToken/fulfilled" && payload) {
                setTimeout(() => {
                    navigation.navigate('SetPin', {
                        phoneNumber: (phoneNumber && countryCode) ? `${countryCode}${phoneNumber}`.replace('+', '') : currentTenant ? currentTenant.ussdPhoneNumber ? currentTenant.ussdPhoneNumber : currentTenant.phoneNumber: '',
                        email,
                        realm: currentTenant?.tenantId,
                        client_secret: organisation?.clientSecret
                    })
                }, 500);

                handleClosePress();
            } else {
                setError('otp', {type: 'custom', message: 'Verification failed'});
                console.log('verification failed', payload, type);
            }

        } catch (e: any) {
            console.log("verifyOtpBeforeToken", e.message)
        }
    }

    if (fontsLoaded) {
        return (
            <GestureHandlerRootView style={{ flex: 1, position: 'relative' }}>
                <View style={{
                    position: 'absolute',
                    left: 60,
                    top: -120,
                    backgroundColor: 'rgba(50,52,146,0.12)',
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    borderRadius: 100,
                    width: 200,
                    height: 200
                }}/>
                <View style={{
                    position: 'absolute',
                    left: -100,
                    top: '20%',
                    backgroundColor: 'rgba(50,52,146,0.12)',
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    borderRadius: 100,
                    width: 200,
                    height: 200
                }}/>
                <View style={{
                    position: 'absolute',
                    right: -80,
                    top: '10%',
                    backgroundColor: 'rgba(50,52,146,0.12)',
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    borderRadius: 100,
                    width: 150,
                    height: 150
                }}/>
                <SafeAreaView style={styles.container}>
                    <FlatList
                        refreshing={loading}
                        progressViewOffset={50}
                        onRefresh={() => reFetch()}
                        data={tenants}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ListFooterComponent={<View style={{height: 50}} />}
                    />
                </SafeAreaView>

                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetScrollView style={{backgroundColor: '#FFFFFF'}}>
                        <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Text allowFontScaling={false} style={{fontFamily: 'Poppins_600SemiBold', color: '#489AAB', fontSize: 15, marginTop: 10}}>Verify OTP</Text>
                        </View>

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

                    </BottomSheetScrollView>
                </BottomSheet>
            </GestureHandlerRootView>
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
    container0: {
        flex: 1,
        position: 'relative'
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
    },
    container: {
        flex: 1,
        marginTop: 20,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        borderColor: 'rgba(204,204,204,0.13)',
        borderWidth: .5,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
    },
    tenantName: {
        fontSize: 16,
        fontFamily: 'Poppins_300Light',
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium'
    },
});

export default ShowTenants
