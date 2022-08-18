import * as React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableHighlight,
    Linking,
    StatusBar,
    TouchableOpacity, Dimensions, StatusBar as Bar
} from 'react-native';

import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {useEffect, useState} from "react";
import {store} from "../../stores/store";
import {initializeDB} from "../../stores/auth/authSlice"
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {getSecureKey} from "../../utils/secureStore";
import PagerView, {PagerViewOnPageScrollEvent} from "react-native-pager-view";
import {RotateView} from "../Auth/VerifyOTP";
import {current} from "@reduxjs/toolkit";
import {useEvent, useHandler} from "react-native-reanimated";

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
        (async () => {
            if (initializing) {
                try {
                    const [oldBoy, phone, code] = await Promise.all([
                        getSecureKey('existing'),
                        getSecureKey('phone_number_without'),
                        getSecureKey('phone_number_code')
                    ]);

                    if (oldBoy === 'true') {
                        navigation.navigate('ShowTenants', {
                            countryCode: code,
                            phoneNumber: phone
                        });
                    } else {
                        await dispatch(initializeDB())
                    }
                } catch (e: any) {
                    console.log('promise error', e)
                }
            }
        })()
        return () => {
            initializing = false;
        };
    }, [appInitialized]);

    const [currentIndex, setCurrentIndex] = useState(0)


    if (fontsLoaded) {
        return (
            <>
                {
                    loading &&
                    <View style={{position: 'absolute', top: 50, zIndex: 11, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width}}>
                        <RotateView/>
                    </View>
                }

                <View style={{position: 'absolute', top: 30, marginTop: 30, alignSelf: 'center', zIndex: 11}}>
                    <Image
                        source={require('../../assets/images/Logo.png')}
                    />
                </View>
                <View style={{position: 'absolute',width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', bottom: 0, zIndex: 11}}>
                    <View style={{ width: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ backgroundColor: currentIndex === 0 ? '#FFFFFF' : '#489AAB', height: 10, width: 10, borderRadius: 50 }} />
                        <TouchableOpacity style={{ backgroundColor: currentIndex === 1 ? '#FFFFFF' : '#489AAB', height: 10, width: 10, borderRadius: 50 }} />
                        <TouchableOpacity style={{ backgroundColor: currentIndex === 2 ? '#FFFFFF' : '#489AAB', height: 10, width: 10, borderRadius: 50 }} />
                    </View>
                    <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('GetTenants')}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text allowFontScaling={false} style={styles.buttonText}>Activate Account</Text>
                        </View>
                    </TouchableHighlight>
                </View>
                <PagerView onPageSelected={(e)=> {
                    setCurrentIndex(e.nativeEvent.position);
                }} style={{ flex: 1, paddingTop: Bar.currentHeight, position: 'relative', backgroundColor: 'rgba(244,81,30,0.02)' }} initialPage={0}>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", justifyContent: 'flex-start' }} key="1">
                        <Image
                            style={styles.landingBg}
                            source={require('../../assets/images/landingGetStarted.jpg')}
                        />
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", justifyContent: 'flex-start' }} key="2">
                        <Image
                            style={styles.landingBg}
                            source={require('../../assets/images/farm.jpg')}
                        />
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", justifyContent: 'flex-start' }} key="3">
                        <Image
                            style={styles.landingBg}
                            source={require('../../assets/images/pro.jpg')}
                        />
                    </View>
                </PagerView>
            </>

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
    container0: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F4F8',
        height: '100%',
        position: 'relative',
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
        marginBottom: 20,
        marginTop: 20,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 25,
        color: '#3c3c3c',
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 30,
    },
    linkText: {
        fontSize: 18,
        color: '#3D889A',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height + (StatusBar.currentHeight ? StatusBar.currentHeight : 0),
        width
    },
    container: {
        flex: 1
    },
    landingLogo: {
        marginTop: 20,
    },
    artwork: {
        marginTop: 10
    },
    subTitleText: {
        marginTop: height/3,
        fontSize: 13,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#ffffff',
        fontFamily: 'Poppins_400Regular',
        alignSelf: 'flex-start'
    },
});
