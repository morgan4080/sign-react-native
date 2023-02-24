import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    ImageBackground,
    SectionList,
    TextInput, SafeAreaView
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    fetchMember,
    saveContactsToDb,
    authenticate,
    fetchLoanProducts,
    editMember,
    setSelectedTenantId, updateOrganisation, organisationType, LoadOrganisation
} from "../../stores/auth/authSlice";
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";
import {getSecureKey, saveSecureKey} from "../../utils/secureStore";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Controller, useForm} from "react-hook-form";
import ApplyLoan from "../../assets/images/apply-loan.svg";
import GuarantorImg from "../../assets/images/guarantorship.svg";
import Fav from "../../assets/images/fav.svg";
import WitnessImg from "../../assets/images/witness.svg";
import {showSnack} from "../../utils/immediateUpdate";
import {useAppDispatch, useClientSettings, useLoading, useMember, useOrganisations, useUser} from "../../stores/hooks";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

const greeting = () => {
    return ["Morning", "Afternoon", "Evening"].reduce((previousValue: string, currentValue: string, currentIndex: number, greetings: string[]): string => {
        let actualTime: string = new Date().toTimeString().split(" ")[0].split(":")[0]
        if (parseInt(actualTime) > 0) {
            if (parseInt(actualTime) >= 0 && parseInt(actualTime) < 12) {
                return greetings[0]
            }
            if (parseInt(actualTime) >= 12 && parseInt(actualTime) < 18) {
                return greetings[1]
            }
            if (parseInt(actualTime) >= 18) {
                return greetings[2]
            }
        }
        return ''
    })
}

type FormData = {
    email: string
}

export default function UserProfile({ navigation }: NavigationProps) {
    const [user] = useUser();
    const [member] = useMember();
    const [organisations] = useOrganisations();
    const [clientSettings] = useClientSettings();
    const [loading] = useLoading();

    const dispatch = useAppDispatch();

    const [reload, setReload] = useState<boolean>(false)

    useEffect(() => {
        Promise.all([
            dispatch(authenticate()),
            dispatch(LoadOrganisation())
        ]).then(([authStuff, orgLoaded]) => {
            const { type, error, payload }: any = authStuff;

            if (error) {
                throw new Error(error)
            } else {
                if (type === 'authenticate/fulfilled' && payload && payload.tenantId) {
                    return saveSecureKey('currentTenantId', payload.tenantId)
                        .then(() => Promise.all([
                            dispatch(setSelectedTenantId(payload.tenantId)),
                            dispatch(fetchMember()),
                            dispatch(saveContactsToDb()),
                            dispatch(fetchLoanProducts()),
                        ]))
                        .then(() => {
                            const replaceOrganisations = organisations.reduce((acc: organisationType[], org) => {
                                if (`${org.tenantId}` === `${payload.tenantId}` && Object.keys(clientSettings).length > 0) {
                                    // modify some parameters to conform with client settings
                                    org.tenantName = clientSettings.organizationName ? clientSettings.organizationName : org.tenantName;
                                    org.witness = (clientSettings.requireWitness !== undefined) ? clientSettings.requireWitness : org.witness;
                                    org.selfGuarantee = (clientSettings.allowSelfGuarantee !== undefined) ? clientSettings.allowSelfGuarantee : org.selfGuarantee;
                                    org.amounts = (clientSettings.isGuaranteedAmountShared !== undefined) ?  !clientSettings.isGuaranteedAmountShared : org.amounts;
                                    org.guarantors = (clientSettings.isGuaranteedAmountShared !== undefined) ? clientSettings.isGuaranteedAmountShared === true ? 'count' : 'value' : org.guarantors;
                                    org.containsAttachments = (clientSettings.containsAttachments !== undefined) ? clientSettings.containsAttachments : org.containsAttachments;
                                    org.loanProductMaxPeriod = clientSettings.loanProductMaxPeriod ? clientSettings.loanProductMaxPeriod : org.loanProductMaxPeriod;
                                    org.parallelLoans = (clientSettings.parallelLoans !== undefined) ? clientSettings.parallelLoans : org.parallelLoans;
                                    org.logo = (clientSettings.organizationLogoName && clientSettings.organizationLogoExtension) ? `https://eguarantorship-api.presta.co.ke/${clientSettings.organizationLogoName}.${clientSettings.organizationLogoExtension}` : null;
                                    org.organizationPrimaryTheme = clientSettings.organizationPrimaryTheme ? clientSettings.organizationPrimaryTheme : org.organizationPrimaryTheme;
                                    org.organizationSecondaryTheme = clientSettings.organizationSecondaryTheme ? clientSettings.organizationSecondaryTheme : org.organizationSecondaryTheme;
                                    acc.push(org);
                                } else {
                                    acc.push(org);
                                }
                                return acc;
                            }, [])
                            return dispatch(updateOrganisation(replaceOrganisations))
                        }).catch((err) => {
                            throw new Error(err)
                        })
                } else {
                    throw new Error("Authentication Failed")
                }
            }
        }).catch((error) => {
            console.log(JSON.stringify(error))
        })
    }, [reload])

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
        console.log("handleSheetChange", index);
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

    // disappearsOnIndex={1}
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

    type memberPayloadType = {firstName?: string, lastName?: string, phoneNumber?: string, idNumber?: string, email?: string, memberRefId?: string};

    const {
        control,
        handleSubmit,
        clearErrors,
        formState: { errors }
    } = useForm<FormData>({})

    const reloading = () => {
        setReload(!reload);
    }

    const onSubmit = async ({email}: any): Promise<void> => {
        try {
            const payload: memberPayloadType = {
                email,
                memberRefId: member?.refId
            }

            const {type, error}: any = await dispatch(editMember(payload));

            if (type === 'editMember/rejected' && error) {
                if (error.message === "Network request failed") {
                    showSnack("Network request failed", "ERROR");
                } else if (error.message === "401") {
                    showSnack(`Edit Member Error: ${error.message}`, "ERROR")
                    return
                } else {
                    showSnack(error.message, "ERROR");
                }
            } else {
                showSnack('Successful', "SUCCESS");
                handleClosePress();
                reloading();
            }
        } catch (e: any) {
            showSnack(e.message, "ERROR");
        }
    }

    const onError = (errors: any, e: any) => {
        console.log('the errors')
    }

    if (fontsLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, position: 'relative', backgroundColor: '#FFFFFF' }}>
                <SectionList
                    refreshing={loading}
                    progressViewOffset={50}
                    onRefresh={() => reloading()}
                    sections={[
                        {
                            title: 'title',
                            data: new Array(3)
                        }
                    ]}
                    keyExtractor={(index) => index + Math.random().toString(12).substring(0)}
                    renderItem={({ index }) => {
                        switch (index) {
                            case 0:
                                return (
                                    <ImageBackground source={require('../../assets/images/profile-bg.png')} resizeMode="cover" style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        position: 'relative',
                                        height: height/2,
                                        paddingHorizontal: 16
                                    }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ position: 'absolute', display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(72,154,171,0.49)', borderRadius: 100, top: '8%', left: 10 }}>
                                            <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                                            <Text allowFontScaling={false} style={[styles.subTitleText, {fontSize: 12, color: '#FFFFFF', paddingRight: 10, fontFamily: 'Poppins_300Light'}]}>PROFILE</Text>
                                        </TouchableOpacity>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.titleText}>{ `Good ${ greeting() } ${ member?.firstName ? member?.firstName : '' }` }</Text>
                                            <Text allowFontScaling={false} style={styles.subTitleText}>{ `Member NO: ${ member?.memberNumber ? member?.memberNumber : '' }` }</Text>
                                            <Text allowFontScaling={false} style={styles.subText}>{ `${ user?.companyName ? user?.companyName : '' }` }</Text>
                                        </View>
                                        {/*<View style={{ position: 'absolute', left: width/4, zIndex: 2, bottom: -25 }}>
                                            <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, elevation: 2, borderRadius: 25, marginTop: -30 }}>
                                                <Text allowFontScaling={false} style={styles.buttonText}>View balances</Text>
                                            </TouchableOpacity>
                                        </View>*/}
                                    </ImageBackground>
                                )
                            case 1:
                                return (
                                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('KYC')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderRadius: 25, backgroundColor: '#489AAB',elevation: 5, position: 'relative' }}>
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#ffffff', fontSize: 11.5, marginLeft: 10, marginRight: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                                Apply For A Loan
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <ApplyLoan width={50} height={50} />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate('GuarantorshipRequests', {pressed: true})} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, backgroundColor: '#FFFFFF', elevation: 2, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                            <Text allowFontScaling={false} style={{ flex: 4, color: '#489AAB', fontSize: 11.5, marginLeft: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                                Guarantorship Requests
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 + 1 }}>
                                                <GuarantorImg width={50} height={50} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            case 2:
                                return (
                                    <View style={{ display: 'flex', flexDirection: 'row', marginVertical: 20, justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('FavouriteGuarantors')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, backgroundColor: '#FFFFFF', elevation: 2, borderRadius: 25, position: 'relative'  }}>
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#489AAB', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10, marginRight: 10 }}>
                                                Favorite Guarantors
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <Fav width={50} height={50} />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate('WitnessRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, backgroundColor: '#FFFFFF', elevation: 2, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                            {/*<View style={{backgroundColor: '#FC866C', position: 'absolute', top: 0, right: 0, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: width/15, height: width/15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF'}}>{ witnessRequests?.length }</Text>
                                        </View>*/}
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#489AAB', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10, marginRight: 10 }}>
                                                Witness Requests
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <WitnessImg width={50} height={50} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            default:
                                return (
                                    <></>
                                )
                        }
                    }}
                />

                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </SafeAreaView>
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
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 45,
        marginTop: 10,
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5
    },
    subTitleText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
        lineHeight: 22,
        letterSpacing: 0.5,
    },
    subText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        letterSpacing: 0.5,
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height/1.7
    },
    titleText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 20,
        lineHeight: 22,
        letterSpacing: 0.5,
        fontFamily: 'Poppins_700Bold',
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
