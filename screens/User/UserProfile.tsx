import * as React from 'react';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar as Bar,
    Dimensions,
    Platform
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import AppLoading from 'expo-app-loading';
import t from 'tcomb-form-native';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef} from "react";
import _ from "lodash";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {storeState, setLoading, logoutUser} from "../../stores/auth/authSlice";
import { checkForJWT, authenticate } from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import Colors from "../../constants/Colors";
import {MaterialCommunityIcons} from "@expo/vector-icons";

// Types

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

const greeting = () => {
    return ["Morning", "Afternoon", "Evening"].reduce((previousValue: string, currentValue: string, currentIndex: number, greetings: string[]): string => {
        let actualTime: string = new Date().toTimeString().split(" ")[0].split(":")[0]
        if (parseInt(actualTime) > 0) {
            if (parseInt(actualTime) > 0 && parseInt(actualTime) < 12) {
                return greetings[0]
            }
            if (parseInt(actualTime) > 12 && parseInt(actualTime) < 15) {
                return greetings[1]
            }
            if (parseInt(actualTime) > 15) {
                return greetings[2]
            }
        }

        return ''
    })
}

export default function UserProfile({ navigation }: NavigationProps) {
    const { isLoggedIn, loading, user } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        if (!isLoggedIn) {
            if (isMounted) navigation.navigate('Login')
        }
        return () => { isMounted = false };
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

    if (fontsLoaded && !loading) {
        return (
            <SafeAreaView  style={{ flex: 1, paddingTop: Bar.currentHeight,backgroundColor: 'rgba(0,0,0,0.51)' }}>
                <ScrollView snapToInterval={height} decelerationRate="fast" contentContainerStyle={styles.container}>
                    <Image
                        style={styles.landingBg}
                        source={require('../../assets/images/profile-bg.png')}
                    />
                    <View style={{ display: 'flex', justifyContent: 'flex-end', width, height, overflow: "hidden" }}>
                        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width, height: height/2, backgroundColor: 'rgba(0,0,0,0.51)', overflow: "hidden", position: 'relative' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ backgroundColor: '#CCCCCC', borderRadius: 50, position: 'absolute', top: 20, left: 20 }}>
                                <MaterialCommunityIcons name="account" color="#FFFFFF" size={40}/>
                            </TouchableOpacity>
                            <Text style={styles.titleText}>{ `Good ${ greeting() } ${ user?.firstName }` }</Text>
                            <Text style={styles.subTitleText}>{ `Your member NO: T450SDTR` }</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.51)' }}>
                            <View style={{ display: 'flex', alignItems: 'center', width, height: height/2, overflow: "hidden", backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>

                            </View>
                        </View>
                    </View>
                </ScrollView>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </SafeAreaView>
        )
    } else {
        return (
            <AppLoading/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    subTitleText: {
        fontSize: 15,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
    landingBg: {
        top: 0,
        position: 'absolute',
    },
    titleText: {
        fontSize: 32,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        paddingTop: 10,
        marginHorizontal: 10,
    },
});
