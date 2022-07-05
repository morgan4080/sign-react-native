import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import { Circle as ProgressCircle } from 'react-native-progress';

type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");

export const toMoney = (money: string): string => {
    return `${parseFloat(`${money}`).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${parseFloat(`${money}`).toFixed(2).split('.')[1]}`
};

export default function LoanRequests ({ navigation }: NavigationProps) {
    const { loading, user, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();
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
                    <View style={{ position: 'absolute', left: -100, top: '25%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                    <View style={{ position: 'absolute', right: -80, top: '32%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                    <View style={styles.userPicBtn}>
                        <MaterialCommunityIcons name="account" color="#FFFFFF" size={100}/>
                    </View>
                    <Text allowFontScaling={false} style={styles.titleText}>{ `${ member?.fullName }` }</Text>
                    <Text allowFontScaling={false} style={styles.subTitleText}>{ `Member NO: ${member?.memberNumber}` }</Text>
                    <Text allowFontScaling={false} style={styles.organisationText}>{ `${user?.companyName}` }</Text>
                    <SafeAreaView style={{ flex: 1, width: width-20, height: height/2 }}>
                        <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'center', paddingBottom: 50 }}>
                            <View style={{display: 'flex', width: width-50, borderRadius: 15, backgroundColor: '#489AAB', paddingHorizontal: 25, paddingVertical: 10, marginTop: 15}}>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>Available Balance</Text>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_800ExtraBold', color: '#ffffff', fontSize: 22 }}>KES {member ? toMoney(`${member.availableAmount}`) : ``}</Text>
                                <View style={{ backgroundColor: '#FFFFFF', width: '100%', height: 1 }}/>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20}}>
                                    <View>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>ACTIVE LOANS</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 13 }}>2</Text>
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>SHARES AMOUNT</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 13 }}>KES {toMoney('13000')}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{display: 'flex', width: width-50, borderRadius: 15, backgroundColor: '#489AAB', paddingHorizontal: 25, paddingVertical: 10, marginTop: 15}}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20}}>
                                    <View>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>BALANCE</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                            <Ionicons name="ios-wallet-outline" size={40} color="#ffffff" />
                                            <View style={{paddingLeft: 10}}>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 13 }}>KES {member ? toMoney(`${member.availableAmount}`) : ``}</Text>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#ffffff', fontSize: 10, maxWidth: 80 }}>Available for guarantee</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>TOTAL GUARANTEED</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2   }}>
                                            <Ionicons name="ios-people-circle-outline" size={40} color="#ffffff" />
                                            <View style={{paddingLeft: 10}}>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 13 }}>KES {member ? toMoney(`${member.committedAmount}`) : ``}</Text>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#ffffff', fontSize: 10, maxWidth: 80 }}>Total active loans guaranteed</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 20}}>
                                    <View>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#ffffff', fontSize: 10 }}>LOAN HISTORY</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 2  }}>
                                            <MaterialCommunityIcons name="credit-card-clock-outline" size={40} color="#ffffff" />
                                            <View style={{paddingLeft: 10}}>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 13 }}>13</Text>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#ffffff', fontSize: 10 }}>Total loans acquired</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={{display: 'flex', width: '100%', borderRadius: 15, backgroundColor: '#336DFF', paddingHorizontal: 20, paddingVertical: 25, marginTop: 15, marginBottom: 50}}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#ffffff', fontSize: 10 }}>LOAN PERFORMANCE</Text>
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <View>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_800ExtraBold', color: '#ffffff', fontSize: 18, marginBottom: 10, marginTop: 10 }}>Performing</Text>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#ffffff', fontSize: 10, marginBottom: 15 }}>CREDIT RANK:</Text>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#ffffff', fontSize: 10, marginBottom: 15 }}>REPAYMENT SCORE:</Text>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#ffffff', fontSize: 10, marginBottom: 15 }}>REPAYMENT FREQ:</Text>
                                            <TouchableOpacity onPress={() => navigation.navigate('History')} style={{backgroundColor: '#27627E', borderRadius: 30, height: 32, display: 'flex', justifyContent: 'center', elevation: 3}}>
                                                <Text allowFontScaling={false} style={{ textAlign: 'center', fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#ffffff' }}>HISTORY</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 10, width: '50%' }}>
                                            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#000000', fontSize: 10 }}>Performance scale</Text>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#4AB1C3', fontSize: 10 }}>12%</Text>
                                            </View>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#607D8B', fontSize: 7 }}>Statistics information</Text>
                                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                                                <ProgressCircle size={100} thickness={5} showsText={true} unfilledColor='#4AB1C3' progress={0.12} color='#489AAB' borderColor='transparent'/>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>

                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
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
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        position: "relative"
    },
    userPicBtn: {
        marginTop: 40,
        width: 130,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderColor: '#489AAB',
        borderWidth: 2,
        borderRadius: 100,
        backgroundColor: '#EDEDED',
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_700Bold',
        marginTop: 20,
    },
    subTitleText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_400Regular',
    },
    organisationText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
    },
});
