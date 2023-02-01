import * as React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    NativeModules,
    View,
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
}

const {DeviceInfModule} = NativeModules;

const EmailPhoneTabs = ({setTab, clearErrors, tab}: PropType) => {
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

const PhoneInput = ({errors, control, loading, handleSubmit, onSubmit, clearErrors, nav}: PropType) => {
    return (
        <View style={{position: 'relative'}}>
            <TouchableOpacity style={{position: 'absolute', top: '35%', left: '2%', zIndex: 10 }} onPress={() => {
                clearErrors();
                nav.navigation.navigate('Countries', {previous: nav.route.name});
            }}>
                <View style={{padding: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    {
                        nav.route.params?.flag ? <View style={{display: 'flex', flexDirection: 'row'}}>
                                <Image source={{uri: nav.route.params?.flag}} style={{width: 22, height: 18}}/>
                                <Text allowFontScaling={false} style={{fontSize: 14, marginLeft: 10,
                                    fontFamily: 'Poppins_400Regular',
                                    color: errors.email ? '#d53b39': '#101828'}}>{nav.route.params?.code}</Text>
                            </View>
                            :
                            <MaterialCommunityIcons name="diving-scuba-flag" size={20} color="#8d8d8d"/>
                    }
                    <AntDesign name="caretdown" size={8} color={nav.route.params?.code ? "#000000" : "#8d8d8d"} style={{marginLeft: 5, paddingBottom: 5}}/>
                </View>
            </TouchableOpacity>
            <Controller
                control={control}
                /*rules={{
                    required: true
                }}*/
                render={({field: {onChange, onBlur, value}}) => (
                    <TextInput
                        allowFontScaling={false}
                        style={{
                            ...styles.input,
                            color: errors.phoneNumber ? '#d53b39': '#101828',
                            borderColor: errors.phoneNumber ? '#d53b39': '#E3E5E5',
                            paddingLeft: nav.route.params?.flag ? 100 : 60
                        }}
                        keyboardType="number-pad"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        autoFocus={false}
                        placeholder="Enter Phone Number"
                        maxLength={12}
                        editable={!loading}
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                )}
                name="phoneNumber"
            />
        </View>
    )
};

const EmailInput = ({errors, control, loading, handleSubmit, onSubmit}: PropType) => {
    return (
        <View>
            <Controller
                control={control}
                /*rules={{
                    required: true
                }}*/
                render={( { field: { onChange, onBlur, value } }) => (
                    <TextInput
                        allowFontScaling={false}
                        value={value}
                        keyboardType="email-address"
                        style={{
                            ...styles.input,
                            color: errors.email ? '#d53b39': '#101828',
                            borderColor: errors.email ? '#d53b39': '#E3E5E5'
                        }}
                        onBlur={onBlur}
                        placeholder="Enter Email"
                        onChangeText={onChange}
                        editable={!loading}
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                )}
                name="email"
            />
        </View>
    )
};

const IDInput = ({errors, control, loading, handleSubmit, onSubmit}: PropType) => {
    return (
        <View>
            <Controller
                control={control}
                /*rules={{
                    required: true
                }}*/
                render={( { field: { onChange, value,onBlur } }) => (
                    <TextInput
                        allowFontScaling={false}
                        value={value}
                        keyboardType="number-pad"
                        style={{
                            ...styles.input,
                            color: errors.idNumber ? '#d53b39': '#101828',
                            borderColor: errors.idNumber ? '#d53b39': '#E3E5E5'
                        }}
                        onBlur={onBlur}
                        placeholder="Enter ID Number"
                        onChangeText={onChange}
                        editable={!loading}
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                )}
                name="idNumber"
            />
        </View>
    )
}

 const SubmitBtn = ({handleSubmit, onSubmit, loading}: PropType) => {
        return (
            <View style={{ paddingVertical: 20, position: 'absolute', bottom: 50, right: 20 }}>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} style={{alignSelf: 'flex-end'}} >
                    {   !loading ?
                        <Ionicons name="arrow-forward-circle" size={70} color="#489AAB" />
                        :
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCCCCC', borderRadius: 50, width: 65, height: 65}}>
                            <RotateView color="#FFFFFF"/>
                        </View>
                    }
                </TouchableOpacity>
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
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("phoneNumber", `?identifierType=PHONE_NUMBER&memberIdentifier=${phone}`))
                return
            }

            if (email !== "") {
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("email", `?identifierType=EMAIL&memberIdentifier=${email}`))
                return
            }

            if (id !== "") {
                if (selectedTenant) dispatch(AuthenticateClient(selectedTenant)).finally(() => onboard("idNumber", `?identifierType=ID_NUMBER&memberIdentifier=${id}`))
                return
            }
        } catch (e: any) {
            setError('phoneNumber', {type: 'custom', message: e.message})
        }
    }

    const onboard = async (context: "email" | "phoneNumber" | "idNumber", qr: string) => {
        try {
            const response: any = await dispatch(OnboardUser(qr))
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
                tenantId === 't72767' &&
                <View style={{ position: 'relative' }}>
                    <EmailPhoneTabs setTab={setTab} clearErrors={clearErrors} tab={tab} />
                    {
                        tab === 1 &&
                        <EmailInput errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} />
                    }

                    {
                        tab === 0 &&
                        <PhoneInput errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>
                    }

                    {
                        (errors.email) &&
                        <Text allowFontScaling={false}
                              style={styles.error}>{errors.email.message ? errors.email.message : 'Required'}</Text>
                    }
                    {
                        (errors.phoneNumber) &&
                        <Text allowFontScaling={false}
                              style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Required'}</Text>
                    }
                </View>
            }

            {
                tenantId === 't74411' &&
                <View  style={{ position: 'relative' }}>
                    <PhoneInput errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} clearErrors={clearErrors} nav={nav}/>
                    {
                        (errors.phoneNumber) &&
                        <Text allowFontScaling={false}
                              style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Required'}</Text>
                    }
                </View>
            }

            {
                tenantId === 't10099' &&

                <View style={{ position: 'relative' }}>
                    <IDInput errors={errors} control={control} loading={loading} handleSubmit={handleSubmit} onSubmit={onSubmit} />
                    {
                        (errors.idNumber) &&
                        <Text allowFontScaling={false} style={styles.error}>{errors.idNumber.message ? errors.idNumber.message : 'Required'}</Text>
                    }
                </View>
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
        borderWidth: 1,
        borderColor: '#101828',
        borderRadius: 8,
        height: 50,
        marginTop: 20,
        paddingLeft: 22,
        fontSize: 14,
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
