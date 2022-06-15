import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";
import * as React from "react";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchLoanRequest, storeState} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {toMoney} from "../User/Account";

type NavigationProps = NativeStackScreenProps<any>;
const { width, height } = Dimensions.get("window");
const SignDocumentRequest = ({ navigation, route }: NavigationProps) => {
    // fetchLoanRequest
    const { loading, loanRequest } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();

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

    const makeSigningRequest = async () => {
        // ready to redirect to zoho

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
                <TouchableOpacity onPress={() => makeSigningRequest()} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
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
