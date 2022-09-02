import {
    Dimensions, NativeModules,
    Platform,
    SafeAreaView,
    ScrollView, StatusBar,
    StatusBar as Bar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {resubmitForSigning, storeState, submitLoanRequest} from "../../stores/auth/authSlice";
import {Ionicons} from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from 'expo-linking';
import {RotateView} from "../Auth/VerifyOTP";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import BottomSheet, {BottomSheetRefProps, MAX_TRANSLATE_Y} from "../../components/BottomSheet";
import {Controller, useForm} from "react-hook-form";
import {useCallback, useEffect, useRef, useState} from "react";
import {Picker} from "@react-native-picker/picker";
import configuration from "../../utils/configuration";
const { width, height } = Dimensions.get("window");
type FormData = {
    disbursement_mode: string,
    repayment_mode: string
}
type NavigationProps = NativeStackScreenProps<any>

export default function LoanConfirmation({navigation, route}: NavigationProps) {
    const { loading, user, member, tenants, selectedTenantId } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();

    const {
        control,
        watch,
        handleSubmit,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>();

    const [disbursement_mode, set_disbursement_mode] = useState<string>('Cheque');
    const [repayment_mode, set_repayment_mode] = useState<string>('Checkoff');
    const [context, setContext] = useState<string>("");

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            (async () => {
                switch (name) {
                    case 'disbursement_mode':
                        if (type === 'change') {
                            set_disbursement_mode(`${value.disbursement_mode}`)
                        }
                        break;
                    case 'repayment_mode':
                        if (type === 'change') {
                            set_repayment_mode(`${value.repayment_mode}`)
                        }
                        break;
                }
            })()
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const settings = configuration.find(config => config.tenantId === (tenant ? tenant.tenantId : user?.tenantId));

    const ref = useRef<BottomSheetRefProps>(null);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const makeLoanRequest = async () => {
        let code = route.params?.category.options.filter((op: any) => op.selected)[0].options.filter((o: any) => o.selected)[0];
        const { witnessRefId, witnessMemberNo } = route.params?.witnesses.reduce((acc: any, current: any) => {
            acc = {
                witnessRefId: current.memberRefId,
                witnessMemberNo: current.memberNumber
            };
            return acc;
        }, {});

        const guarantorList = route.params?.guarantors.reduce((acc: {memberNumber: string, memberRefId: string, committedAmount?: string}[], current: { contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string, committedAmount?: string }) => {
            if (current.committedAmount) {
                acc.push({
                    memberNumber: current.memberNumber,
                    memberRefId: current.memberRefId,
                    committedAmount: current.committedAmount
                });
            } else {
                acc.push({
                    memberNumber: current.memberNumber,
                    memberRefId: current.memberRefId
                });
            }
            return acc;
        }, []);

        let loan_purpose_2: string[] = [];

        let loan_purpose_3: string[] = [];

        route.params?.category.options.map((op: any) => {
            if (op.selected) {
                op.options.map((o: any) => {
                    if (o.selected) {
                        return loan_purpose_3.push(o.name)
                    }
                })

                loan_purpose_2.push(op.name)
            }
        });

        const payload = {
            "details": {
                loan_purpose_1: {
                    value: route.params?.category.name
                },
                loan_purpose_2: {
                    value: loan_purpose_2.length > 0 ? loan_purpose_2[0] : ''
                },
                loan_purpose_3: {
                    value: loan_purpose_3.length > 0 ? loan_purpose_3[0] : ''
                },
                loanPurposeCode: {
                    value: code.code
                },
                loanPeriod: {
                    value: route.params?.loanDetails.desiredAmount ? route.params?.loanDetails.desiredPeriod : ""
                },
                repayment_period: {
                    value: route.params?.loanDetails.desiredAmount ? route.params?.loanDetails.desiredPeriod : ""
                },
                employer_name: {
                    value: route.params?.employerPayload?.employerName ? route.params?.employerPayload?.employerName : ""
                },
                employment_type: {
                    value: '' // employment type if any
                },
                employment_number: {
                    value: route.params?.employerPayload?.serviceNo ? route.params?.employerPayload?.serviceNo : ""
                },
                business_location: {
                    value: route.params?.businessPayload?.businessLocation ? route.params?.businessPayload?.businessLocation : ""
                },
                business_type: {
                    value: route.params?.businessPayload?.businessType ? route.params?.businessPayload?.businessType : ""
                },
                net_salary: {
                    value: route.params?.employerPayload?.netSalary ? route.params?.employerPayload?.netSalary : ""
                },
                gross_salary: {
                    value: route.params?.employerPayload?.grossSalary ? route.params?.employerPayload?.grossSalary : ""
                },
                disbursement_mode: {
                    value: disbursement_mode ? disbursement_mode : "" // disbursement mode { cheque, my account , EFT}
                },
                repayment_mode: {
                    value: repayment_mode ? repayment_mode : "" // repayment mode {checkoff, cash pay bill, standing offer}
                },
                loan_type: {
                    value: route.params?.loanProduct.name ? route.params?.loanProduct.name : ""
                },
                kra_pin: {
                    value: route.params?.employerPayload?.kraPin ? route.params?.employerPayload?.kraPin : route.params?.businessPayload?.kraPin ? route.params?.businessPayload?.kraPin : ""
                }
            },
            "loanProductName": route.params?.loanProduct.name,
            "loanProductRefId": route.params?.loanProduct.refId,
            "selfCommitment": 0,
            "loanAmount": route.params?.loanDetails.desiredAmount,
            "memberRefId": member?.refId,
            "memberNumber": member?.memberNumber,
            "phoneNumber": member?.phoneNumber,
            "witnessRefId": witnessRefId,
            "witnessMemberNo": witnessMemberNo,
            "guarantorList": guarantorList
        };

        if (payload.witnessRefId === undefined) delete payload.witnessRefId;

        const CSTM = NativeModules.CSTM;

        try {
            const response: any = await dispatch(submitLoanRequest(payload));

            if (response.type === 'submitLoanRequest/fulfilled') {
                const newPayload: any = response.payload;

                if (newPayload) {
                    if (newPayload.hasOwnProperty('pdfThumbNail')) {
                        navigation.navigate('LoanRequest', response.payload);
                    } else {
                        // resubmit for signing
                        const refId: any = response.payload.refId;

                        const res = await dispatch(resubmitForSigning(refId));

                        if (res.type === 'resubmitForSigning/fulfilled') {
                            navigation.navigate('LoanRequest', response.payload);
                        } else {
                            console.log(res)
                            CSTM.showToast('Loan Request resubmit failed');
                        }
                    }
                } else {
                    CSTM.showToast('Loan Request failed');
                }
            } else {
                console.log('loan request error', response)
                CSTM.showToast('Loan Request failed');
            }
        } catch (error: any) {
            console.log('loan request error', error)
            CSTM.showToast('Loan Request failed');
        }
    }

    const onPress = useCallback(async (ctx: string) => {
        if (settings && settings.repaymentDisbursementModes) {
            setContext(ctx)
            const isActive = ref?.current?.isActive();
            if (isActive) {
                ref?.current?.scrollTo(0);
            } else {
                ref?.current?.scrollTo(MAX_TRANSLATE_Y);
            }
        } else {
            await makeLoanRequest()
        }
    }, []);

    const submitModes = async () => {
        // set modes
        await makeLoanRequest()
    }

    if (fontsLoaded) {
        return (
            <GestureHandlerRootView style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
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
                            <TouchableOpacity disabled={loading} onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                        </View>
                        <SafeAreaView style={{ flex: 1, width, height: 11/12 * height, backgroundColor: 'rgba(50,52,146,0.12)', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
                                <Text allowFontScaling={false} style={styles.headTitle}>Confirm</Text>
                                <Text allowFontScaling={false} style={styles.subtitle}>Loan Request to <Text allowFontScaling={false} style={{color: '#489AAB', textDecorationStyle: 'dotted', textDecorationLine: 'underline'}}>{ `${user?.companyName}` }</Text></Text>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Loan Type:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanProduct.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Months:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredPeriod}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Amount:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredAmount}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Guarantors:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.guarantors.length}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%' }}>Witness:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.witnesses.length}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%' }}>Category:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{route.params?.category.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%' }}>Purpose:</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{
                                            route.params?.category.options.map((op: any) => {
                                                if (op.selected) {
                                                    let subs = op.options.map((o: any) => {
                                                        if (o.selected) {
                                                            return ` ${o.name}`
                                                        }
                                                    }).toString()
                                                    return `${op.name + ':' + subs}`
                                                }
                                            })
                                        }</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                        <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={loading} onPress={() => onPress('repaymentDisbursement')} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: loading ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                {loading && <RotateView/>}
                                <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <BottomSheet ref={ref}>
                    <SafeAreaView style={{display: 'flex', alignItems: 'center', width, height: (height + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)) + (height/11) }}>
                        {
                            context === "repaymentDisbursement" &&
                            <View style={{display: 'flex', alignItems: 'center', width}}>
                                <Text allowFontScaling={false} style={[{ paddingHorizontal: 30, marginTop: 10 } ,styles.subtitle]}>Add Disbursement/Repayment Modes</Text>
                                <Text style={{ fontSize: 12, color: '#4d4d4d', fontFamily: 'Poppins_400Regular', marginTop: 10, marginBottom: 5, textAlign: 'left', alignSelf: 'flex-start', paddingHorizontal: 30 }} allowFontScaling={false}>Disbursement Mode</Text>
                                <Controller
                                    control={control}
                                    render={( {field: {onChange, onBlur, value}}) => (
                                        <View style={styles.input0}>
                                            <Picker
                                                itemStyle={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                                style={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                                onBlur={onBlur}
                                                selectedValue={value}
                                                onValueChange={(itemValue, itemIndex) => setValue('disbursement_mode', itemValue)}
                                                mode="dropdown"
                                            >
                                                {[
                                                    {
                                                        name: "Cheque",
                                                        value: "Cheque"
                                                    },
                                                    {
                                                        name: "My Account",
                                                        value: "My Account"
                                                    },
                                                    {
                                                        name: "EFT",
                                                        value: "EFT"
                                                    }
                                                ].map((p, i) =>(
                                                    <Picker.Item key={i} label={p.name} value={p.value} color='#767577' fontFamily='Poppins_500Medium' />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}
                                    name="disbursement_mode"
                                />
                                <Text allowFontScaling={false} style={{ fontSize: 12, color: '#4d4d4d', fontFamily: 'Poppins_400Regular', marginTop: 10, marginBottom: 5, textAlign: 'left', alignSelf: 'flex-start', paddingHorizontal: 30 }}>Repayment Mode</Text>
                                <Controller
                                    control={control}
                                    render={( {field: {onChange, onBlur, value}}) => (
                                        <View style={styles.input0}>
                                            <Picker
                                                itemStyle={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                                style={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                                onBlur={onBlur}
                                                mode="dropdown"
                                                selectedValue={value}
                                                onValueChange={(itemValue, itemIndex) => setValue('repayment_mode', itemValue)}
                                            >
                                                {[
                                                    {
                                                        name: "Checkoff",
                                                        value: "Checkoff"
                                                    },
                                                    {
                                                        name: "Cash Paybill",
                                                        value: "Cash Paybill"
                                                    },
                                                    {
                                                        name: "Standing Offer",
                                                        value: "Standing Offer"
                                                    }
                                                ].map((p, i) =>(
                                                    <Picker.Item key={i} label={p.name} value={p.value} color='#767577' fontFamily='Poppins_500Medium' />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}
                                    name="repayment_mode"
                                />
                            </View>
                        }
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={loading} onPress={() => submitModes()} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: loading ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                {loading && <RotateView/>}
                                <Text allowFontScaling={false} style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </BottomSheet>
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
        position: 'relative'
    },
    headTitle: {
        textAlign: 'left',
        color: '#489AAB',
        fontFamily: 'Poppins_700Bold',
        fontSize: 22,
        marginTop: 22,
    },
    subtitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        marginBottom: 5
    },
    buttonText: {
        fontSize: 15,
        marginLeft: 5,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 45,
        width: '90%',
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
    },
})
