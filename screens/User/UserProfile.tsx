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
    Platform, NativeModules
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {
    storeState,
    setLoading,
    fetchMember,
    logoutUser,
    saveContactsToDb,
    setLoanCategories,
    authenticate,
    fetchLoanProducts
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
    const { loading, user, member, guarantorshipRequests, witnessRequests } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let authenticating = true;
        const controller = new AbortController();
        const signal = controller.signal;
        if (authenticating) {
            (async () => {
                const { type, payload }: any = await dispatch(authenticate());
                if (type === 'authenticate/rejected') {
                    navigation.navigate('GetTenants')
                } else {
                    console.log("Authentication", payload);
                    try {
                        await Promise.all([
                            dispatch(fetchMember(payload.username)),
                            dispatch(saveContactsToDb()),
                            dispatch(fetchLoanProducts()),
                            dispatch(setLoanCategories(signal))
                        ]);
                    } catch (e: any) {
                        console.log('promise rejection', e);
                    }
                }
            })()
        }
        return () => {
            controller.abort();
            authenticating = false;
        }
    }, []);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    if (fontsLoaded) {
        return (
            <View style={{ flex: 1, paddingTop: Bar.currentHeight, position: 'relative', backgroundColor: '#FFFFFF' }}>
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
                                <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginTop: -30 }}>
                                    <Text allowFontScaling={false} style={styles.buttonText}>View balances</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'center' }}>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('LoanProducts')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderRadius: 25, backgroundColor: 'rgba(51,109,255,0.8)', position: 'relative'  }}>
                                        <Text allowFontScaling={false} style={{ flex: 3, color: '#ffffff', fontSize: 11.5, marginLeft: 10, marginRight: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                            Apply For A Loan
                                        </Text>
                                        <View  style={{ flex: 1, marginRight: width/20 }}>
                                            <Image
                                                source={require('../../assets/images/apply-loan.png')}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('GuarantorshipRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                        <View style={{backgroundColor: '#FC866C', position: 'absolute', top: 0, right: 0, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: width/15, height: width/15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF'}}>{ guarantorshipRequests?.length }</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={{ flex: 3, color: '#336DFF', fontSize: 11.5, marginLeft: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                            Guarantorship Requests
                                        </Text>
                                        <View  style={{ flex: 1, marginRight: width/20 }}>
                                            <Image
                                                source={require('../../assets/images/Guarantorship-Requests.png')}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={() => navigation.navigate('FavouriteGuarantors')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 25, position: 'relative'  }}>
                                        <Text allowFontScaling={false} style={{ flex: 3, color: '#336DFF', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10 }}>
                                            Favorite Guarantors
                                        </Text>
                                        <View  style={{ flex: 1, marginRight: width/20 }}>
                                            <Image
                                                source={require('../../assets/images/favourite-guarantors.png')}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('WitnessRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                        <View style={{backgroundColor: '#FC866C', position: 'absolute', top: 0, right: 0, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: width/15, height: width/15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF'}}>{ witnessRequests?.length }</Text>
                                        </View>
                                        <Text allowFontScaling={false} style={{ flex: 3, color: '#336DFF', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10, marginRight: 10 }}>
                                            Witness Requests
                                        </Text>
                                        <View  style={{ flex: 1, marginRight: width/20 }}>
                                            <Image
                                                source={require('../../assets/images/Witness-Requests.png')}
                                            />
                                        </View>
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
