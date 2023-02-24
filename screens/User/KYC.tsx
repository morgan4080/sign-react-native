import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useForm} from "react-hook-form";
import Container from "../../components/Container";
import {useAppDispatch, useClientSettings, useLoading, useMember, useUser} from "../../stores/hooks";
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
import {LoadOrganisation} from "../../stores/auth/authSlice";
import {useEffect} from "react";
import {showSnack} from "../../utils/immediateUpdate";
import useGenericState from "../../utils/useGenericState";
import TouchableButton from "../../components/TouchableButton";
type NavigationProps = NativeStackScreenProps<any>

const KYC = ({navigation, route}: NavigationProps) => {
    const [clientSettings] = useClientSettings()
    const [loading] = useLoading()
    const [user] = useUser()
    const [member] = useMember()
    const dispatch = useAppDispatch()
    const [formData, setFormData] = useGenericState({})
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
                    if (clientSettings.details[currentValue] && clientSettings.details[currentValue].value) {
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

            setFormData(uniqueObject)
        }
    }, [clientSettings])

    const {
        control,
        watch,
        getValues,
        handleSubmit,
        formState: { errors }
    } = useForm<Record<any, any>>({
        defaultValues: {
            id_number: member ? member.idNumber : "",
            phone_number: user?.phoneNumber ? user?.phoneNumber : user?.username,
            email: member ? member.email : "",
        }
    });

    const genLabel = (key: string) => {
        if (key === 'id_number') {
            const splitter = key.split("_")
            return splitter[0].toUpperCase() + " " + splitter[1]
        }
        return key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
    }

    const onSubmit = () => {
        alert("submitting")
    }

    return (
        <Container>
            {Object.keys(formData).map((key, i) =>
                <TextField key={i} field={key} label={genLabel(key)} val={getValues} watch={watch}
                           control={control} error={errors[`${key}`]} required={true}/>
            )}
            <TouchableButton loading={loading} label={"CONFIRM"} onPress={handleSubmit(onSubmit)} />
        </Container>
    )
}

export default KYC