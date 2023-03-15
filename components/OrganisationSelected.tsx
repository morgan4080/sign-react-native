import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    NativeModules,
    View,
    useWindowDimensions,
    Pressable, Animated,
} from "react-native";
import {Controller, useForm} from "react-hook-form";
import {AntDesign, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../screens/Auth/VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {AuthenticateClient, OnboardUser, storeState} from "../stores/auth/authSlice";
import {requestPhoneNumber, requestPhoneNumberFormat} from "../utils/smsVerification";
import {store} from "../stores/store";
import {saveSecureKey} from "../utils/secureStore";
import Constants from "expo-constants";
import TextField from "./TextField";
import {UseFormWatch} from "react-hook-form/dist/types/form";
import TouchableButton from "./TouchableButton";
type FormData = {
    phoneNumber: string
    idNumber: string
    email: string
}
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
type PropType = {
    errors?: any;
    control?: any;
    loading?: any;
    handleSubmit?: any;
    onSubmit?: any;
    setTab?: any;
    tab?: any;
    clearErrors?: any;
    nav?: any;
    getValues: (field: string) => string | undefined;
    watch: UseFormWatch<Record<string, any>>;
}

const {DeviceInfModule} = NativeModules;

const EmailPhoneTabs = ({setTab, clearErrors, tab}: Pick<PropType, "setTab" | "clearErrors" | "tab">) => {
    return(
        <View style={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 15}}>
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
        </View>
    )
};

const PhoneInput = ({errors, control, getValues, watch, loading, handleSubmit, onSubmit, clearErrors, nav}: PropType) => {
    const { width, height } = useWindowDimensions();
    return (
        <View style={{position: 'relative', display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between"}}>
            <Pressable style={{...styles.input, display: 'flex', flexDirection: 'row', alignItems: 'center', width: width * 0.28, paddingTop: 0}} onPress={() => {
                clearErrors();
                nav.navigation.navigate('Countries', { previous: nav.route.name });
            }}>
                <View style={[styles.inputContainer, styles.shadowProp]}>
                    {
                        nav.route.params?.flag ?
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                                <Image source={{uri: nav.route.params?.flag}} style={{width: 22, height: 18}}/>
                                <TextInput
                                    allowFontScaling={false}
                                    style={styles.input}
                                    value={`+${nav.route.params?.code}`}
                                    editable={false}
                                />
                                <AntDesign name="down" size={12} color="#8d8d8d" />
                            </View>
                            :
                            <>
                                <MaterialCommunityIcons name="diving-scuba-flag" size={20} color="#8d8d8d"/>
                                <AntDesign style={{position: "absolute", right: 10}} name="caretdown" size={20} color="#8d8d8d" />
                            </>
                    }
                </View>
            </Pressable>

            <View style={{width: width * 0.58}}>
                <TextField
                    field={"phoneNumber"}
                    label={"Phone number"}
                    val={getValues}
                    watch={watch}
                    control={control}
                    error={errors.phoneNumber}
                    required={true}
                    rules={{
                        required: {
                            value: true,
                            message: "Phone number is required"
                        }
                    }}
                    keyboardType={"phone-pad"}
                    secureTextEntry={false}
                />
            </View>
        </View>
    )
};

const EmailInput = ({errors, control, loading, handleSubmit, onSubmit, getValues, watch}: PropType) => {
    return (
        <TextField
            field={"email"}
            label={"Email address"}
            val={getValues}
            watch={watch}
            control={control}
            error={errors.email}
            required={true}
            rules={{
                required: {
                    value: true,
                    message: "Email is required"
                },
            }}
            keyboardType={"email-address"}
            secureTextEntry={false}
        />
    )
};

const IDInput = ({errors, control, loading, handleSubmit, onSubmit, getValues, watch}: PropType) => {
    return (
        <TextField
            field={"idNumber"}
            label={"ID number"}
            val={getValues}
            watch={watch}
            control={control}
            error={errors.idNumber}
            required={true}
            rules={{
                required: {
                    value: true,
                    message: "ID number is required"
                },
            }}
            keyboardType={"numeric"}
            secureTextEntry={false}
        />
    )
}

 const SubmitBtn = ({handleSubmit, onSubmit, loading}: Pick<PropType, "handleSubmit" | "onSubmit" | "loading">) => {
        return (
            <View style={{ paddingVertical: 20 }}>
                <TouchableButton loading={loading} label={"Continue"} onPress={handleSubmit(onSubmit)}/>
            </View>
        )
    };
const OrganisationSelected = ({tenantId, nav}: {tenantId: string | undefined, nav: NavigationProps}) => {
    const [tab, setTab] = useState<number>(0);
    const {loading, selectedTenant} = useSelector((state: { auth: storeState }) => state.auth);
    const dispatch : AppDispatch = useDispatch();
    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm<FormData>(
        {
            defaultValues: {

            }
        }
    );

    useEffect(() => {
        let changed = true

        if (changed && tenantId && selectedTenant) {
            if (tenantId === 't72767' && tab === 0 || tenantId === 't74411') {
                requestPhoneNumber().then(phone => setValue("phoneNumber", phone)).catch(error => {
                    console.log(error)
                })
            }
            setTimeout(() => {
                clearErrors()
            }, 2000)
        }
        return () => {
            changed = false
        }
    }, [tenantId])

    const onSubmit =  async (value: any): Promise<void> => {
        try {
            let phone = "";
            let id = "";
            let email = "";

            if (value.phoneNumber) {
                const isPh = /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{3}[]?$/i.test(value.phoneNumber);

                if (!isPh) {
                    setError('phoneNumber', {type: 'custom', message: 'Please provide a valid phone number'});
                    return
                }
                await saveSecureKey('alpha2Code', nav.route.params?.alpha2Code);
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
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("phoneNumber", `?memberIdentifier=${phone}&identifierType=PHONE_NUMBER&force=false`))
                return
            }

            if (email !== "") {
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("email", `?memberIdentifier=${email}&identifierType=EMAIL&force=false`))
                return
            }

            if (id !== "") {
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("idNumber", `?memberIdentifier=${id}&identifierType=ID_NUMBER&force=false`))
                return
            }
        } catch (e: any) {
            setError('phoneNumber', {type: 'custom', message: e.message})
        }
    }

    const onboard = async (context: "email" | "phoneNumber" | "idNumber", qr: string) => {
        try {
            const response: any = await dispatch(OnboardUser(qr));
            switch (response.type) {
                case "OnboardUser/rejected":
                    if (response.payload !== "") {
                        setError(context, {type: 'custom', message: response.payload});
                    } else {
                        setError(context, {type: 'custom', message: response.error.message})
                    }
                    break;
                case "OnboardUser/fulfilled":
                    // navigate to otp
                    if (response.payload === "") {
                        setError(context, {type: 'custom', message: "Member Details Unavailable"})
                    } else {
                        // navigate to otp
                        const deviceId = await DeviceInfModule.getUniqueId();
                        const phoneDataJson = await requestPhoneNumberFormat(nav.route.params?.alpha2Code, response.payload.phoneNumber);

                        const {country_code, phone_no} = JSON.parse(phoneDataJson);

                        console.log('on boarding', JSON.stringify({country_code, phone_no}));

                        await Promise.all([
                            saveSecureKey('phone_number_code', country_code),
                            saveSecureKey('phone_number_without', phone_no),
                        ]);

                        nav.navigation.navigate('OnboardingOTP', {
                            ...response.payload,
                            deviceId,
                            appName: Constants.manifest?.android?.package
                        });
                    }
                    break;
            }
        } catch (error: any) {
            setError(context, {type: 'custom', message: error.message})
        } finally {
            setValue("phoneNumber", "")
            setValue("email", "")
            setValue("idNumber", "")
        }
    }

    return (
        <>

            {
                tenantId === 't72767' ?
                <View style={{ position: 'relative' }}>
                    <EmailPhoneTabs setTab={setTab} clearErrors={clearErrors} tab={tab} />
                    {
                        tab === 1 &&
                        <EmailInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} />
                    }

                    {
                        tab === 0 &&
                        <PhoneInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>
                    }

                </View>

                :

                tenantId === 't10099' ?

                    <IDInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} />

                :
                    tenantId === 't74411' ?

                        <PhoneInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>

                    :
                        tenantId === 't10589' ?


                            <PhoneInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>

                    :

                        tenantId === 't10789' ?


                            <PhoneInput watch={watch} getValues={getValues} errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>

                    :

                    <></>
            }

            {
                tenantId &&
                <SubmitBtn onSubmit={onSubmit} handleSubmit={handleSubmit} loading={loading}/>
            }
        </>
    )
}

const styles = StyleSheet.create({
    input: {
        letterSpacing: 0.4,
        fontSize: 14,
        color: '#000000',
        lineHeight: 10,
        paddingTop: 14,
        fontFamily: 'Poppins_500Medium'
    },

    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        marginTop: 5,
        alignSelf: 'flex-end'
    },

    inputContainer: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        backgroundColor: '#EFF3F4',
        borderRadius: 12,
        width: "100%",
        marginTop: 16,
        height: 56,
        paddingHorizontal: 14
    },

    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});

export default OrganisationSelected;
