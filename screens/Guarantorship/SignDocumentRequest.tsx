import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Dimensions,
    Image,
    NativeModules,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {RotateView} from "../Auth/VerifyOTP";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequest, requestSignURL, storeState} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {toMoney} from "../User/Account";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");
const SignDocumentRequest = ({ navigation, route }: NavigationProps) => {
    // fetchLoanRequest
    const { loading, loanRequest, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const CSTM = NativeModules.CSTM;

    useEffect(() => {
        let fetching = true;

        if (fetching) {
            (async () => {
                await dispatch(fetchLoanRequest(route.params?.guarantorshipRequest.loanRequest.refId))
            })()
        }

        return () => {
            fetching = false;
        };
    },[])

    const openAuthSessionAsync = async (url: string) => {
        try {
            let result: any = await WebBrowser.openAuthSessionAsync(
                `${url}`,
                'presta-sign://app/loan-request'
            );
            let redirectData;
            if (result.url) {
                redirectData = Linking.parse(result.url);
            }
            console.log("openAuthSessionAsync", result, redirectData)

            //Object {
            //   "type": "dismiss",
            // } undefined

            // navigate to success page

        } catch (error) {
            alert(error);
            console.log(error);
        }
    };

    const makeSigningRequest = async () => {
        // ready to redirect to zoho
        console.log("terror blade", route.params)
        if (route.params?.witness && member) {
            console.log("witness")
            type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
            type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
            const payloadOut: zohoSignPayloadType = {
                loanRequestRefId: route.params?.guarantorshipRequest.loanRequest.refId,
                actorRefId: member.refId,
                actorType:  "WITNESS"
            }
            console.log("zohoSignPayloadType", payloadOut);

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
            console.log(loanRequest);
        }

        if (route.params?.guarantor && member) {
            console.log("guarantor")
            type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
            type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
            const payloadOut: zohoSignPayloadType = {
                loanRequestRefId: route.params?.guarantorshipRequest.loanRequest.refId,
                actorRefId: member.refId,
                actorType:  "GUARANTOR"
            }
            console.log("zohoSignPayloadType", payloadOut);

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
            console.log(loanRequest);
        }
    };
    return(
        <View style={{flex: 1, alignItems: 'center', position: 'relative'}}>
            <SafeAreaView style={{ flex: 1, width, height: 11/12 * height, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                <ScrollView contentContainerStyle={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 40, paddingBottom: 100 }}>
                    <Text allowFontScaling={false} style={styles.headTitle}>Your {route.params?.witness ? 'Witness' : 'Guarantorship'} ({loanRequest?.loanRequestNumber}) of KES {loanRequest? toMoney(loanRequest.loanAmount) : false } has been confirmed.</Text>
                    <Text allowFontScaling={false} style={styles.subtitle}>Proceed below to sign your form</Text>
                    <Image
                        style={styles.formPreview}
                        source={{ uri: `data:image/png;base64, ${loanRequest?.pdfThumbNail}` }}
                    />
                </ScrollView>
            </SafeAreaView>
            <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity disabled={loading} onPress={() => makeSigningRequest()} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: loading ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                    {loading && <RotateView/>}
                    <Text allowFontScaling={false} style={styles.buttonText}>SIGN DOCUMENT</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    headTitle: {
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_700Bold',
        fontSize: 20,
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
        marginTop: 30,
        width: '100%',
        height: height/2,
        resizeMode: 'contain'
    }
});


export default SignDocumentRequest;
