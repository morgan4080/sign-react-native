import {
    Animated,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet, Text, TouchableHighlight, TouchableOpacity,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";

import {useDispatch, useSelector} from "react-redux";
import {fetchWitnessRequests, storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useEffect, useRef, useState} from "react";
import {toMoney} from "../User/Account";
import GuarantorTiles from "../User/Components/GuarantorTiles";
import {store} from "../../stores/store";
import {RotateView} from "../Auth/VerifyOTP";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function WitnessRequests ({ navigation }: NavigationProps) {
    const { loading, user, witnessRequests, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let fetching = true;

        if (fetching) {
            (async () => {
                await dispatch(fetchWitnessRequests({ memberRefId: member?.refId}))
            })()
        }
        return () => {
            fetching = false;
        }
    }, []);

    type accountHistoryType = {id: number, executor: string, subject: string, event: string, time: string}

    const [pressed, setPressed] = useState<boolean>(false)
    const [request, setRequest] = useState<accountHistoryType | null>()

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const accountHistory: accountHistoryType[] = witnessRequests.map((request, i) => {

        return {
            id: i,
            executor: request.applicant.firstName + " " + request.applicant.lastName,
            subject: toMoney(`${request.loanRequest.amount}`),
            event: 'requested you to witness their loan ' + request.loanRequest.loanNumber +  ' of Kshs',
            time: request.loanDate
        };
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                useNativeDriver: true,
                toValue: 1,
                duration: 1000
            }
        ).start();
    }, [fadeAnim])

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', right: -30, top: -10, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <SafeAreaView style={{ flex: 1, backgroundColor: accountHistory.length === 0 ? 'rgba(50,52,146,0)' : '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height }}>

                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50  }}>
                                {
                                    accountHistory && accountHistory.map((history, i) => (
                                        <GuarantorTiles pressed={pressed} setPressed={setPressed} setRequest={setRequest}  key={i} guarantor={history} />
                                    ))
                                }
                                {accountHistory.length === 0 &&
                                    <View style={{width: '100%', height: height/2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <MaterialCommunityIcons name="delete-empty-outline" size={100} color="#CCCCCC" />
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 16 }}>Whooops!</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12 }}>No Data</Text>
                                    </View>
                                }
                            </ScrollView>

                        </SafeAreaView>
                    </View>
                </View>
                { pressed &&
                    <TouchableHighlight onPress={() => {
                        setPressed(false);
                        setRequest(null);
                    }} style={{ position: 'absolute', height, width, backgroundColor: 'rgba(0,0,0,0.58)' }}>
                        <Animated.View style={{ opacity: fadeAnim, position: 'absolute', bottom: 0, backgroundColor: '#ffffff', borderTopRightRadius: 25, borderTopLeftRadius: 25, shadowColor: 'rgba(0,0,0, .9)', shadowOffset: { height: 1, width: 1 }, shadowOpacity: 1, shadowRadius: 1, elevation: 5, width, height: height/1.5, display: 'flex', alignItems: 'center' }}>
                            <View style={{width: width/5, height: 5, backgroundColor: '#CCCCCC', borderRadius: 50, marginTop: 10}}></View>
                            <View style={styles.userPicBtn}>
                                <MaterialCommunityIcons name="account" color="#FFFFFF" size={50}/>
                            </View>
                            <View>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#489AAB', fontSize: 20, textAlign: 'center', marginTop: (height/1.5)/30 }}>{request?.executor}</Text>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#489AAB', fontSize: 12, textAlign: 'center' }}>{ `${user?.companyName}` }</Text>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                                    Kindly accept my request to add you as a witness  for this Loan Product valued :
                                </Text>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#489AAB', fontSize: 20, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                                    KES { request?.subject }
                                </Text>
                            </View>
                            <View style={{height: (height/6), display: 'flex', flexDirection: 'row', marginTop:  (height/1.5)/20 }}>
                                <TouchableOpacity onPress={() => navigation.navigate('WitnessStatus', { accepted: true, witness: request, loanRequest: witnessRequests.find((rq, i) => i === request?.id) })}>
                                    <MaterialIcons name="check-circle" size={80} color="#78E49D" />
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', textAlign: 'center', color: '#78E49D'}}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigation.navigate('WitnessStatus', { accepted: false, witness: request, loanRequest: witnessRequests.find((rq, i) => i === request?.id) })}>
                                    <MaterialIcons name="cancel" size={80} color="#FF927A" />
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', textAlign: 'center', color: '#FF927A'}}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableHighlight>
                }
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: height/3, width }}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    userPicBtn: {
        marginTop: 20,
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderColor: '#489AAB',
        borderWidth: 1,
        borderRadius: 100,
        backgroundColor: '#EDEDED',
        position: 'relative'
    },
});
