import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Platform
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
import {RotateView} from "../Auth/VerifyOTP";
import {fetchLoanRequest, requestSignURL, storeState} from "../../stores/auth/authSlice";
import {toMoney} from "../User/Account";
import * as WebBrowser from "expo-web-browser";
import {useEffect} from "react";
import {showSnack} from "../../utils/immediateUpdate";
import Container from "../../components/Container";
import TouchableButton from "../../components/TouchableButton";
type NavigationProps = NativeStackScreenProps<any>;
const { height } = Dimensions.get("window");

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

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

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

        } catch (error: any) {
            showSnack(JSON.stringify(error))
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
                showSnack(payload.message);
            }

            if (payload.signURL) await openAuthSessionAsync(payload.signURL)
        } else {
            showSnack(error);
        }
    }
    console.log(`${loanRequest?.pdfThumbNail}`)
    return (
        <Container>
            <View style={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 20 }}>
                <Text allowFontScaling={false} style={styles.headTitle}>Your Loan ({loanRequest?.loanRequestNumber}) of KES {loanRequest ? toMoney(loanRequest.loanAmount) : 0 } has been confirmed.</Text>
                <Text allowFontScaling={false} style={styles.subtitle}>Proceed below to sign your form</Text>
                <Image
                    style={styles.formPreview}
                    source={{ uri: `data:image/png;base64, ${loanRequest?.pdfThumbNail}` }}
                />
            </View>

            <TouchableButton loading={loading} label={"SIGN DOCUMENT"} onPress={() => makeSigningRequest()} />
        </Container>
    )
}

export default LoanRequest;

const styles = StyleSheet.create({
    headTitle: {
        textAlign: 'center',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
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
        height: height/2.5,
        resizeMode: 'contain'
    }
});
