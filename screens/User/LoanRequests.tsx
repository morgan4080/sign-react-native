import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text, NativeModules, Animated, Easing
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequest, fetchLoanRequests, requestSignURL, storeState} from "../../stores/auth/authSlice";
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
import {useCallback, useEffect, useRef, useState} from "react";
import LoanRequest from "./Components/LoanRequest";
import {RotateView} from "../Auth/VerifyOTP";
import BottomSheet, {BottomSheetRefProps, MAX_TRANSLATE_Y} from "../../components/BottomSheet";
import {Bar as ProgressBar} from "react-native-progress";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";
import {getSecureKey} from "../../utils/secureStore";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

interface GuarantorData {
    refId: string,
    memberNumber: string,
    memberRefId: string,
    firstName: string,
    lastName: string,
    dateAccepted?: string,
    isAccepted?: string,
    dateSigned?: string,
    isSigned?: boolean,
    isApproved?: boolean,
    isActive: boolean,
    committedAmount: number,
    availableAmount: number,
    totalDeposits: number
}
interface LoanRequestData {
    "refId": string,
    "loanDate": string,
    "loanRequestNumber": string,
    "loanProductName": string,
    "loanProductRefId": string,
    "loanAmount": number,
    "guarantorsRequired": number,
    "guarantorCount": number,
    "status": string,
    "signingStatus": string,
    "acceptanceStatus": string,
    "applicationStatus": string,
    "memberRefId": string,
    "memberNumber": string,
    "memberFirstName": string,
    "memberLastName": string,
    "phoneNumber": string,
    "loanRequestProgress": number,
    "totalDeposits": number,
    "applicantSigned": boolean,
    "witnessName": string,
    "guarantorList": GuarantorData[],
}

export default function LoanRequests ({ navigation }: NavigationProps) {
    const { loading, user, member, loanRequests } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const [loan, setLoan] = useState<LoanRequestData>();
    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        (async () => {
            await dispatch(fetchLoanRequests(member?.refId as string));
        })()
    }, []);

    const CSTM = NativeModules.CSTM;

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const ref = useRef<BottomSheetRefProps>(null);

    const onPress = useCallback((ctx: string) => {
        const isActive = ref?.current?.isActive();
        if (isActive) {
            ref?.current?.scrollTo(0);
        } else {
            ref?.current?.scrollTo(MAX_TRANSLATE_Y);
        }
    }, []);

    const computeProgress = (item: GuarantorData) => {
        let progress: number = 0.0
        if (item.isAccepted) {
            progress+=0.25
        }
        if (item.isSigned) {
            progress+=0.25
        }
        if (item.isApproved) {
            progress+=0.5
        }
        return progress
    }

    const openAuthSessionAsync = async (url: string) => {
        try {
            let result: any = await WebBrowser.openAuthSessionAsync(
                `${url}`,
                'presta-sign://app/loan-request'
            );

            if (result.type === "dismiss") {
                const {type, error, payload}: any  = await dispatch(fetchLoanRequest(loan?.refId as string))

                if (type === 'fetchLoanRequest/fulfilled') {
                    // if status is signed
                    // navigate to success page else failed page/ with retry
                    navigation.navigate('SignStatus', {
                        ...payload,
                        applicant: true
                    });
                }
            }

        } catch (error) {
            console.log(error);
        }
    };

    const signDocument = async () => {
        type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
        type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
        const payloadOut: zohoSignPayloadType = {
            loanRequestRefId: loan?.refId as string,
            actorRefId: loan?.memberRefId as string,
            actorType:  "APPLICANT"
        }

        const {type, error, payload}: any = await dispatch(requestSignURL(payloadOut))

        if (type === 'requestSignURL/fulfilled') {
            console.log(type, payload);
            if (!payload.success) {
                CSTM.showToast(payload.message);
            }

            if (payload.signURL) await openAuthSessionAsync(payload.signURL)
        } else {
            console.log(type, error);
            CSTM.showToast(error.message);
        }

        console.log("zohoSignPayloadType", payloadOut);
    }

    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                rotateAnim,
                {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, [rotateAnim])

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })

    if (fontsLoaded && !loading) {
        return (
            <GestureHandlerRootView style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            position: 'relative',
                            width,
                            height: 1/12 * height
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={{ marginRight: 20, marginLeft: 15 }}>
                                <AntDesign name="arrowleft" size={24} color="#489AAB" />
                            </TouchableOpacity>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_700Bold', fontSize: 18 }}>Your Loan Requests</Text>
                            { loading ?
                                <Animated.View
                                    style={{ position: 'absolute', right: 20, top: 20, transform: [{rotate: spin}] }}>
                                    <TouchableOpacity onPress={() => dispatch(fetchLoanRequest(loan?.refId as string))}>
                                        <Ionicons name="reload" size={18} color="#489AAB"/>
                                    </TouchableOpacity>
                                </Animated.View>
                                :
                                <View
                                    style={{ position: 'absolute', right: 20, top: 20 }}>
                                    <TouchableOpacity onPress={() => dispatch(fetchLoanRequest(loan?.refId as string))}>
                                        <Ionicons name="reload" size={18} color="#489AAB"/>
                                    </TouchableOpacity>
                                </View>
                            }
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 11/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50 }}>
                                {
                                    loanRequests && loanRequests.map((loan, i) => (
                                        <LoanRequest key={i} loan={loan} setLoan={setLoan} onPress={onPress}/>
                                    ))
                                }
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
                <BottomSheet ref={ref}>
                    <View style={styles.guarantorContainer}>
                        <View style={{marginBottom: 10}}>
                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#4f4f4f', fontSize: 16 }}>{loan?.loanRequestProgress}% COMPLETE</Text>
                        </View>
                        <View collapsable={false}>
                            {loan && loan.guarantorList.map((item, key) => (
                                <View key={key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <View style={{width: width/3}}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#727272', fontSize: 12 }}>{`${item.firstName} ${item.lastName}`}</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 10 }}>{ item.committedAmount } Ksh</Text>
                                    </View>
                                    <View style={{ position: 'relative' }}>
                                        <View style={{position: 'absolute', left: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                            <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isAccepted ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6 }}>Accepted</Text>
                                        </View>
                                        <View style={{position: 'absolute', right: 80, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                            <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isSigned ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6 }}>Signed</Text>
                                        </View>
                                        <View style={{position: 'absolute', right: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                                            <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isApproved ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6 }}>Approved</Text>
                                        </View>
                                        <ProgressBar progress={computeProgress(item)} color='#0bb962' width={width/2.1}/>
                                    </View>
                                </View>
                            ))}
                        </View>
                        {loan && !loan.applicantSigned &&
                            <View style={{marginTop: 15}}>
                                <Text allowFontScaling={false}
                                      style={{fontFamily: 'Poppins_500Medium', color: '#9A9A9AFF', fontSize: 12}}>
                                    You are yet to sign the applicant form. Click on sign below to begin.
                                </Text>
                                <TouchableOpacity style={{marginTop: 5}} onPress={() => signDocument()}>
                                    <Text allowFontScaling={false} style={{fontFamily: 'Poppins_500Medium', color: '#489AAB', fontSize: 12, textDecorationLine: 'underline'}}>
                                        Sign Applicant Form
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </BottomSheet>
            </GestureHandlerRootView>
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
        backgroundColor: '#489AAB',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    guarantorContainer: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 20
    }
});
