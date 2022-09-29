import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image, NativeModules, Platform
} from "react-native";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";
import {fetchLoanRequest, requestSignURL, storeState} from "../../stores/auth/authSlice";
import {toMoney} from "../User/Account";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {useEffect} from "react";
type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");


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
        fontSize: 15,
        marginLeft: 5,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
    formPreview: {
        marginTop: 50,
        width: '100%',
        height: height/2,
        resizeMode: 'contain'
    }
});

const LoanRequest = ({navigation, route}: NavigationProps) => {
    const { loading, loanRequest } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    // const loanRequest = route.params;
    if (!route.params) {
        // prefill route.params?.refId and route.params?.memberRefId from store
    }
    useEffect(() => {
        let isFetching = true;
        (async () => {
            await dispatch(fetchLoanRequest(route.params?.refId))
        })()
        return () => {
            isFetching = false
        }
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
    // Browser Linking to zoho sign

    const handleRedirect = (event: any) => {
        if (Platform.OS === 'ios') {
            WebBrowser.dismissBrowser();
        } else {
            removeLinkingListener();
        }

        let { hostname, path, queryParams } = Linking.parse(event.url);

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

            let url = ``

            const result = await WebBrowser.openBrowserAsync(
                url
            )

            if (Platform.OS === 'ios') {
                removeLinkingListener();
            }
        } catch(error: any) {
            console.log(error);
        }
    };

    const openAuthSessionAsync = async (url: string) => {
        try {
            let result: any = await WebBrowser.openAuthSessionAsync(
                `${url}`,
                'presta-sign://app/loan-request'
            );

            if (result.type === "dismiss") {
                const {type, error, payload}: any  = await dispatch(fetchLoanRequest(route.params?.refId))

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

    const makeSigningRequest = async () => {
      // ready to redirect to zoho
        type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
        type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
        const payloadOut: zohoSignPayloadType = {
            loanRequestRefId: route.params?.refId,
            actorRefId: route.params?.memberRefId,
            actorType:  "APPLICANT"
        }

        const {type, error, payload}: any = await dispatch(requestSignURL(payloadOut))

        if (type === 'requestSignURL/fulfilled') {
            if (!payload.success) {
                CSTM.showToast(payload.message);
            }

            if (payload.signURL) await openAuthSessionAsync(payload.signURL)
        } else {
            CSTM.showToast(error);
        }
    }

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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 10, left: 10 }}>
                            <Ionicons name="chevron-back-sharp" size={30} style={{ paddingLeft: 2 }} color="#489AAB" />
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView style={{ flex: 1, width, height: 11/12 * height, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                        <ScrollView contentContainerStyle={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 40, paddingBottom: 100 }}>
                            <Text allowFontScaling={false} style={styles.headTitle}>Your Loan ({loanRequest?.loanRequestNumber}) of KES {loanRequest ? toMoney(loanRequest.loanAmount) : 0 } has been confirmed.</Text>
                            <Text allowFontScaling={false} style={styles.subtitle}>Proceed below to sign your form</Text>
                            <Image
                                style={styles.formPreview}
                                source={{ uri: `data:image/png;base64, ${loanRequest?.pdfThumbNail}` }}
                            />
                        </ScrollView>
                    </SafeAreaView>
                    <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity disabled={loading} onPress={() => makeSigningRequest()} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                            {loading && <RotateView/>}
                            <Text allowFontScaling={false} style={styles.buttonText}>SIGN DOCUMENT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default LoanRequest;
