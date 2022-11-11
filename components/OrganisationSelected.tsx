import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView
} from "react-native";
import {Controller, useForm} from "react-hook-form";
import {AntDesign, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../screens/Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {OnboardUser, storeState} from "../stores/auth/authSlice";
import {requestPhoneNumber, requestPhoneNumberFormat} from "../utils/smsVerification";
import {store} from "../stores/store";
import {getSecureKey} from "../utils/secureStore";
type FormData = {
    phoneNumber: string
    idNumber: string
    email: string
}
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
const OrganisationSelected = ({tenantId, nav}: {tenantId: string | undefined, nav: NavigationProps}) => {
    const [tab, setTab] = useState<number>(0);
    const {loading} = useSelector((state: { auth: storeState }) => state.auth);
    const dispatch : AppDispatch = useDispatch();
    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>(
        {
            defaultValues: {

            }
        }
    );

    const EmailPhoneTabs = () => {
        return(
            <KeyboardAvoidingView behavior="padding"  style={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 15}}>
                <TouchableOpacity onPress={() => {
                    setTab(0)
                    clearErrors()
                }} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start'
                }}>
                    <Text allowFontScaling={false} style={[{
                        color: tab === 0 ? '#489AAB' : '#c6c6c6',
                        paddingHorizontal: 10
                    }, {
                        borderBottomWidth: tab === 0 ? 2 : 0,
                        borderColor: '#489AAB'
                    }]}>Phone</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    setTab(1)
                    clearErrors()
                }} style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start'
                }}>
                    <Text allowFontScaling={false} style={[{
                        color: tab === 1 ? '#489AAB' : '#c6c6c6',
                        paddingHorizontal: 10
                    }, {
                        borderBottomWidth: tab === 1 ? 2 : 0,
                        borderColor: '#489AAB'
                    }]}>Email</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        )
    };

    const PhoneInput = () => {
        useEffect(() => {
            let start = true
            if (start) {
                getSecureKey("access_token").then(token => {
                    if (token && !getValues("phoneNumber")) {
                        requestPhoneNumber().then(phone => setValue("phoneNumber", phone))
                    }
                })
            }
            return () => {
                start = false
            }
        })
        return (
            <KeyboardAvoidingView behavior="padding"  style={{position: 'relative'}}>
                <TouchableOpacity style={{position: 'absolute', top: '35%', left: '2%', zIndex: 10 }} onPress={() => {
                    clearErrors();
                    nav.navigation.navigate('Countries', {previous: nav.route.name});
                }}>
                    <KeyboardAvoidingView behavior="padding"  style={{padding: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        {
                            nav.route.params?.flag ? <KeyboardAvoidingView behavior="padding"  style={{display: 'flex', flexDirection: 'row'}}>
                                    <Image source={{uri: nav.route.params?.flag}} style={{width: 22, height: 18}}/>
                                    <Text style={{fontSize: 16, marginLeft: 10,
                                        fontFamily: 'Poppins_400Regular',
                                        color: errors.email ? '#d53b39': '#101828'}}>{nav.route.params?.code}</Text>
                                </KeyboardAvoidingView>
                                :
                                <MaterialCommunityIcons name="diving-scuba-flag" size={20} color="#8d8d8d"/>
                        }
                        <AntDesign name="caretdown" size={8} color={nav.route.params?.code ? "#000000" : "#8d8d8d"} style={{marginLeft: 5, paddingBottom: 5}}/>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
                <Controller
                    control={control}
                    rules={{
                        required: true
                    }}
                    render={({field: {onChange, value}}) => (
                        <TextInput
                            style={{
                                ...styles.input,
                                color: errors.phoneNumber ? '#d53b39': '#101828',
                                borderColor: errors.phoneNumber ? '#d53b39': '#E3E5E5',
                                paddingLeft: nav.route.params?.flag ? 100 : 60
                            }}
                            keyboardType="number-pad"
                            onChangeText={onChange}
                            value={value}
                            autoFocus={false}
                            placeholder="Enter Phone Number"
                            maxLength={12}
                            editable={!loading}
                        />
                    )}
                    name="phoneNumber"
                />
            </KeyboardAvoidingView>
        )
    };

    const EmailInput = () => {
        return (
            <KeyboardAvoidingView behavior="padding" >
                <Controller
                    control={control}
                    rules={{
                        required: true
                    }}
                    render={( { field: { onChange, value } }) => (
                        <TextInput
                            value={value}
                            keyboardType="email-address"
                            style={{
                                ...styles.input,
                                color: errors.email ? '#d53b39': '#101828',
                                borderColor: errors.email ? '#d53b39': '#E3E5E5'
                            }}
                            placeholder="Enter Email"
                            onChangeText={onChange}
                            editable={!loading}
                        />
                    )}
                    name="email"
                />
            </KeyboardAvoidingView>
        )
    };

    const IDInput = () => {
        return (
            <KeyboardAvoidingView behavior="padding" >
                <Controller
                    control={control}
                    rules={{
                        required: true
                    }}
                    render={( { field: { onChange, value } }) => (
                        <TextInput
                            value={value}
                            keyboardType="number-pad"
                            style={{
                                ...styles.input,
                                color: errors.idNumber ? '#d53b39': '#101828',
                                borderColor: errors.idNumber ? '#d53b39': '#E3E5E5'
                            }}
                            placeholder="Enter ID Number"
                            onChangeText={onChange}
                            editable={!loading}
                        />
                    )}
                    name="idNumber"
                />
            </KeyboardAvoidingView>
        )
    }

    const SubmitBtn = () => {
        return (
            <KeyboardAvoidingView behavior="padding"  style={{ paddingVertical: 20 }}>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} style={{alignSelf: 'flex-end'}} >
                    {   !loading ?
                        <Ionicons name="arrow-forward-circle" size={70} color="#489AAB" />
                        :
                        <KeyboardAvoidingView behavior="padding"  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC', borderRadius: 50, width: 65, height: 65}}>
                            <RotateView color="#FFFFFF"/>
                        </KeyboardAvoidingView>
                    }
                </TouchableOpacity>
            </KeyboardAvoidingView>
        )
    };

    const SectionPerTenant = () => {
        switch (tenantId) {
            case 't72767': // imarisha
                return (
                    <KeyboardAvoidingView behavior="padding"  style={{ position: 'relative' }}>
                        <EmailPhoneTabs/>
                        {
                            tab === 1 &&
                            <EmailInput/>
                        }

                        {
                            tab === 0 &&
                            <PhoneInput/>
                        }

                        {
                            (errors.email) &&
                            <Text  allowFontScaling={false}  style={styles.error}>{errors.email.message ? errors.email.message : 'Required'}</Text>
                        }
                        {
                            (errors.phoneNumber) &&
                            <Text allowFontScaling={false}
                                  style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Required'}</Text>
                        }
                    </KeyboardAvoidingView>
                )
            case 't74411': // wanaanga
                return (
                    <KeyboardAvoidingView behavior="padding"  style={{ position: 'relative' }}>
                        <PhoneInput/>
                        {
                            (errors.phoneNumber) &&
                            <Text allowFontScaling={false}
                                  style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Required'}</Text>
                        }
                    </KeyboardAvoidingView>
                )
            case 't10099': // centrino
                return (
                    <KeyboardAvoidingView behavior="padding"  style={{ position: 'relative' }}>
                        <IDInput/>
                        {
                            (errors.idNumber) &&
                            <Text allowFontScaling={false} style={styles.error}>{errors.idNumber.message ? errors.idNumber.message : 'Required'}</Text>
                        }
                    </KeyboardAvoidingView>
                )
            default:
                return (
                    <></>
                )
        }
    }

    const onSubmit =  async (value: any): Promise<void> => {
        let phone = "";
        let id = "";
        let email = "";

        if (value.phoneNumber) {
            const isPh = /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{3}[]?$/i.test(value.phoneNumber);

            if (!isPh) {
                setError('phoneNumber', {type: 'custom', message: 'Please provide a valid phone number'});
                return
            }

            const phoneDataJson = await requestPhoneNumberFormat(nav.route.params?.alpha2Code, value.phoneNumber);

            const {country_code, phone_no} = JSON.parse(phoneDataJson);

            phone = `${country_code}${phone_no}`;
        }

        if (value.idNumber) {
            const isId = /^\d+$/i.test(value.idNumber)

            if (!isId) {
                setError('idNumber', {type: 'custom', message: 'Please provide a valid ID number'});
                return
            }

            id = value.idNumber
        }

        if (value.email) {
            const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value.email)

            if (!isEmail) {
                setError('email', {type: 'custom', message: 'Please provide a valid email address'});
                return
            }

            email = value.email
        }

        if (phone !== "") {
            onboard("phoneNumber", `?identifierType=PHONE_NUMBER&memberIdentifier=${phone}`)
        }

        if (email !== "") {
            onboard("email", `?identifierType=EMAIL&memberIdentifier=${email}`)
        }

        if (id !== "") {
            onboard("idNumber", `?identifierType=ID_NUMBER&memberIdentifier=${id}`)
        }

    }

    const onboard = (context: "email" | "phoneNumber" | "idNumber", qr: string) => {
        dispatch(OnboardUser(qr)).then((response: any) => {
            switch (response.type) {
                case "OnboardUser/rejected":
                    setError(context, {type: 'custom', message: response.error.message})
                    break;
                case "OnboardUser/fulfilled":
                    // navigate to otp
                    if (response.payload === "") {
                        setError(context, {type: 'custom', message: "Member Details Unavailable"})
                    } else {
                        // navigate to otp
                        console.log('success', response.payload)
                    }
                    break;
            }
        }).catch(error => {
            setError(context, {type: 'custom', message: error.message})
        })
    }

    return (
        <KeyboardAvoidingView behavior="padding" >
            <SectionPerTenant/>
            {tenantId && <SubmitBtn/>}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#101828',
        borderRadius: 8,
        height: 50,
        marginTop: 20,
        paddingLeft: 22,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
        color: '#757575'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        marginTop: 5,
        alignSelf: 'flex-end'
    },
});

export default OrganisationSelected;