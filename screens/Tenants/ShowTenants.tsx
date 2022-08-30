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
import {authenticate, storeState, setSelectedTenantId, getTenants} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {
    FlatList,
    NativeModules,
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    StatusBar as Bar, Dimensions
} from "react-native";
import {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {getSecureKey} from "../../utils/secureStore";
import configuration from "../../utils/configuration";
import {RotateView} from "../Auth/VerifyOTP";
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

    const CSTM = NativeModules.CSTM;

    useEffect(() => {
        let fetching = true;
        if (fetching) {
            (async () => {
                try {
                    let otpV = await getSecureKey('otp_verified');
                    setOtpVerified(otpV);
                    if (route.params) {
                        const { countryCode, phoneNumber }: any = route.params;
                        if (countryCode && phoneNumber) {
                            // get tenants
                            let phone: string = '';
                            let identifier: string = `${countryCode}${phoneNumber}`;
                            if (identifier[0] === '+') {
                                let number = identifier.substring(1);
                                phone = `${number.replace(/ /g, "")}`;
                            } else if (identifier[0] === '0') {
                                let number = identifier.substring(1);
                                phone = `254${number.replace(/ /g, "")}`;
                            }
                            const { type, error }: any = await dispatch(getTenants(phone));
                        }
                    }
                } catch (e:any) {
                    console.log("getSecureKey otpVerified", e)
                }
            })()
        }
        return () => {
            fetching = false;
        }
    }, [])

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
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
                        navigation.navigate('Login');
                    } else {
                        CSTM.showToast(`${item.tenantName} is not yet supported`);
                    }
                }}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
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
                        data={tenants}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                </SafeAreaView>
            </View>
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
        marginTop: StatusBar.currentHeight || 0,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        borderColor: '#CCCCCC',
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
