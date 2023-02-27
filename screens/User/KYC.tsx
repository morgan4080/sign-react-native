import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useForm} from "react-hook-form";
import Container from "../../components/Container";
import {useAppDispatch, useClientSettings, useLoading, useMember, useOrganisations, useUser} from "../../stores/hooks";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import TextField from "../../components/TextField";
import {LoadOrganisation, resubmitForSigning, submitLoanRequest} from "../../stores/auth/authSlice";
import React, {useEffect, useReducer, useState} from "react";
import {showSnack} from "../../utils/immediateUpdate";
import TouchableButton from "../../components/TouchableButton";
import SegmentedButtons from "../../components/SegmentedButtons";
import GenericModal from "../../components/GenericModal";
type NavigationProps = NativeStackScreenProps<any>
const KYC = ({navigation, route}: NavigationProps) => {
    const dispatch = useAppDispatch()

    const [clientSettings] = useClientSettings()
    const [loading] = useLoading()
    const [member] = useMember()

    const {
        control,
        watch,
        getValues,
        handleSubmit,
        formState: { errors }
    } = useForm<Record<string, any>>({
        defaultValues: {
            id_number: member ? member.idNumber : "",
            phone_number: route.params ? route.params.phoneNumber : "",
            email: member ? member.email : "",
            member_no: route.params ? route.params.memberNumber : "",
            loan_amount: route.params ? route.params.loanAmount : "",
            repayment_period: route.params ? route.params.details.loanPeriod.value : "",
            applicant_name: member ? member.fullName : "",
            loan_purpose_1: route.params ? route.params.details.loan_purpose_1.value : "",
            loan_purpose_2: route.params ? route.params.details.loan_purpose_2.value : "",
            loan_purpose_3: route.params ? route.params.details.loan_purpose_3.value : ""
        }
    });

    const [includesTabs, setIncludesTabs] = useState<boolean>(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [buttons, setButtons] = useState<{id: number; label: string; selected: boolean}[]>([
        {
            id: 1,
            label: "Employed",
            selected: true
        },
        {
            id: 2,
            label: "Business",
            selected: false
        },
    ])
    const [modalVisible, setModalVisible] = useState(false);
    useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    })

    useEffect(() => {
        dispatch(LoadOrganisation())
            .catch((error) => showSnack(error.message, "ERROR"))
    }, [])

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
                    // property !== "witness_memberNo" &&
                    // property !== "witness_fullName" &&
                    // property !== "other_sacco" &&
                    property !== "deposits" &&
                    // property !== "loan_purpose_3" &&
                    // property !== "loan_purpose_2" &&
                    // property !== "loan_purpose_1" &&
                    // property !== "member_no" &&
                    property !== "repayment_period_words" &&
                    // property !== "net_salary" &&
                    // property !== "gross_salary" &&
                    property !== "loan_number" &&
                    property !== "loan_amount_words" &&
                    /*property !== "repayment_period" &&
                    property !== "repayment_mode" &&
                    property !== "disbursement_mode" &&
                    property !== "applicant_name" &&*/
                    property !== "mname" /*&&
                    property !== "loan_amount"*/
                )
                formDataArray = [...formDataArray, ...filterResultRequired]
            }

            const uniqueObject = Object.fromEntries(formDataArray.reduce((acc: Map<string, string>, currentValue) => {
                acc.set(currentValue, "");
                return acc
            }, new Map()))

            setFormData(uniqueObject)
        }
    }, [clientSettings])

    const genLabel = (key: string) => {
        if (key.includes("employer") || key.includes("business")) {
            setIncludesTabs(true)
        }
        if (key === 'id_number') {
            const splitter = key.split("_")
            return splitter[0].toUpperCase() + " " + splitter[1]
        }
        return key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
    }

    const [pendingReason, setPendingReason] = useState("")

    const onSubmit = async () => {
        if (route.params) {
            try {
                const response: any = await dispatch(submitLoanRequest({...route.params}));
                console.log('submitLoanRequest payload', JSON.stringify({...route.params}), response);
                console.log('submitLoanRequest response', JSON.stringify(response));
                if (response.type === 'submitLoanRequest/fulfilled') {
                    const newPayload: any = response.payload;
                    if (response.payload.readableErrorMessage) {
                        setPendingReason(response.payload.readableErrorMessage)
                        setModalVisible(true)
                    } else if (response.payload.pendingReason) {
                        setPendingReason(response.payload.pendingReason)
                        setModalVisible(true)
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
                                setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");                                // setLoanError("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
                                // setContext("loanRequestError");
                                setModalVisible(true)
                            }
                        }
                    } else {
                        setPendingReason("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");                        // setLoanError("Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours.");
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
                    // setLoanError(response.error.message ? response.error.message : "Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours");
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
                // setLoanError(error.error.message ? error.error.message : "Your Loan Request has been received successfully but it's in a pending state. One of our agents will follow up within 48 hours");
                // setContext("loanRequestError");
            }
        }
    }

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
    }

    return (
        <Container segmentedButtons={includesTabs ? <SegmentedButtons buttons={buttons} toggleButton={toggleButton} /> : null}>
            {Object.keys(formData).map((key, i) =>
                <TextField key={i} field={key} label={genLabel(key)} val={getValues} watch={watch}
                           control={control} error={errors[`${key}`]} required={true}/>
            )}
            <TouchableButton loading={loading} label={"CONFIRM"} onPress={handleSubmit(onSubmit)} />
            <GenericModal modalVisible={modalVisible} setModalVisible={setModalVisible} title={"Pending Reason"} description={pendingReason} cb={() => {
                navigation.navigate("UserProfile")
            }}/>
        </Container>
    )
}

export default KYC