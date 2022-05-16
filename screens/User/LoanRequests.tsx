import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as React from "react";
import {Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequests, storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import { Pie as ProgressPie, CircleSnail as ProgressCircleSnail  } from 'react-native-progress';
import {useEffect} from "react";
import LoanRequest from "./Components/LoanRequest";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function LoanRequests ({ navigation }: NavigationProps) {
    const { isLoggedIn, loading, user, member, loanRequests } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        if (!isLoggedIn) {
            if (isMounted) navigation.navigate('Login')
        } else {
            if (user) {
                dispatch(fetchLoanRequests(member?.refId as string)).then((response: any) => {
                    if (response.type === 'fetchLoanRequests/rejected' && response.error) {
                        return
                    }
                    if (response.type === 'fetchLoanRequests/fulfilled') {
                        return
                    }
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

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width,
                            height: 1/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 11/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50 }}>
                                <Text style={{ textAlign: 'left', color: '#323492', fontFamily: 'Poppins_700Bold', fontSize: 22, marginTop: 30 }}>Your Loan Requests</Text>
                                {
                                    loanRequests && loanRequests.map((loan, i) => (
                                        <LoanRequest key={i} loan={loan}  />
                                    ))
                                }
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <ProgressCircleSnail size={50} color={['green', 'blue']} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        marginTop: 20,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 2, // Android
    },
    progress: {
        backgroundColor: '#323492',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    }
});
