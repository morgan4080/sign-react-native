import {
    View,
    Dimensions,
    FlatList,
    Animated,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold,Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect} from "react";
import {getTenants, initializeDB} from "../../stores/auth/authSlice"
import {RotateView} from "../Auth/VerifyOTP";
import {checkToStartUpdate, showSnack} from "../../utils/immediateUpdate";
import {getSecureKey,} from "../../utils/secureStore";
import {RootStackScreenProps} from "../../types";
import {useRef} from 'react';
import OnboardingItem from '../../components/OnboardingItem';
import slides from '../../onboardingslides';
import Paginator from '../../components/Paginator';
import TouchableButton from '../../components/TouchableButton';
import {useAppDispatch, useAppInitialized, useLoading} from "../../stores/hooks";
const { width, height } = Dimensions.get("window");

export default function GetStarted({ navigation }: RootStackScreenProps<"GetStarted">) {
    const [loading] = useLoading();
    const [appInitialized] = useAppInitialized();
    const dispatch = useAppDispatch();
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    useEffect(() => {
        let initializing = true;
        if (initializing) {
            try {
                checkToStartUpdate();
            } catch (e: any) {
                showSnack(e.message, "ERROR", "", false);
            }
            let existing: string
            let phone_number: string
            let country_code: string
            let email_address: string
            let current_tenant_id: string

            // check for existing user and redirect to log in
            Promise.all([
                getSecureKey('existing'),
                getSecureKey('phone_number_without'),
                getSecureKey('phone_number_code'),
                getSecureKey('account_email'),
                getSecureKey('currentTenantId'),
            ]).then(([oldBoy, phone, code, email, currentTenantId]) => {
                existing = oldBoy;
                phone_number = phone;
                country_code = code;
                email_address = email;
                current_tenant_id = currentTenantId;

                if (oldBoy === 'true' && currentTenantId) {
                    return dispatch(getTenants(`${code}${phone}`));
                } else {
                    // initialize new user
                     return Promise.reject('New User To Initialize on Get Started');
                }
            }).then(({type, error, payload}: any) => {
                if (type === 'getTenants/rejected' && error) {
                    throw (JSON.stringify(payload));
                } else {
                    console.log("navigating to login");
                    navigation.navigate('Login', {
                        countryCode: country_code,
                        phoneNumber: phone_number,
                        email: email_address
                    });
                }
            }).catch((e: any) => {
                console.log(e);
            })
        }
        // add notification listener
        return () => {
            initializing = false;
        };
    }, [appInitialized]);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    if (fontsLoaded && !loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{height: "80%"}}>
                    <FlatList
                        data={slides}
                        renderItem={({ item }) => <OnboardingItem item={item}/>}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        bounces={false}
                        keyExtractor={(item) => item.id}
                        onScroll={Animated.event([{ nativeEvent: {contentOffset: { x: scrollX}}}], {
                            useNativeDriver: false
                        })}
                        scrollEventThrottle={32}
                        ref={slidesRef}
                    />

                    <Paginator data={slides} scrollX={scrollX}/>
                </View>

                 <TouchableButton label={'Get started'} loading={loading} onPress={() => {
                     dispatch(initializeDB()).then(() => {
                         navigation.navigate('SetTenant', {
                             code: "254",
                             numericCode: "404",
                             alpha2Code: "KE",
                             flag: "https://flagcdn.com/28x21/ke.png"
                         })
                     }).catch((e: any) => {
                         console.log("couldn't initialize user", e)
                     })
                 }}
                />

                <StatusBar style='auto'/>
            </SafeAreaView>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
        marginHorizontal: 16
    }
})