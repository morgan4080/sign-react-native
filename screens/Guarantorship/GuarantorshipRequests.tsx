import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as React from "react";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import {useDispatch, useSelector} from "react-redux";
import {fetchGuarantorshipRequests, storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import HistoryTile from "../User/Components/HistoryTile";
import {useEffect, useState} from "react";
import {toMoney} from "../User/Account";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function GuarantorshipRequests ({ navigation }: NavigationProps) {
    const { loading, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    type GuarantorshipRequestType = {
        applicant: {firstName: string, lastName: string, refId: string},
        committedAmount: string,
        firstName: string,
        isActive: string,
        lastName: string,
        loanRequest: {amount: number, loanNumber: string, refId: string},
        memberNumber: string,
        memberRefId: string,
        refId: string
    }


    const [guarantorshipRequests, setGuarantorshipRequests] = useState<GuarantorshipRequestType[]>([]);

    useEffect(() => {
        let fetching = true;

        if (fetching) {
            (async () => {
                await dispatch(fetchGuarantorshipRequests({ memberRefId: member?.refId, setGuarantorshipRequests}))
            })()
        }

        return () => {
            fetching = false;
        };
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

    const accountHistory = guarantorshipRequests.map((request, i) => {

        return {
            executor: request.applicant.firstName + " " + request.applicant.lastName,
            subject: toMoney(`${request.loanRequest.amount}`),
            event: 'requested you to guarantee their loan ' + request.loanRequest.loanNumber +  ' of Kshs',
            time: new Date().toLocaleTimeString()
        };
    })

    if (fontsLoaded && !loading) {
        return (
        <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
            <View style={{ position: 'absolute', right: -30, top: -10, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
            <View style={styles.container}>
                <View style={{flex: 1, alignItems: 'center',}}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height }}>

                        <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50  }}>
                        {
                            accountHistory && accountHistory.map((history, i) => (
                                <HistoryTile key={i} history={history}  />
                        ))
                        }
                        </ScrollView>

                    </SafeAreaView>
                </View>
            </View>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
        </View>
    )
    } else {
        return (
            <AppLoading/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
});
