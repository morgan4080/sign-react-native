import {
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    ImageBackground,
    SectionList,
    SafeAreaView
} from 'react-native';
import {Text, View} from "../../components/Themed"
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
    setSelectedTenantId,
    updateOrganisation,
    LoadOrganisation, SettingsPayloadType
} from "../../stores/auth/authSlice";
import {AntDesign, Entypo, FontAwesome, Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";
import {saveSecureKey} from "../../utils/secureStore";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {useForm} from "react-hook-form";
import ApplyLoan from "../../assets/images/apply-loan.svg";
import GuarantorImg from "../../assets/images/guarantorship.svg";
import Fav from "../../assets/images/fav.svg";
import WitnessImg from "../../assets/images/witness.svg";
import {showSnack} from "../../utils/immediateUpdate";
import {useAppDispatch, useClientSettings, useLoading, useMember, useOrganisations, useUser} from "../../stores/hooks";
import Container from "../../components/Container";

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
                            return dispatch(updateOrganisation({tenantId: payload.tenantId, clientSettings: orgLoaded.payload as SettingsPayloadType}));
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
            <Container>
                <Text style={styles.description}>
                    { `${ user?.companyName ? user?.companyName : '' }` }
                </Text>
                <View style={{
                    marginTop: 15,
                    padding: 15,
                    position: 'relative',
                    borderRadius: 12,
                    overflow: "hidden",
                    elevation: 4
                }}>
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                        <View>
                            <Text allowFontScaling={false} style={[styles.titleText, {fontFamily: "Poppins_600SemiBold"}]}>{ `Good ${ greeting() }` }</Text>
                            <Text allowFontScaling={false} style={styles.titleText}>{ `${ member?.firstName ? member?.firstName : '' } ${ member?.lastName ? member?.lastName : '' }` }</Text>
                            <Text allowFontScaling={false} style={styles.subTitleText}>{ `${ member?.memberNumber ? member?.memberNumber : '' }` }</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("")}>
                            <Entypo name="dots-three-horizontal" size={24} color="#489AAB" />
                        </TouchableOpacity>
                    </View>
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
                        <View>
                            <Text allowFontScaling={false} style={[styles.subTitleText, {textAlign: "right"}]}>Available Balance</Text>
                            <Text allowFontScaling={false} style={[styles.titleText, {textAlign: "right", color: "#15141F", fontSize: 22, lineHeight: 28, letterSpacing: 0, fontFamily: "Poppins_700Bold"}]}>1,000,000</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor: "rgba(204,204,204,0.3)", height: 2, marginVertical: 25}}></View>
                    <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                        <Text allowFontScaling={false} style={[styles.subTitleText, {textAlign: "right"}]}>Loan requests</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("LoanRequests")}>
                            <Text allowFontScaling={false} style={[styles.subTitleText, {textAlign: "right", color: "#489AAB"}]}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{display: "flex", flexDirection: "row", paddingVertical: 10, alignItems: "center"}}>
                        <FontAwesome name="circle-thin" size={50} color="rgba(204,204,204,0.3)" />
                        <Text allowFontScaling={false} style={[styles.subTitleText, {textAlign: "right", marginLeft: 10, fontFamily: 'Poppins_500Medium', fontSize: 12}]}>You don't have any loan requests yet</Text>
                    </View>
                </View>
                <View style={{marginTop: 20}}>
                    <TouchableOpacity onPress={() => navigation.navigate('LoanProducts')} style={styles.narrowCard}>
                        <AntDesign name="calculator" size={50} color="#FFFFFF" />
                        <View style={{backgroundColor: "#489AAB", marginLeft: 20}}>
                            <Text allowFontScaling={false} style={{ color: '#ffffff', fontSize: 13, fontFamily: 'Poppins_600SemiBold' }}>
                                Apply for a loan
                            </Text>
                            <Text allowFontScaling={false} style={{ color: '#ffffff', fontSize: 11, fontFamily: 'Poppins_500Medium' }}>
                                Create a loan request
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('GuarantorshipRequests', {pressed: true})} style={[styles.narrowCard, {backgroundColor: "#FFFFFF"}]}>
                        <GuarantorImg width={50} height={50} />
                        <View style={{marginLeft: 20}}>
                            <Text allowFontScaling={false} style={{ color: '#0C212C', fontSize: 13, fontFamily: 'Poppins_600SemiBold' }}>
                                Guarantorship requests
                            </Text>
                            <Text allowFontScaling={false} style={{ color: '#576B74', fontSize: 11, fontFamily: 'Poppins_500Medium' }}>
                                View guarantorship requests
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('FavouriteGuarantors')} style={[styles.narrowCard, {backgroundColor: "#FFFFFF"}]}>
                        <Fav width={50} height={50} />
                        <View style={{marginLeft: 20}}>
                            <Text allowFontScaling={false} style={{ color: '#0C212C', fontSize: 13, fontFamily: 'Poppins_600SemiBold' }}>
                                Favorite guarantors
                            </Text>
                            <Text allowFontScaling={false} style={{ color: '#576B74', fontSize: 11, fontFamily: 'Poppins_500Medium' }}>
                                View and edit you favourite guarantors
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('WitnessRequests')} style={[styles.narrowCard, {backgroundColor: "#FFFFFF"}]}>
                        <WitnessImg width={50} height={50} />
                        <View style={{marginLeft: 20}}>
                            <Text allowFontScaling={false} style={{ color: '#0C212C', fontSize: 13, fontFamily: 'Poppins_600SemiBold' }}>
                                Witness requests
                            </Text>
                            <Text allowFontScaling={false} style={{ color: '#576B74', fontSize: 11, fontFamily: 'Poppins_500Medium' }}>
                                View witness requests
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Container>
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
    narrowCard: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 80,
        borderRadius: 12,
        backgroundColor: '#489AAB',
        elevation: 5,
        position: 'relative',
        marginBottom: 10,
        paddingHorizontal: 20
    },
    description: {
        marginTop: 60,
        fontWeight: '300',
        color: '#62656b'
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
        
        marginTop: 5
    },
    subTitleText: {
        fontSize: 15,
        textAlign: 'left',
        color: '#576B74',
        fontFamily: 'Poppins_500Medium',
        lineHeight: 18,
        letterSpacing: -0.08,
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
        textAlign: 'left',
        color: '#15141F',
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: 0,
        fontFamily: 'Poppins_400Regular',
        textTransform: "uppercase"
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
