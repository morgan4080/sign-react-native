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
import {AntDesign, Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanProducts, storeState} from "../../stores/auth/authSlice";
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

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function LoanProducts ({ navigation }: NavigationProps) {
    const { loading, isLoggedIn, loanProducts } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        if (!isLoggedIn) {
            if (isMounted) navigation.navigate('Login')
        } else {
            dispatch(fetchLoanProducts()).then((response: any) => {
                if (response.type === 'fetchLoanProducts/rejected' && response.error) {
                    // console.log("fetch loan products error")
                    return
                }
                if (response.type === 'fetchLoanProducts/fulfilled') {
                    // console.log("fetch  loan products success")
                    return
                }
            }).catch((e: any) => {
                // console.log("fetch loan requests error", e)
            })
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
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: '20%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: '10%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width,
                            height: 3/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                            <AntDesign name="gift" size={70} color="#323492" />
                            <Text style={{ textAlign: 'left', color: '#323492', fontFamily: 'Poppins_600SemiBold', fontSize: 22, marginTop: 30 }}>Select Loan Product</Text>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 9/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50 }}>
                                {loanProducts &&
                                    loanProducts.map((product, index) => (
                                        <TouchableOpacity key={index} style={styles.tile} onPress={() => navigation.navigate('LoanProduct', { loanProduct: product })}>
                                            <Text style={{color: '#ADADAD', fontFamily: 'Poppins_400Regular'}}>{ product.name }</Text>
                                            <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD"/>
                                        </TouchableOpacity>
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
        borderRadius: 20,
        marginTop: 20,
        height: 74,
        paddingHorizontal: 20,
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
