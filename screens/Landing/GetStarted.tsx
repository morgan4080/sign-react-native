import {
    View,
    StyleSheet,
    Dimensions,
    TouchableHighlight,
    Text,
    StatusBar as Bar,
    Image, Linking
} from 'react-native';
import {checkToStartUpdate} from "../../utils/immediateUpdate"
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {useEffect} from "react";
import {store} from "../../stores/store";
import {getTenants, initializeDB, pingBeacon} from "../../stores/auth/authSlice"
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {getSecureKey, saveSecureKey} from "../../utils/secureStore";
import {RotateView} from "../Auth/VerifyOTP";
import Onboarding from "../../components/Onboarding";
import {registerForPushNotificationsAsync, registerTask} from "../../utils/notificationService";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>

export default function GetStarted({ navigation }: NavigationProps) {
    const { appInitialized, loading } = useSelector((state: { auth: storeState }) => state.auth);
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

    useEffect(() => {
        let initializing = true;
        if (initializing) {
            (async () => {
                try {
                    checkToStartUpdate();

                    const [oldBoy, phone, code, email, currentTenantId] = await Promise.all([
                        getSecureKey('existing'),
                        getSecureKey('phone_number_without'),
                        getSecureKey('phone_number_code'),
                        getSecureKey('account_email'),
                        getSecureKey('currentTenantId'),
                    ]);

                    if (oldBoy === 'true' && currentTenantId) {
                        await dispatch(getTenants(`${code}${phone}`)).then(tenants => {
                            navigation.navigate('Login', {
                                countryCode: code,
                                phoneNumber: phone,
                                email
                            });
                        }).catch(error => {
                            console.log("old boy error", error)
                        })
                    } else {
                        await dispatch(initializeDB())
                    }
                } catch (e: any) {
                    console.log('promise error', e)
                }
                try {
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                        await Promise.allSettled([
                            saveSecureKey('notification_id', token),
                            dispatch(pingBeacon({
                                appName: Constants.manifest?.android?.package,
                                notificationTok: token,
                                version: Constants.manifest?.version
                            }))
                        ])

                        registerTask();
                    }
                } catch (e: any) {
                    console.log('registerForPushNotificationsAsync error', e);
                }
            })();
        }
        // https://play.google.com/store/apps/details?id=com.presta.prestasign
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            if (notification.request.content.data.url) {
                console.log("notification data foreground", notification.request.content.data.url);
                (async () => {
                    await Linking.openURL(notification.request.content.data.url as string);
                })()
            }
        });

        return () => {
            initializing = false;
            subscription.remove();
        };
    }, [appInitialized]);

    if (fontsLoaded && !loading) {
        return (
            <View style={styles.container}>
                <Image
                    style={styles.landingBg}
                    source={require('../../assets/images/landingGetStarted.jpg')}
                />
                <View style={{position: 'absolute',width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', bottom: 5, zIndex: 12}}>
                    <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('SetTenant', {
                        code: "254",
                        numericCode: "404",
                        alpha2Code: "KE",
                        flag: "https://flagcdn.com/28x21/ke.png"
                    })}>
                        <Text allowFontScaling={false} style={styles.buttonText}>Get Started</Text>
                    </TouchableHighlight>
                    <Text allowFontScaling={false} style={{ fontSize: 8, color: '#FFFFFF', textAlign: 'center', marginBottom: 10, fontFamily: 'Poppins_300Light', paddingHorizontal: 20, marginHorizontal: 30 }}>By continuing, you agree to Presta's Terms of Service and privacy policy.</Text>
                </View>
                <Onboarding />
                <StatusBar style='auto'/>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    button: {
        backgroundColor: '#3D889A',
        elevation: 3,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginHorizontal: 30,
        marginTop: 20,
        marginBottom: 5,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height + (Bar.currentHeight ? Bar.currentHeight : 0),
        width
    },
});
