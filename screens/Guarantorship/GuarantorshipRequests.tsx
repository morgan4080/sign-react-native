import {
    Dimensions,
    Platform,
    SafeAreaView,
    SectionList,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {StatusBar} from "expo-status-bar";
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";

import {useDispatch, useSelector} from "react-redux";
import {fetchGuarantorshipRequests, setGuarantorsUpdated, storeState} from "../../stores/auth/authSlice";
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
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {toMoney} from "../User/Account";
import GuarantorTiles from "../User/Components/GuarantorTiles";
import {store} from "../../stores/store";
import {RotateView} from "../Auth/VerifyOTP";
import BottomSheet, {BottomSheetBackdrop, BottomSheetView} from "@gorhom/bottom-sheet";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function GuarantorshipRequests ({ navigation, route }: NavigationProps) {
    const { loading, user, member, guarantorshipRequests, guarantorsUpdated } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();
    type accountHistoryType = {refId: string, executor: string, subject: string, event: string, isActive: boolean, time: string}

    const [pressed, setPressed] = useState<boolean>(false)
    const [request, setRequest] = useState<accountHistoryType | null>()

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
            setPressed(false);
        }
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

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

    useEffect(() => {
        let fetching = true;
        if (fetching) {
            (async () => {
                await dispatch(fetchGuarantorshipRequests({ memberRefId: member?.refId}))
            })()
        }
        return () => {
            fetching = false;
        }
    }, []);

    const accountHistory: accountHistoryType[] = guarantorshipRequests.map((request, i) => {

        return {
            refId: request.refId,
            executor: request.applicant.firstName + " " + request.applicant.lastName,
            subject: toMoney(`${request.loanRequest.amount}`),
            event: 'requested you to guarantee their loan ' + request.loanRequest.loanNumber +  ' of Kshs',
            isActive: !!request.isActive,
            time: request.loanRequest.loanDate
        };
    });

    const onPress = () => {
        if (!pressed) {
            handleSnapPress(2);
        } else {
            handleClosePress();
        }
    }

    useEffect(() => {
        if (guarantorsUpdated) handleClosePress()
        return () => {
            setGuarantorsUpdated(false);
        }
    }, [guarantorsUpdated]);

    if (fontsLoaded) {
        return (
            <GestureHandlerRootView style={{flex: 1, position: 'relative'}}>
                <View style={{ position: 'absolute', right: -30, top: -10, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.07)", width: width, height }}>
                        <SectionList
                            style={{marginTop: 20}}
                            sections={accountHistory.length > 0 ? [
                                {
                                    title: '',
                                    data:  accountHistory
                                }
                            ]: []}
                            progressViewOffset={50}
                            refreshing={loading}
                            onRefresh={() => dispatch(fetchGuarantorshipRequests({ memberRefId: member?.refId}))}
                            keyExtractor={(index) => index + Math.random().toString(12).substring(0)}
                            renderItem={({ item }) => <GuarantorTiles pressed={pressed} setPressed={onPress} setRequest={setRequest} guarantor={item} />}
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

                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView style={{display: 'flex', alignItems: 'center'}}>
                        <View style={styles.userPicBtn}>
                            <MaterialCommunityIcons name="account" color="#FFFFFF" size={50}/>
                        </View>
                        <View>
                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_700Bold', color: '#489AAB', fontSize: 20, textAlign: 'center', marginTop: (height/1.5)/30 }}>{request?.executor}</Text>
                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#489AAB', fontSize: 12, textAlign: 'center' }}>{ `${user?.companyName}` }</Text>
                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 250, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                                Kindly accept my request to add you as a guarantor  for this Loan Product valued :
                            </Text>
                            <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#489AAB', fontSize: 20, textAlign: 'center', marginTop: (height/1.5)/20 }}>
                                KES { request?.subject }
                            </Text>
                        </View>
                        <View style={{height: (height/6), display: 'flex', flexDirection: 'row', marginTop:  (height/1.5)/20 }}>
                            <TouchableOpacity onPress={() => {
                                handleClosePress();
                                setPressed(false);
                                setRequest(null);
                                navigation.navigate('SignDocumentRequest', {
                                    guarantorshipRequest: guarantorshipRequests.find(rq => rq.refId === request?.refId),
                                    guarantor: true
                                })
                            }}>
                                <MaterialIcons name="check-circle" size={80} color="#78E49D" />
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', textAlign: 'center', color: '#78E49D'}}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                handleClosePress();
                                setPressed(false);
                                setRequest(null);
                                navigation.navigate('GuarantorshipStatus', {
                                    accepted: false,
                                    guarantor: request,
                                    loanRequest: guarantorshipRequests.find(rq => rq.refId === request?.refId)
                                })
                            }}>
                                <MaterialIcons name="cancel" size={80} color="#FF927A" />
                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', textAlign: 'center', color: '#FF927A'}}>Decline</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </GestureHandlerRootView>
    )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: height/3, width }}>
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
    userPicBtn: {
        marginTop: 20,
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderColor: '#489AAB',
        borderWidth: 1,
        borderRadius: 100,
        backgroundColor: '#EDEDED',
        position: 'relative'
    },
});
