import {Dimensions, Platform, View, Text, StyleSheet, StatusBar as Bar, TouchableOpacity, SafeAreaView, ScrollView} from "react-native";
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
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {storeState, submitLoanRequest} from "../../stores/auth/authSlice";
import {Ionicons} from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from 'expo-linking';
import {RotateView} from "../Auth/VerifyOTP";

type NavigationProps = NativeStackScreenProps<any>
const { width, height } = Dimensions.get("window");

export default function LoanConfirmation({navigation, route}: NavigationProps) {
    const { loading, user, member } = useSelector((state: { auth: storeState }) => state.auth);
    // console.log("route params", route.params)
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

    // opening android contacts

    const openPhoneContacts = () => {
        Linking.openURL('content://com.android.contacts/data/callables')
    }

    // Browser Linking to zoho sign

    const redirectUrl = Linking.createURL('e_guarantor_ship/imarisha', {
        queryParams: { hello: 'world' },
    });

    const handleRedirect = (event: any) => {
        if (Platform.OS === 'ios') {
            WebBrowser.dismissBrowser();
        } else {
            removeLinkingListener();
        }

        let { hostname, path, queryParams } = Linking.parse(event.url);

        console.log('handleRedirect', hostname, path, queryParams)
    };

    const addLinkingListener = () => {
        Linking.addEventListener("url", handleRedirect);
    };

    const removeLinkingListener = () => {
        Linking.removeEventListener("url", handleRedirect);
    };

    const openBrowserAsync = async () => {
        try {
            addLinkingListener()

            let url = `https://expo.dev?linkingUri=${redirectUrl}`

            const result = await WebBrowser.openBrowserAsync(
                url
            )

            if (Platform.OS === 'ios') {
                removeLinkingListener();
            }

            console.log('openBrowserAsync', result)
        } catch(error: any) {
            console.log(error);
        }
    };

    const openAuthSessionAsync = async () => {
        try {
            let result: any = await WebBrowser.openAuthSessionAsync(
                `https://expo.dev`,
                redirectUrl
            );
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
           console.log("openAuthSessionAsync", result, redirectData)
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };

    const makeLoanRequest = async () => {
        let code = route.params?.category.options.filter((op: any) => op.selected)[0].options.filter((o: any) => o.selected)[0];
        const { witnessRefId, witnessMemberNo } = route.params?.witnesses.reduce((acc: any, current: any) => {
            acc = {
                witnessRefId: current.memberRefId,
                witnessMemberNo: current.memberNumber
            };
            return acc;
        }, {});

        const guarantorList = route.params?.guarantors.reduce((acc: {memberNumber: string, memberRefId: string}[], current: { contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string }) => {
            acc.push({
                memberNumber: current.memberNumber,
                memberRefId: current.memberRefId
            });
            return acc;
        }, []);

        const payload = {
            "details": {
                "loan-purpose": {
                    "type": "TEXT",
                    "value": code.code
                }
            },
            "loanProductName": route.params?.loanProduct.name,
            "loanProductRefId": route.params?.loanProduct.refId,
            "selfCommitment": 0,
            "loanAmount": route.params?.loanDetails.desiredAmount,
            "memberRefId": member?.refId,
            "memberNumber": member?.memberNumber,
            "phoneNumber": member?.phoneNumber,
            "witnessRefId": witnessRefId,
            "witnessMemberNo": witnessMemberNo,
            "guarantorList": guarantorList
        };

        // console.log("loan request payload", payload);

        try {
            const response = await dispatch(submitLoanRequest(payload));
            if (response.type === 'submitLoanRequest/fulfilled') {
                navigation.navigate('LoanRequest', response.payload)
            } else {
                console.log('loan request error', response)
            }
        } catch (error: any) {
            console.log('loan request error', error)
        }
    }

    if (fontsLoaded) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center', position: 'relative'}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width,
                            height: 1/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                        </View>
                        <SafeAreaView style={{ flex: 1, width, height: 11/12 * height, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
                                <Text allowFontScaling={false} style={styles.headTitle}>Confirm</Text>
                                <Text allowFontScaling={false} style={styles.subtitle}>Loan Request to <Text allowFontScaling={false} style={{color: '#489AAB', textDecorationStyle: 'dotted', textDecorationLine: 'underline'}}>{ `${user?.companyName}` }</Text></Text>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Loan Type:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanProduct.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Months:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredPeriod}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Amount:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredAmount}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Guarantors:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.guarantors.length}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Witness:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.witnesses.length}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%' }}>Category:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{route.params?.category.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%' }}>Purpose:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{
                                            route.params?.category.options.map((op: any) => {
                                                if (op.selected) {
                                                    let subs = op.options.map((o: any) => {
                                                        if (o.selected) {
                                                            return ` ${o.name}`
                                                        }
                                                    }).toString()
                                                    let message = `${op.name + ':' + subs}`
                                                    return message
                                                }
                                            })
                                        }</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                        <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={loading} onPress={() => makeLoanRequest()} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                {loading && <RotateView/>}
                                <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        position: 'relative'
    },
    headTitle: {
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        marginTop: 22,
    },
    subtitle: {
        textAlign: 'center',
        color: '#747474',
        fontFamily: 'Poppins_400Regular',
        fontSize: 15,
        marginTop: 2,
    },
    buttonText: {
        fontSize: 18,
        marginLeft: 5,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    }
})
