import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    // SafeAreaView,
    Image,
    Dimensions,
    Platform,
    ImageBackground,
    SectionList, NativeModules, TextInput
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_700Bold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {
    storeState,
    fetchMember,
    saveContactsToDb,
    // setLoanCategories,
    authenticate, setLoanCategories, fetchLoanProducts, editMember, logoutUser,
    // fetchLoanProducts
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {Ionicons} from "@expo/vector-icons";
import {RotateView} from "../Auth/VerifyOTP";
import {getSecureKey} from "../../utils/secureStore";
import BottomSheet, {BottomSheetBackdrop, BottomSheetScrollView} from "@gorhom/bottom-sheet";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Controller, useForm} from "react-hook-form";

// Types

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

const { CSTM } = NativeModules;

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
    const { loading, user, member } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {

        let authenticating = true;
        const controller = new AbortController();
        const signal = controller.signal;
        if (authenticating) {
            (async () => {
                const [authStuff, phone_no, country_code] = await Promise.all([
                    dispatch(authenticate()),
                    getSecureKey('phone_number_without'),
                    getSecureKey('phone_number_code')
                ]);
                const { type, error, payload }: any = authStuff;
                if (type === 'authenticate/rejected') {
                    navigation.navigate('GetTenants')
                } else {
                    try {
                        const fmPayload = phone_no ? `${country_code}${phone_no}` : payload.phoneNumber;

                        const [a] = await Promise.all([
                            dispatch(fetchMember(fmPayload.replace('+', ''))),
                        ]);

                        const { email, details }: any = a.payload;

                        if (!email) {
                            handleSnapPress(1);
                        }
                        /*else {
                            if (details && details.email_approval && details.email_approval.value && details.email_approval.value !== email) {
                                CSTM.showToast('Email Change Awaiting Approval')
                            }
                        }*/

                        await Promise.all([
                            dispatch(saveContactsToDb()),
                            dispatch(fetchLoanProducts()),
                            dispatch(setLoanCategories(signal))
                        ])
                    } catch (e: any) {
                        console.log('promise rejection', e);
                    }
                }
            })()
        }
        return () => {
            controller.abort();
            authenticating = false;
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

    // tme email = null enter pin
    /*"email_approval": {
        "value": "chepngenokirui20@gmail.com",
            "type": "TEXT"
    },
        compare wil email if not same, awaiting approval

    */

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
        watch,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>({})

    const reload = async () => {
        await fetchMember(user?.phoneNumber)
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
                    CSTM.showToast("Network request failed");
                } else if (error.message === "401") {
                    await dispatch(logoutUser())
                } else {
                    CSTM.showToast(error.message);
                }
            } else {
                CSTM.showToast('Successful');
                handleClosePress();
                await reload();
            }
        } catch (e) {
            CSTM.showToast('Failed');
        }
    }

    const onError = (errors: any, e: any) => {
        console.log('the errors')
    }

    if (fontsLoaded) {
        return (
            <GestureHandlerRootView style={{ flex: 1, position: 'relative', backgroundColor: '#FFFFFF' }}>
                <SectionList
                    refreshing={loading}
                    progressViewOffset={50}
                    onRefresh={ async () => await reload()}
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
                                        height: height/2
                                    }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ position: 'absolute', display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(51,109,255,0.4)', borderRadius: 100, top: 50, left: 10 }}>
                                            <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                                            <Text allowFontScaling={false} style={[styles.subTitleText, {fontSize: 12, color: '#FFFFFF', paddingRight: 10, fontFamily: 'Poppins_300Light'}]}>PROFILE</Text>
                                        </TouchableOpacity>
                                        <View>
                                            <Text allowFontScaling={false} style={styles.titleText}>{ `Good ${ greeting() } ${ member?.firstName ? user?.firstName : '' }` }</Text>
                                            <Text allowFontScaling={false} style={styles.subTitleText}>{ `Your member NO: ${ member?.memberNumber ? member?.memberNumber : '' }` }</Text>
                                            <Text allowFontScaling={false} style={styles.subText}>{ `${ user?.companyName ? user?.companyName : '' }` }</Text>
                                        </View>
                                        <View style={{ position: 'absolute', left: width/4, zIndex: 2, bottom: -25 }}>
                                            <TouchableOpacity onPress={() => navigation.navigate('Account')} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginTop: -30 }}>
                                                <Text allowFontScaling={false} style={styles.buttonText}>View balances</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ImageBackground>
                                )
                            case 1:
                                return (
                                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 50, justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('LoanProducts')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderRadius: 25, backgroundColor: '#336DFF', position: 'relative' }}>
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#ffffff', fontSize: 11.5, marginLeft: 10, marginRight: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                                Apply For A Loan
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <Image
                                                    source={require('../../assets/images/apply-loan.png')}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate('GuarantorshipRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                            {/*<View style={{backgroundColor: '#FC866C', position: 'absolute', top: 0, right: 0, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: width/15, height: width/15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF'}}>{ guarantorshipRequests?.length }</Text>
                                        </View>*/}
                                            <Text allowFontScaling={false} style={{ flex: 4, color: '#336DFF', fontSize: 11.5, marginLeft: 10, fontFamily: 'Poppins_600SemiBold' }}>
                                                Guarantorship Requests
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 + 1 }}>
                                                <Image
                                                    source={require('../../assets/images/Guarantorship-Requests.jpg')}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                )
                            case 2:
                                return (
                                    <View style={{ display: 'flex', flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                        <TouchableOpacity onPress={() => navigation.navigate('FavouriteGuarantors')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, height: 120, marginRight: 10, borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 25, position: 'relative'  }}>
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#336DFF', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10, marginRight: 10 }}>
                                                Favorite Guarantors
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <Image
                                                    source={require('../../assets/images/favourite-guarantors.jpg')}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => navigation.navigate('WitnessRequests')} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, width: (width/2) - 25, borderColor: '#CCCCCC', borderWidth: 1, height: 120, marginLeft: 10, borderRadius: 25, position: 'relative' }}>
                                            {/*<View style={{backgroundColor: '#FC866C', position: 'absolute', top: 0, right: 0, paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: width/15, height: width/15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#FFFFFF'}}>{ witnessRequests?.length }</Text>
                                        </View>*/}
                                            <Text allowFontScaling={false} style={{ flex: 3, color: '#336DFF', fontSize: 11.5, fontFamily: 'Poppins_600SemiBold',  marginLeft: 10, marginRight: 10 }}>
                                                Witness Requests
                                            </Text>
                                            <View  style={{ flex: 1, marginRight: width/20 }}>
                                                <Image
                                                    source={require('../../assets/images/Witness-Requests.jpg')}
                                                />
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

                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: '#FFFFFF', paddingHorizontal: 20}}>
                        <Text allowFontScaling={false} style={{fontFamily: 'Poppins_500Medium', color: '#8d8e93', fontSize: 12, padding: 5}}>Email</Text>
                        <Controller
                            control={control}
                            rules={{
                                required: true,
                                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
                            }}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    allowFontScaling={false}
                                    style={styles.input}
                                    value={value}
                                    autoFocus={false}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    onChange={() => clearErrors()}
                                    placeholder="Your Email"
                                    keyboardType="email-address"
                                    secureTextEntry={true}
                                />
                            )}
                            name="email"
                        />
                        {
                            errors.email &&
                            <Text  allowFontScaling={false}  style={styles.error}>{errors.email?.message ? errors.email?.message : 'Invalid Email'}</Text>
                        }
                        <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', color: '#C0C2C9', fontSize: 12, paddingHorizontal: 10, paddingVertical: 15}}>Kindly add your email address to proceed.</Text>
                        <TouchableOpacity disabled={loading} onPress={handleSubmit(onSubmit, onError)} style={{padding: 10, backgroundColor: '#3D889A', borderRadius: 20}}>
                            <Text allowFontScaling={false} style={{textAlign: 'center', color: '#FFFFFF', fontSize: 12, fontFamily: 'Poppins_300Light'}}>Save Email</Text>
                        </TouchableOpacity>
                    </BottomSheetScrollView>
                </BottomSheet>

                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </GestureHandlerRootView>
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
        elevation: 1
    },
    subText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_400Regular',
        elevation: 1
    },
    landingBg: {
        top: 0,
        position: 'absolute',
        height: height/1.7
    },
    titleText: {
        fontSize: 22,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_700Bold',
        elevation: 1
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
