import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Dimensions,
    NativeModules,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequest, requestSignURL, storeState} from "../../stores/auth/authSlice";
import {MaterialIcons} from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import {store} from "../../stores/store";
const { width, height } = Dimensions.get("window");
type NavigationProps = NativeStackScreenProps<any>;

const SignStatus = ({ navigation, route }: NavigationProps) => {
    const CSTM = NativeModules.CSTM;
    const { loading } = useSelector((state: { auth: storeState }) => state.auth);
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

    const openAuthSessionAsync = async (url: string) => {
        try {
            let result: any = await WebBrowser.openAuthSessionAsync(
                `${url}`,
                'presta-sign://app/loan-request'
            );

            if (result.type === "dismiss") {
                const {type, error, payload}: any  = await dispatch(fetchLoanRequest(route.params?.loan.refId as string))

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
            loanRequestRefId: route.params?.loan?.refId as string,
            actorRefId: route.params?.loan?.memberRefId as string,
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

    return (
        <View style={{ flex: 1, alignItems: 'center', width, height }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                <ScrollView contentContainerStyle={{display: 'flex', alignItems: 'center', justifyContent: 'center', width, height: height/1.5}}>
                    <View style={{display: 'flex', alignItems: 'center'}}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#489AAB', fontSize: 20, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/30 }}>
                            {route.params?.applicantSigned ? 'SUCCESSFULLY SIGNED' : 'SIGNING INCOMPLETE'}
                        </Text>
                        {route.params?.applicantSigned && <MaterialIcons name="check-circle" size={150} color="#78E49D"/>}
                        {!route.params?.applicantSigned && <MaterialIcons name="cancel" size={150} color="#FF927A"/>}
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                            {route.params?.applicant ? 'Your' : route.params?.witness ? 'Witness for': route.params?.guarantor ? 'Guarantorship for' : ''} <Text style={{color: '#489AAB'}}>{ route.params?.loanProductName}</Text> of amount <Text style={{color: '#489AAB'}}>{route.params?.loanAmount}</Text> has {route.params?.applicantSigned ? 'been signed successfully' : 'not yet been signed'}.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.6)', width, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
                <TouchableOpacity onPress={() => navigation.navigate('LoanRequests')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                    <Text allowFontScaling={false} style={{...styles.buttonText, color: '#797979'}}>LOAN REQUESTS</Text>
                </TouchableOpacity>
                {!route.params?.applicantSigned &&
                    <TouchableOpacity onPress={() => signDocument()} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#489AAB', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                        <Text allowFontScaling={false} style={{...styles.buttonText}}>RETRY</Text>
                    </TouchableOpacity
                >}

                {route.params?.applicantSigned &&
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginVertical: 30 }}>
                        <Text allowFontScaling={false} style={{...styles.buttonText, color: '#797979'}}>PROFILE</Text>
                    </TouchableOpacity
                >}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonText: {
        fontSize: 12,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
});

export default SignStatus;
