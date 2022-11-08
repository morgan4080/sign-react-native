import {
    Dimensions,
    Platform,
    SafeAreaView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    NativeModules,
    SectionList
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {AntDesign, MaterialCommunityIcons} from "@expo/vector-icons";
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
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import LoanRequest from "./Components/LoanRequest";
import {RotateView} from "../Auth/VerifyOTP";
import {Bar as ProgressBar} from "react-native-progress";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import * as WebBrowser from "expo-web-browser";
import {toMoney} from "./Account";
import BottomSheet, { BottomSheetBackdrop, BottomSheetSectionList } from "@gorhom/bottom-sheet";

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
    const { loading, member, loanRequests } = useSelector((state: { auth: storeState }) => state.auth);
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

    const sheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

    // callbacks
    const handleSheetChange = useCallback((index: any) => {
        if (index === -1) {
            setBSActive(false);
        }
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

    // disappearsOnIndex={1}
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={1}
            />
        ),
        []
    );

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

    const Item = ({item, section} : {item: any, section: any}) => {
        const [expanded, setExpanded] = useState(false);
        if (section.id === 1) {
            return (
                <View>
                        <View style={{marginBottom: 10}}>
                            <Text style={{ fontFamily: 'Poppins_500Medium', color: '#575757', fontSize: 17, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                {loan?.loanProductName}:  <Text allowFontScaling={false} style={{color: '#575757'}}>{ loan ? toMoney(`${loan?.loanAmount}`) : '0.00' }</Text>
                            </Text>
                            <Text allowFontScaling={false} style={{fontFamily: 'Poppins_500Medium', color: '#9A9A9A', fontSize: 10}}>{loan?.loanRequestProgress}% DONE</Text>
                        </View>
                        {loan && !loan.applicantSigned &&
                            <View style={{marginVertical: 10}}>
                                <Text allowFontScaling={false}
                                      style={{fontFamily: 'Poppins_500Medium', color: '#9A9A9A', fontSize: 12}}>
                                    You are yet to sign the applicant form. Click on sign below to begin.
                                </Text>
                                <TouchableOpacity style={{marginVertical: 20, backgroundColor: '#489AAB', alignSelf: 'flex-start', borderRadius: 15, elevation: 5}} onPress={() => signDocument()}>
                                    <Text allowFontScaling={false} style={{fontFamily: 'Poppins_500Medium', color: '#FFFFFF', fontSize: 12, paddingHorizontal: 10}}>
                                        Sign Applicant Form
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
            )
        } else if (section.id === 2) {
            return (
                <View>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center'}}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{width: width/3}}>
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#727272', fontSize: 12 }}>{`${item.firstName} ${item.lastName}`}</Text>
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
                        { !expanded ?
                            <TouchableOpacity style={{elevation: 5}} onPress={() => setExpanded(!expanded)}>
                                <AntDesign name="caretright" size={12} color="#64748B" style={{padding: 3}}/>
                            </TouchableOpacity>

                            :

                            <TouchableOpacity style={{elevation: 5}} onPress={() => setExpanded(!expanded)}>
                                <AntDesign name="caretdown" size={12} color="#64748B" style={{padding: 3}} />
                            </TouchableOpacity>

                        }
                    </View>
                    {expanded && <View style={{marginVertical: 5}}>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Committed Amount: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{ toMoney(`${item.committedAmount}`) } Ksh</Text>
                        </View>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Guarantorship
                                Status: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                        </View>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Signature
                                Status: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{item.isSigned ? 'Signed' : 'Pending'}</Text>
                        </View>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Approval
                                Status: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{item.isApproved ? 'Approved' : 'Pending'}</Text>
                        </View>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Acceptance
                                Status: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{item.isAccepted ? 'Accepted' : 'Pending'}</Text>
                        </View>
                        <View style={{paddingVertical: 2, display: 'flex', flexDirection: 'row'}}>
                            <Text allowFontScaling={false}
                                  style={{flex: 0.5, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#727272'}}>Date
                                Accepted: </Text>
                            <Text allowFontScaling={false} style={{
                                flex: 0.5,
                                fontFamily: 'Poppins_300Light',
                                color: '#9A9A9A',
                                fontSize: 12
                            }}>{item.dateAccepted}</Text>
                        </View>

                        {!item.isAccepted && <TouchableOpacity style={{
                            marginVertical: 20,
                            backgroundColor: '#489AAB',
                            alignSelf: 'flex-start',
                            borderRadius: 15,
                            elevation: 5
                        }} onPress={() => navigation.navigate('ReplaceActor', {
                            item,
                            loan
                        })}>
                            <Text allowFontScaling={false} style={{
                                fontFamily: 'Poppins_500Medium',
                                color: '#FFFFFF',
                                fontSize: 12,
                                paddingHorizontal: 10
                            }}>
                                Replace Guarantor
                            </Text>
                        </TouchableOpacity>}
                    </View>}
                </View>
            )
        } else {
            return (<></>)
        }
    }

    const [bSActive, setBSActive] = useState(false);

    const onPress = () => {
        if (!bSActive) {
            handleSnapPress(2);
        } else {
            handleClosePress();
        }
    }

    console.log(loan?.guarantorList);

    if (fontsLoaded) {
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
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 11/12 * height }}>
                            <SectionList
                                sections={loanRequests && loanRequests.length > 0 ? [
                                    {
                                        title: '',
                                        data: loanRequests
                                    }
                                ]: []}
                                progressViewOffset={50}
                                refreshing={loading}
                                onRefresh={() => dispatch(fetchLoanRequests(member?.refId as string))}
                                keyExtractor={(index) => index + Math.random().toString(12).substring(0)}
                                renderItem={({ item }) => <LoanRequest loan={item} setLoan={setLoan} onPress={onPress}/>}
                                renderSectionHeader={() => (
                                    <></>
                                )}
                                ListEmptyComponent={
                                    <View style={{width: '100%', height: height/3, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <MaterialCommunityIcons name="delete-empty-outline" size={100} color="#CCCCCC" />
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 16 }}>Whooops!</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12 }}>No Data</Text>
                                    </View>
                                }
                            />
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}
                    backdropComponent={renderBackdrop}
                >

                    <BottomSheetSectionList
                        style={styles.guarantorContainer}
                        refreshing={loading}
                        sections={[
                            {
                                id: 1,
                                title: "",
                                data: loan ? loan.guarantorList : []
                            },
                            {
                                id: 2,
                                title: "GUARANTORS' STATUS",
                                data: loan ? loan.guarantorList : []
                            }
                        ]}
                        keyExtractor={(item, index) => item.refId + index}
                        renderItem={({ item, section }) => (<Item item={item} section={section} />)}
                        renderSectionHeader={({ section: { title, data } }) => (
                            <Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Poppins_500Medium', marginBottom: 10, color: '#489AABFF' }}>{title}</Text>
                        )}
                        stickySectionHeadersEnabled={true}
                        ListFooterComponent={<View style={{height: 75}} />}
                    />
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
        paddingHorizontal: 20
    }
});
