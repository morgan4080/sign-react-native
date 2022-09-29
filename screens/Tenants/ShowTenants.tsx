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
    searchByPhone, searchByEmail, fetchGuarantorshipRequests
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
    Dimensions
} from "react-native";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getSecureKey} from "../../utils/secureStore";
import configuration from "../../utils/configuration";
import {RotateView} from "../Auth/VerifyOTP";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import BottomSheet, {BottomSheetBackdrop} from "@gorhom/bottom-sheet";
type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
    </TouchableOpacity>
);

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

    const { selectedTenantId, isLoggedIn, tenants, loading } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const {CSTM} = NativeModules;

    const reFetch = async () => {
        try {
            let otpV = await getSecureKey('otp_verified');

            setOtpVerified(otpV);

            const { countryCode, phoneNumber, email }: any = route.params;

            if (email && countryCode) {

                console.log('fetch tenants', email);

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
                console.log('fetch tenants', phone)

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


    const renderItem = ({ item }: any) => {
        const backgroundColor = item.id === selectedTenantId ? "#489AAB" : "#FFFFFF";
        const color = item.id === selectedTenantId ? 'white' : 'black';

        return (
            <Item
                item={item}
                onPress={() => {
                    // if item doesn't exist in configuration
                    // communicate that it's not yet supported

                    const settings = configuration.find(config => config.tenantId === item.tenantId);

                    if (settings) {
                        dispatch(setSelectedTenantId(item.id));

                        console.log("selected tenant", settings);

                        (async () => {
                            const {type, payload, error} : any = await dispatch(authClient({realm: settings.tenantId, client_secret: settings.clientSecret}))

                            if (type === 'authClient/fulfilled') {
                                const { access_token } = payload;

                                const { countryCode, phoneNumber, email }: any = route.params;

                                console.log("the phone number", countryCode, phoneNumber, email)

                                if (email && access_token) {
                                    const response: any = await dispatch(searchByEmail({email: encodeURIComponent(email), access_token}))

                                    if (response.type === 'searchByEmail/rejected') {
                                        CSTM.showToast(response.error.message);
                                        setErrorSMS(response.error.message);
                                    } else {
                                        // we can intercept and cereate otp here
                                        setUserFound(true);
                                        navigation.navigate('Login');
                                    }
                                } else if (phoneNumber && access_token) {
                                    const response: any = await dispatch(searchByPhone({
                                        phoneNumber: `${countryCode}${phoneNumber}`.replace('+', ''),
                                        access_token
                                    }))

                                    if (response.type === 'searchByPhone/rejected') {
                                        CSTM.showToast(response.error.message)
                                        setErrorSMS(response.error.message)
                                    } else {
                                        console.log('searchByPhone', response.payload);
                                        // we can intercept and cereate otp here
                                        setUserFound(true);
                                        navigation.navigate('Login');
                                    }
                                }
                            } else {
                                CSTM.showToast(error.message)
                            }
                        })()
                    } else {
                        CSTM.showToast(`${item.tenantName} is not yet supported`);
                    }
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
                    <View style={{backgroundColor: '#FFFFFF'}}><Text>Sorry, kindly contact developer</Text></View>
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
