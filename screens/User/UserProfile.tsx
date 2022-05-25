import * as React from 'react';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar as Bar,
    Dimensions,
    Platform
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {
    storeState,
    setLoading,
    fetchMember,
    logoutUser,
    saveContactsToDb, setLoanCategories
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";

// Types

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

const greeting = () => {
    return ["Morning", "Afternoon", "Evening"].reduce((previousValue: string, currentValue: string, currentIndex: number, greetings: string[]): string => {
        let actualTime: string = new Date().toTimeString().split(" ")[0].split(":")[0]
        if (parseInt(actualTime) > 0) {
            if (parseInt(actualTime) >= 0 && parseInt(actualTime) < 12) {
                return greetings[0]
            }
            if (parseInt(actualTime) >= 12 && parseInt(actualTime) < 18) {
                return greetings[1]
            }
            if (parseInt(actualTime) >= 18) {
                return greetings[2]
            }
        }
        return ''
    })
}

export default function UserProfile({ navigation }: NavigationProps) {
    const { isLoggedIn, loading, user, member } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const signal = controller.signal;
        (async () => {
            if (!isLoggedIn) {
                if (isMounted) navigation.navigate('Login')
            } else {
                if (user) {
                    try {
                        await Promise.all([
                            dispatch(fetchMember(user?.phoneNumber)),
                            dispatch(saveContactsToDb()),
                            dispatch(setLoanCategories(signal))
                        ]);
                    } catch (e: any) {
                        console.log('promise rejection', e);
                    }
                }
            }
        })()
        return () => {
            isMounted = false;
            controller.abort()
        };
    }, [isLoggedIn]);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const logout = async () => {
        await dispatch(setLoading(true))
        await dispatch(logoutUser())
    }

    if (fontsLoaded) {
        return (
            <View style={{ flex: 1, paddingTop: Bar.currentHeight, position: 'relative' }}>
                {
                    loading &&
                    <View style={{position: 'absolute', top: 50, zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width}}>
                        <RotateView/>
                    </View>
                }
                <Image
                    style={styles.landingBg}
                    source={require('../../assets/images/profile-bg.png')}
                />
                <View style={styles.container}>
                    <View style={{ flex: 1, alignItems: 'center', }}>
                        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width, height: height/2, position: 'relative' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                            <View>
                                <Text allowFontScaling={false} style={styles.titleText}>{ `Good ${ greeting() } ${ user?.firstName }` }</Text>
                                <Text allowFontScaling={false} style={styles.subTitleText}>{ `Your member NO: ${member?.memberNumber}` }</Text>
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: height/2 }}>
                            <View style={{ position: 'absolute', left: width/4, zIndex: 2 }}>
                                <TouchableOpacity style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginTop: -30 }}>
                                    <Text allowFontScaling={false} style={styles.buttonText}>View balances</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'center' }}>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('LoanProducts')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderWidth: 1, borderColor: '#bdbdbd', borderRadius: 25, backgroundColor: 'rgba(51,109,255,0.8)'  }}>
                                        <Image
                                            source={require('../../assets/images/apply-loan.png')}
                                        />
                                        <Text allowFontScaling={false} style={{ color: '#ffffff', fontSize: 12, marginLeft: 10, fontFamily: 'Poppins_600SemiBold', maxWidth: 100 }}>Apply For A Loan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('GuarantorshipRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/Guarantorship-Requests.png')}
                                        />
                                        <Text allowFontScaling={false} style={{ color: '#323492', fontSize: 12, marginLeft: 10, fontFamily: 'Poppins_600SemiBold', maxWidth: 100 }}>Guarantorship Requests</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('FavouriteGuarantors')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/favourite-guarantors.png')}
                                        />
                                        <Text allowFontScaling={false} style={{ color: '#323492', fontSize: 12, fontFamily: 'Poppins_600SemiBold', maxWidth: 100, marginLeft: 10 }}>Favorite Guarantors</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/Guarantorship-Requests.png')}
                                        />
                                        <Text allowFontScaling={false} style={{ color: '#323492', fontSize: 12, fontFamily: 'Poppins_600SemiBold', maxWidth: 100, marginLeft: 10 }}>Witness Requests</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
    container: {
        flex: 1,
    },
    subTitleText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
        elevation: 1
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height/1.7
    },
    titleText: {
        fontSize: 22,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        elevation: 1
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
