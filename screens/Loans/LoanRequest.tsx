import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
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
import {requestSignURL, storeState} from "../../stores/auth/authSlice";
import {toMoney} from "../User/Account";
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
    const { loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const loanRequest = route.params;
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });
    const makeSigningRequest = async () => {
      // ready to redirect to zoho
        type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"
        type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}
        const payloadOut: zohoSignPayloadType = {
            loanRequestRefId: loanRequest?.refId,
            actorRefId: loanRequest?.memberRefId,
            actorType:  "APPLICANT"
        }
        console.log("zohoSignPayloadType", payloadOut);

        const {type, error, payload}: any = await dispatch(requestSignURL(payloadOut))

        if (type === 'requestSignURL/fulfilled') {
            console.log(type, payload);
        } else {
            console.log(type, error);
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
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                            <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
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
                        <TouchableOpacity onPress={() => makeSigningRequest()} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
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
