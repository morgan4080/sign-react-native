import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useAppDispatch, useClientSettings, useLoading, useMember} from "../../stores/hooks";
import {FieldError, useForm} from "react-hook-form";
import React, {useEffect, useMemo, useState} from "react";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {editMember, LoadOrganisation, resubmitForSigning, submitLoanRequest} from "../../stores/auth/authSlice";
import {showSnack} from "../../utils/immediateUpdate";
import SegmentedButtons from "../../components/SegmentedButtons";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";
import GenericModal from "../../components/GenericModal";
import Container from "../../components/Container";
import {View,Text} from "react-native";
import {getSecureKey} from "../../utils/secureStore";

type NavigationProps = NativeStackScreenProps<any>

export type ErrorsType = {message: string; code: number; errorType: string; isTechnical: boolean}[]
const LoanConfirmation = ({navigation, route}: NavigationProps) => {
    const dispatch = useAppDispatch();

    const [clientSettings] = useClientSettings();

    const [loading] = useLoading();

    const [member] = useMember();

    const [routeParams, setRouteParams] = useState<Record<string, any>>({});

    type TypeGuarantor = { contact_id: string; memberNumber: string; memberRefId: string; name: string; phone: string; committedAmount?: string };

    const makeLoanRequestData = async () => {
        let code = route.params?.category.options.filter((op: any) => op.selected)[0].options.filter((o: any) => o.selected)[0];
        const { witnessRefId, witnessMemberNo } = route.params?.witnesses.reduce((acc: any, current: any) => {
            acc = {
                witnessRefId: current.memberRefId,
                witnessMemberNo: current.memberNumber
            };
            return acc;
        }, {});

        const guarantorList = route.params?.guarantors.reduce((acc: {memberNumber: string, memberRefId: string, committedAmount?: string}[], current: TypeGuarantor) => {
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
                    value: route.params?.loanDetails.desiredPeriod ? route.params?.loanDetails.desiredPeriod : ""
                },
                repayment_period: {
                    value: route.params?.loanDetails.desiredPeriod ? route.params?.loanDetails.desiredPeriod : ""
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
                    value: "" // disbursement mode { cheque, my account , EFT} disbursement_mode ? disbursement_mode :
                },
                repayment_mode: {
                    value: "" // repayment mode {checkoff, cash pay bill, standing offer} repayment_mode ? repayment_mode :
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

        setRouteParams({
            ...payload
        })
    };

    const makeDefaults = () => ({
        id_number: member ? member.idNumber : "",
        phone_number: routeParams ? routeParams.phoneNumber : "",
        email: member ? member.email : "",
        member_no: routeParams ? routeParams.memberNumber : "",
        loan_amount: routeParams ? routeParams.loanAmount : "",
        repayment_period: routeParams && routeParams.details ? routeParams.details.loanPeriod.value : "",
        first_name: member ? member.firstName : "",
        last_name: member ? member.lastName : "",
        loan_purpose_1: routeParams && routeParams.details ? routeParams.details.loan_purpose_1.value : "",
        loan_purpose_2: routeParams && routeParams.details ? routeParams.details.loan_purpose_2.value : "",
        loan_purpose_3: routeParams && routeParams.details ? routeParams.details.loan_purpose_3.value : "",
        disbursement_mode: routeParams && routeParams.details ? routeParams.details.disbursement_mode.value : "",
        repayment_mode: routeParams && routeParams.details ? routeParams.details.repayment_mode.value : "",
    });

    const {
        control,
        watch,
        getValues,
        setValue,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<Record<string, any>>({
        defaultValues: useMemo(() => makeDefaults(), [routeParams])
    });

    useEffect(() => {
        reset(makeDefaults());
    }, [routeParams]);

    useEffect(() => {
        makeLoanRequestData().catch(error => {
            console.warn(JSON.stringify(error))
        })
    },[route.params]);

    const [includesTabs, setIncludesTabs] = useState<boolean>(true);

    const [formData, setFormData] = useState<Record<string, any>>({});

    const [buttons, setButtons] = useState<{id: number; label: string; selected: boolean}[]>([
        {
            id: 1,
            label: "User Information",
            selected: true
        },
        {
            id: 2,
            label: "Loan Information",
            selected: false
        },
    ]);

    const [modalVisible, setModalVisible] = useState(false);

    useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    useEffect(() => {
        dispatch(LoadOrganisation())
            .catch((error) => showSnack(error.message, "ERROR"))
    }, []);

    useEffect(() => {
        if (clientSettings && clientSettings.details) {
            // AFTER CAPTURING THE INFO REQUIRED OR CONFIRMING NAVIGATE TO navigation.navigate('LoanProducts')
            const formObjectRequired = Object.keys(clientSettings.details).reduce((accumulator: Record<string, Record<string, any>>, currentValue) => {
                if (clientSettings.details[currentValue].value === "true") {
                    accumulator[currentValue] = clientSettings.details[currentValue]
                }
                return accumulator
            }, {})

            let formDataArray: string[] = []

            if (formObjectRequired) {
                const filterResultRequired = Object.keys(formObjectRequired).filter(property =>
                    property !== "loan_type" &&
                    property !== "witness_phone_number" &&
                    property !== "witness_memberNo" &&
                    property !== "witness_fullName" &&
                    property !== "other_sacco" &&
                    property !== "deposits" &&
                    property !== "loan_purpose_3" &&
                    property !== "loan_purpose_2" &&
                    property !== "loan_purpose_1" &&
                    property !== "member_no" &&
                    property !== "repayment_period_words" &&
                    property !== "net_salary" &&
                    property !== "gross_salary" &&
                    property !== "loan_number" &&
                    property !== "loan_amount_words" &&
                    property !== "repayment_period" &&
                    property !== "repayment_mode" &&
                    property !== "disbursement_mode" &&
                    property !== "applicant_name" &&
                    property !== "mname" &&
                    property !== "loan_amount"
                )
                formDataArray = [...formDataArray, ...filterResultRequired]
            }

            const uniqueObject = Object.fromEntries(formDataArray.reduce((acc: Map<string, string>, currentValue) => {
                acc.set(currentValue, "");
                return acc
            }, new Map()))

            setFormData({
                first_name: member?.firstName,
                last_name: member?.lastName,
                ...uniqueObject,
                disbursement_mode: "",
                repayment_mode: "",
            })
        }
    }, [clientSettings]);

    const genLabel = (key: string) => {
        /*if (key.includes("employer") || key.includes("business")) {
            setIncludesTabs(true)
        }*/
        if (key === 'repayment_period') return "Repayment period (Months)"
        if (key === 'id_number') {
            const splitter = key.split("_")
            return splitter[0].toUpperCase() + " " + splitter[1]
        }
        return key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
    };

    const [pendingReason, setPendingReason] = useState("");
    const [LRErrors, setLRErrors] = useState<ErrorsType>([]);

    const toggleButton = (button: { id: number; label: string; selected: boolean; }) => {
        let b = buttons.reduce((acc: { selected: boolean; id: number; label: string; }[], currentBtn) => {
            if (currentBtn.id === button.id) {
                let bt = {
                    ...currentBtn,
                    selected: true
                }

                acc.push(bt)
            } else {
                let bt = {
                    ...currentBtn,
                    selected: false
                }

                acc.push(bt)
            }
            return acc
        }, [])
        setButtons(b)
    };

    const disbursement_modes = [
        {
            name: "Cheque",
            value: "Cheque",
            selected: false
        },
        {
            name: "My Account",
            value: "My Account",
            selected: false
        },
        {
            name: "EFT",
            value: "EFT",
            selected: false
        }
    ];

    const repayment_modes = [
        {
            name: "Checkoff",
            value: "Checkoff",
            selected: false
        },
        {
            name: "Paybill",
            value: "Paybill",
            selected: false
        },
        {
            name: "Standing Order",
            value: "Standing Order",
            selected: false
        }
    ];

    const onSubmit = async (dataObject: any) => {
        if (routeParams && dataObject) {
            // Changes on this data should update member and re-fetch member

            try {
                type memberPayloadType = {firstName: string, lastName: string, phoneNumber: string, idNumber: string, email: string, memberRefId?: string}

                const payload: memberPayloadType = {
                    firstName: dataObject.first_name,
                    lastName: dataObject.last_name,
                    idNumber: dataObject.id_number,
                    phoneNumber: dataObject.phone_number,
                    email: dataObject.email,
                    memberRefId: member?.refId
                }

                await dispatch(editMember(payload));
            } catch (e) {
                console.warn("Update Member Error", JSON.stringify(e))
            }

            // data to submit to loan request api after member has been updated

            let payloadLR = {
                ...routeParams
            };
            payloadLR.details.disbursement_mode.value = dataObject.disbursement_mode;
            payloadLR.details.repayment_mode.value = dataObject.repayment_mode;

            try {
                const response: any = await dispatch(submitLoanRequest({...payloadLR}));
                // console.log('submitLoanRequest response', JSON.stringify(response));
                if (response.type === 'submitLoanRequest/fulfilled') {
                    const newPayload: any = response.payload;
                    if (response.payload.readableErrorMessage) {
                        setPendingReason(response.payload.readableErrorMessage)
                        setModalVisible(true);
                    } else if (response.payload.pendingReason || response.payload.errors.length > 0) {
                        setPendingReason(response.payload.pendingReason);
                        if (response.payload.errors instanceof Array) setLRErrors(response.payload.errors);
                        setModalVisible(true);
                    } else if (newPayload) {
                        if (newPayload.hasOwnProperty('pdfThumbNail')) {
                            navigation.navigate('LoanRequest', response.payload);
                        } else {

                            // resubmit for signing
                            const refId: any = response.payload.refId;

                            const res = await dispatch(resubmitForSigning(refId));

                            if (res.type === 'resubmitForSigning/fulfilled') {
                                navigation.navigate('LoanRequest', response.payload);
                            } else {
                                console.warn(res);
                                setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
                                // setLoanError("Your Loan Request has been received successfully, but it's in a pending state. One of our agents will follow up within 48 hours.");
                                // setContext("loanRequestError");
                                setModalVisible(true)
                            }
                        }
                    } else {
                        setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
                        // setLoanError("Your Loan Request has been received successfully, but it's in a pending state. One of our agents will follow up within 48 hours.");
                        // setContext("loanRequestError");
                        setModalVisible(true)
                    }
                } else if (response.type === "submitLoanRequest/rejected") {
                    if (response.error.message) {
                        setPendingReason(response.error.message)
                        setModalVisible(true)
                    } else {
                        setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
                        setModalVisible(true)
                    }
                    // setLoanError(response.error.message ? response.error.message : "Your Loan Request has been received successfully, but it's in a pending state. One of our agents will follow up within 48 hours");
                    // setContext("loanRequestError");
                }
            } catch (error: any) {
                if (error.message) {
                    setPendingReason(error.message)
                    setModalVisible(true)
                } else if (error.error.message) {
                    setPendingReason(error.error.message)
                    setModalVisible(true)
                } else {
                    setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
                    setModalVisible(true)
                }
                // setLoanError(error.error.message ? error.error.message : "Your Loan Request has been received successfully, but it's in a pending state. One of our agents will follow up within 48 hours");
                // setContext("loanRequestError");
            }
        }
    };

    return (
        <Container
            segmentedButtons={includesTabs ? <SegmentedButtons buttons={buttons} toggleButton={toggleButton} /> : null}
        >
            {
                buttons.map((button, index) => {
                    if(button.id === 2 && button.selected) {
                        return (
                            <View key={index} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 10, padding: 10}}>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Loan Type:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.loanProduct.name}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Months:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredPeriod}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Amount:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredAmount}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Guarantors:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.guarantors.map((guarantor: TypeGuarantor) => (`${guarantor.name}, `))}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Witness:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.witnesses.map((witness: TypeGuarantor) => (`${witness.name}, `))}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Category:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{route.params?.category.name}</Text>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%' }}>Purpose:</Text>
                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 15, marginBottom: 10, width: '50%', textAlign: 'right'  }}>{
                                        route.params?.category.options.map((op: any) => {
                                            if (op.selected) {
                                                const subs = op.options.map((o: any) => {
                                                    if (o.selected) {
                                                        return ` ${o.name}`
                                                    }
                                                }).toString();
                                                return `${op.name + ':' + subs.replace(/,{3,}/g, '')}`;
                                            }
                                        })
                                    }</Text>
                                </View>
                            </View>
                        )
                    }

                    if (button.id === 1 && button.selected) {
                        return (
                            <View key={index}>
                                {Object.keys(formData).map((key, i) =>
                                    {
                                        if (key === 'disbursement_mode') {
                                            return (
                                                <TextField key={i} field={key} label={genLabel(key)} val={getValues} watch={watch}
                                                           control={control} error={errors[`${key}`]as FieldError} required={true} options={disbursement_modes} setVal={setValue} />
                                            )
                                        }
                                        if (key === 'repayment_mode') {
                                            return (
                                                <TextField key={i} field={key} label={genLabel(key)} val={getValues} watch={watch}
                                                           control={control} error={errors[`${key}`]as FieldError} required={true} options={repayment_modes} setVal={setValue} />
                                            )
                                        }
                                        return (
                                            <TextField key={i} field={key} label={genLabel(key)} val={getValues} watch={watch}
                                                       control={control} error={errors[`${key}`] as FieldError} required={true}/>
                                        )
                                    }
                                )}
                                <TouchableButton loading={loading} label={"Submit Loan Request"} onPress={handleSubmit(onSubmit)} />
                                <View style={{position: 'absolute', bottom: -10}}>
                                    <GenericModal modalVisible={modalVisible} setModalVisible={setModalVisible} title={"Pending Reason"} description={pendingReason} lrErrors={LRErrors} cb={(option) => {
                                        navigation.navigate("UserProfile")
                                    }}/>
                                </View>
                            </View>
                        )
                    }
                })
            }
        </Container>
    )
};


export default LoanConfirmation;
