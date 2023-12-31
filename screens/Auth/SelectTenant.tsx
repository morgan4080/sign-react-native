import {
    Dimensions,
    FlatList,
    NativeModules,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
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
import {useDispatch, useSelector} from "react-redux";
import {sendOtpBeforeToken, setSelectedTenant, storeState, verifyOtpBeforeToken} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {RotateView} from "./VerifyOTP";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useCallback, useEffect, useMemo, useRef} from "react";
import {Controller, useForm} from "react-hook-form";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {receiveVerificationSMS, startSmsUserConsent} from "../../utils/smsVerification";

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
    </TouchableOpacity>
);

type FormData = {
    otp: string;
}

type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");

const { CSTM } = NativeModules;

const appName = 'presta-sign'

const SelectTenant = ({ navigation, route }: NavigationProps) => {
    const { loading, organisations, selectedTenant } = useSelector((state: { auth: storeState }) => state.auth);

    const {deviceId, phoneNumber, email}: any = route.params;

    console.log(deviceId, phoneNumber, email);

    const {
        control,
        watch,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>({})

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const orgItem = ({ item }: any) => {
        const backgroundColor = item.id === (selectedTenant && selectedTenant.id) ? "#489AAB" : "#FFFFFF";
        const color = item.id === (selectedTenant && selectedTenant.id) ? 'white' : 'black';

        return (
            <Item
                item={item}
                onPress={() => {
                    dispatch(setSelectedTenant(item));
                    handleSnapPress(1);

                    dispatch(sendOtpBeforeToken({email, phoneNumber, deviceId, appName})).then(response => {
                        console.log("sendOtpBeforeToken", response.payload);
                        CSTM.showToast("OTP sent please wait");
                    }).catch(e => {
                        console.log("Item: sendOtpBeforeToken", e.message)
                    })
                }}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

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

    useEffect(() => {
        console.log('tenant set', selectedTenant)

        let setupUser = true;

        if (setupUser) {
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

                                const data = {
                                    identifier: phoneNumber ? phoneNumber: email,
                                    deviceHash: deviceId,
                                    verificationType: phoneNumber ? "PHONE_NUMBER" : "EMAIL",
                                    otp
                                }

                                try {

                                    const {meta, payload, type} = await dispatch(verifyOtpBeforeToken(data))

                                    if (type === "verifyOtpBeforeToken/fulfilled" && payload) {
                                        handleClosePress();
                                        setTimeout(() => {
                                            navigation.navigate('SetPin', {
                                                phoneNumber,
                                                email,
                                                realm: selectedTenant?.tenantId,
                                                client_secret: selectedTenant?.clientSecret
                                            })
                                        }, 500);
                                    } else {
                                        setError('otp', {type: 'custom', message: 'Verification failed'});
                                        console.log('verification failed', payload, type);
                                    }

                                } catch (e: any) {
                                    console.log("verifyOtpBeforeToken", e.message)
                                }

                            })()
                        }
                    }
                });
            })()
        }
        return (() => {
            setupUser = false;
        })
    }, [selectedTenant])


    const sendOtpHere = () => {
        console.log('sending again')
        dispatch(sendOtpBeforeToken({email, phoneNumber, deviceId, appName})).then(response => {
            console.log("sendOtpBeforeToken", response.payload);
            CSTM.showToast("OTP sent please wait");
        }).catch(e => {
            console.log("Item: sendOtpBeforeToken", e.message)
        })

    }

    const verifyOTP0 = async (otp: string) => {
        const data = {
            identifier: phoneNumber ? phoneNumber: email,
            deviceHash: deviceId,
            verificationType: phoneNumber ? "PHONE_NUMBER" : "EMAIL",
            otp
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
            <GestureHandlerRootView style={styles.container}>

                <FlatList
                    data={organisations}
                    renderItem={orgItem}
                    keyExtractor={item => `${item.id}`}
                    ListFooterComponent={<View style={{height: 50}} />}
                />
                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white", paddingHorizontal: 20}}>
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

                        <View style={{display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 30}}>
                            {loading ? <RotateView color="#489AAB"/> : <></>}
                        </View>
                    </BottomSheetScrollView>
                </BottomSheet>
            </GestureHandlerRootView>
        )
    } else {
        return (
            <View style={{...styles.container, backgroundColor: '#489AAB'}}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight : 0,
        backgroundColor: '#FFFFFF'
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
    input: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15,
        color: '#393a34',
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        width: width/4,
        textAlign: 'center'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    }
})

export default SelectTenant;
