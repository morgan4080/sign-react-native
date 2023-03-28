import {
    Dimensions,
    Image,
    NativeModules,
    StyleSheet,
    Text,
    View
} from "react-native";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequest, requestSignURL, storeState} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {toMoney} from "../User/Account";
import * as WebBrowser from "expo-web-browser";
import Container from "../../components/Container";
import TouchableButton from "../../components/TouchableButton";
import {RootStackScreenProps} from "../../types";
import {showSnack} from "../../utils/immediateUpdate";

const { height } = Dimensions.get("window");
const SignDocumentRequest = ({ navigation, route }: RootStackScreenProps<"SignDocumentRequest">) => {
    // fetchLoanRequest
    const { loading, loanRequest, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const CSTM = NativeModules.CSTM;

    useEffect(() => {
        let fetching = true;

        if (fetching) {
            (async () => {
                if (route.params && route.params.guarantorshipRequest.loanRequest.refId) {
                    await dispatch(fetchLoanRequest(route.params.guarantorshipRequest.loanRequest.refId));
                } else {
                    showSnack("Loan request doesn't exist anymore");
                }
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

            if (result.type === "dismiss" && route.params && route.params.guarantorshipRequest.loanRequest.refId) {
                const {type, error, payload}: any  = await dispatch(fetchLoanRequest(route.params?.guarantorshipRequest.loanRequest.refId))

                if (type === 'fetchLoanRequest/fulfilled') {
                    // if status is signed
                    // navigate to success page else failed page/ with retry
                    navigation.navigate('SignStatus', payload);
                } else {
                    // navigate to success error page
                    console.log("fetchLoanRequest", error.message)
                }
            }

        } catch (error) {
            console.log(error);
        }
    };

    const makeSigningRequest = async () => {
        // ready to redirect to zoho

        if (route.params?.witness && member) {
            type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
            type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
            const payloadOut: zohoSignPayloadType = {
                loanRequestRefId: route.params?.guarantorshipRequest.loanRequest.refId,
                actorRefId: member.refId,
                actorType:  "WITNESS"
            }

            const {type, error, payload}: any = await dispatch(requestSignURL(payloadOut))

            if (type === 'requestSignURL/fulfilled') {
                if (!payload.success) {
                    showSnack(payload);
                }

                if (payload.signURL) await openAuthSessionAsync(payload.signURL)
            } else {
                showSnack(payload);
            }

        }

        if (route.params?.guarantor && member) {
            type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
            type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
            const payloadOut: zohoSignPayloadType = {
                loanRequestRefId: route.params?.guarantorshipRequest.loanRequest.refId,
                actorRefId: member.refId,
                actorType:  "GUARANTOR"
            }

            const {type, error, payload}: any = await dispatch(requestSignURL(payloadOut))

            if (type === 'requestSignURL/fulfilled') {
                if (!payload.success) {
                    showSnack(payload);
                }

                if (payload.signURL) await openAuthSessionAsync(payload.signURL)
            } else {
                showSnack(payload);
            }
        }
    };
    return(
        <Container>
            <View style={{position: "relative", height: height * 0.9}}>
                <Text allowFontScaling={false} style={styles.headTitle}>Your {route.params?.witness ? 'Witness' : 'Guarantorship'} ({loanRequest?.loanRequestNumber}) of KES {loanRequest? toMoney(loanRequest.loanAmount) : false } has been confirmed.</Text>
                <Text allowFontScaling={false} style={styles.subtitle}>Proceed below to sign your form</Text>
                <Image
                    style={styles.formPreview}
                    source={{ uri: `data:image/png;base64, ${loanRequest?.pdfThumbNail}` }}
                />
                <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableButton loading={loading} label={"SIGN DOCUMENT"} onPress={() => makeSigningRequest()} />
                </View>
            </View>
        </Container>
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
        marginTop: 30,
        height: height/2,
        resizeMode: 'contain'
    }
});


export default SignDocumentRequest;
