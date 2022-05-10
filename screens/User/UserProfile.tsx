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
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {storeState, setLoading, fetchMember, logoutUser} from "../../stores/auth/authSlice";
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
            if (parseInt(actualTime) >= 0 && parseInt(actualTime) < 12) {
                return greetings[0]
            }
            if (parseInt(actualTime) >= 12 && parseInt(actualTime) < 15) {
                return greetings[1]
            }
            if (parseInt(actualTime) >= 15) {
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
        if (!isLoggedIn) {
            if (isMounted) navigation.navigate('Login')
        } else {
            if (user) {
                dispatch(fetchMember(user?.phoneNumber)).then((response: any) => {
                    if (response.type === 'fetchMember/rejected' && response.error) {
                        console.log("fetch member error", response)
                        return
                    }
                    if (response.type === 'fetchMember/fulfilled') {
                        console.log("fetch member success", response)
                        return
                    }
                }).catch((e: any) => {
                    console.log("fetchMember error", e)
                })
            }
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
            <View style={{ flex: 1, paddingTop: Bar.currentHeight, position: 'relative' }}>
                <View style={styles.container}>
                    <Image
                        style={styles.landingBg}
                        source={require('../../assets/images/profile-bg.png')}
                    />
                    <View style={{ flex: 1, alignItems: 'center', }}>
                        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width, height: height/2, position: 'relative' }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ backgroundColor: '#CCCCCC', borderRadius: 100, position: 'absolute', top: 10, left: 10 }}>
                                <MaterialCommunityIcons style={{paddingHorizontal: 5, paddingVertical: 5}} name="account" color="#FFFFFF" size={30}/>
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.titleText}>{ `Good ${ greeting() } ${ user?.firstName }` }</Text>
                                <Text style={styles.subTitleText}>{ `Your member NO: ${member?.memberNumber}` }</Text>
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: height/2 }}>
                            <View style={{ position: 'absolute', left: width/4, zIndex: 2 }}>
                                <TouchableOpacity style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginTop: -30 }}>
                                    <Text style={styles.buttonText}>View balances</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'center' }}>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginRight: 10, borderRadius: 25, backgroundColor: 'rgba(51,109,255,0.8)'  }}>
                                        <Image
                                            source={require('../../assets/images/apply-loan.png')}
                                        />
                                        <Text style={{ color: '#ffffff', fontFamily: 'Poppins_600SemiBold', maxWidth: 100 }}>Apply For A Loan</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/Guarantorship-Requests.png')}
                                        />
                                        <Text style={{ color: '#323492', fontFamily: 'Poppins_600SemiBold', maxWidth: 100, marginLeft: 10 }}>Guarantorship Requests</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/favourite-guarantors.png')}
                                        />
                                        <Text style={{ color: '#323492', fontFamily: 'Poppins_600SemiBold', maxWidth: 100, marginLeft: 10 }}>Favorite Guarantors</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25 }}>
                                        <Image
                                            source={require('../../assets/images/Guarantorship-Requests.png')}
                                        />
                                        <Text style={{ color: '#323492', fontFamily: 'Poppins_600SemiBold', maxWidth: 100, marginLeft: 10 }}>Witness Requests</Text>
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
        fontSize: 18,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_400Regular',
        elevation: 1
    },
    landingBg: {
        top: 0,
        position: 'absolute',
    },
    titleText: {
        fontSize: 30,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        elevation: 1
    },
    buttonText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
