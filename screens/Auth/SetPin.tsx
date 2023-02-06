import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Dimensions,
    View,
    StyleSheet,
    TextInput,
    Text,
    StatusBar,
    Pressable,
    NativeModules,
} from "react-native";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {RotateView} from "./VerifyOTP";
import {useDispatch, useSelector} from "react-redux";
import {
    authClient,
    createPin, hasPinCheck, loginUser,
    loginUserType,
    searchByEmail,
    searchByPhone, setAuthState,
    storeState
} from "../../stores/auth/authSlice";
import {Controller, useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {store} from "../../stores/store";
import {saveSecureKey} from "../../utils/secureStore";

const {CSTM} = NativeModules;

const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>;

type FormData = {
    pin: string;
    pinConfirmation: string;
    memberRefId: string;
    access_token: string;
}

const SetPin = ({ navigation, route }: NavigationProps) => {
    const [userFound, setUserFound] = useState<boolean>(false)
    const [errorSMS, setErrorSMS] = useState<string>("")
    const [pinStatus, setPinStatus] = useState<string>("")
    const [authRes, setAuthRes] = useState<any>(null)
    const [searchRes, setSearchRes] = useState<any>(null)
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>({})

    const { loading, selectedTenant } = useSelector((state: { auth: storeState }) => state.auth);

    let {phoneNumber, email, realm, client_secret, isTermsAccepted}: any = route.params;

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let start = true;

        (async () => {
            try {
                const {type, payload} : any = await dispatch(authClient({realm, client_secret}))

                if (type === 'authClient/fulfilled') {
                    setAuthRes(payload);
                    const { access_token } = payload;

                    console.log('access_token_x', access_token);

                    console.log("start member verify", email, phoneNumber);

                    if (phoneNumber && access_token) {
                        let {type, payload, error}: any = await dispatch(hasPinCheck({
                            access_token: access_token,
                            phoneNumber: phoneNumber
                        }));
                        if (payload.pinStatus) {
                            setPinStatus(payload.pinStatus);
                        }
                        const response: any = await dispatch(searchByPhone({phoneNumber, access_token}))
                        console.log('search by phone number response', response);
                        if (response.type === 'searchByPhone/rejected') {
                            CSTM.showToast(response.error.message)
                            setErrorSMS(response.error.message)
                        } else {
                            console.log('searchByPhone,,,', response.payload.refId)
                            setSearchRes(response.payload)
                            setUserFound(true)
                            await Promise.all([
                                setValue("memberRefId", response.payload.refId),
                                setValue("access_token", access_token)
                            ])
                        }
                    } else if (email && access_token) {
                        const response: any = await dispatch(searchByEmail({email, access_token}))
                        console.log('search by email response', response);
                        if (response.type === 'searchByEmail/rejected') {
                            setErrorSMS(response.error.message)
                        } else {
                            console.log('searchByEmail,,,', response.payload.refId)
                            setSearchRes(response.payload)
                            setUserFound(true)
                            await Promise.all([
                                setValue("memberRefId", response.payload.refId),
                                setValue("access_token", access_token)
                            ])
                        }
                    }
                } else {
                    CSTM.showToast("Couldn't authenticate client")
                }
            } catch (e: any) {
                CSTM.showToast(e)
            }
        })()

        return () => {
            start = false;
        }
    }, [])

    const onSubmit = () => {
        console.log("authResponse", authRes)
        console.log("searchResponse", searchRes)
        if (realm && client_secret && searchRes) {
            (async () => {
                try {
                    const load: {pinConfirmation: string, memberRefId: string, access_token: string} = {
                        pinConfirmation: getValues("pinConfirmation"),
                        memberRefId: getValues("memberRefId"),
                        access_token: getValues("access_token")
                    }

                    const response : any = await dispatch(createPin(load));

                    if (response.type === 'createPin/rejected') {
                        console.log('cant set pin');

                        CSTM.showToast(response.error.message);
                    } else {
                        const loadOut: loginUserType = {
                            phoneNumber: searchRes.phoneNumber,
                            pin: getValues("pinConfirmation"),
                            tenant: realm,
                            clientSecret:  client_secret
                        };

                        console.log('logging in', loadOut);

                        try {
                            await saveSecureKey('currentTenant', JSON.stringify(selectedTenant))
                            const {type, error}: any = await dispatch(loginUser(loadOut))
                            if (type === 'loginUser/rejected' && error) {
                                if (error.message === "Network request failed") {
                                    CSTM.showToast(error.message);
                                } else {
                                    setError('pinConfirmation', {type: 'custom', message: error.message});
                                }
                            } else {
                                dispatch(setAuthState(true));
                            }
                        } catch (e: any) {
                            CSTM.showToast(e.message)
                        }
                    }

                } catch (e: any) {
                    console.log(e)
                    CSTM.showToast(e)
                }
            })()
        } else {
            CSTM.showToast("We couldn't login")
        }
    }

    const loginSubmit = async () => {
        const loadOut: loginUserType = {
            phoneNumber: searchRes.phoneNumber,
            pin: getValues("pin"),
            tenant: realm,
            clientSecret:  client_secret
        };

        try {
            await saveSecureKey('currentTenant', JSON.stringify(selectedTenant))
            const {type, error}: any = await dispatch(loginUser(loadOut))
            if (type === 'loginUser/rejected' && error) {
                console.log(type, error);
                if (error.message === "Network request failed") {
                    CSTM.showToast(error.message);
                } else {
                    setError('pinConfirmation', {type: 'custom', message: error.message});
                    setError('pin', {type: 'custom', message: error.message});
                }
            } else {
                dispatch(setAuthState(true));
            }
        } catch (e: any) {
            CSTM.showToast(e.message)
        }
    }

    console.log("isTermsAccepted", isTermsAccepted)
    console.log("pinStatus", pinStatus)

    if (loading) {
        return <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
            <RotateView/>
        </View>
    } else if (fontsLoaded && userFound) {
        return (
            (isTermsAccepted && pinStatus === 'SET') ?

            <View style={styles.container}>
                <Text allowFontScaling={false} style={{ color: '#489AAB', fontFamily: 'Poppins_400Regular', fontSize: 14, paddingHorizontal: 5 }} >Pin</Text>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        maxLength: 4,
                        minLength: 4
                    }}
                    render={( { field: { onChange, onBlur, value } }) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            autoFocus={false}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={() => clearErrors()}
                            placeholder="Enter Pin"
                            keyboardType="number-pad"
                            secureTextEntry={true}
                            onSubmitEditing={handleSubmit(loginSubmit)}
                        />
                    )}
                    name="pin"
                />
                {
                    errors.pin &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.pin?.message ? errors.pin?.message : 'Invalid Pin'}</Text>
                }

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 50,
                    marginBottom: 5
                }}>
                    <Pressable style={styles.button} onPress={handleSubmit(loginSubmit)}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {loading && <RotateView color="#FFFFFF"/>}
                            <Text allowFontScaling={false} style={styles.buttonText}>Login</Text>
                        </View>
                    </Pressable>
                </View>
            </View>

            :

            <View style={styles.container}>
                <Text allowFontScaling={false} style={{ color: '#489AAB', fontFamily: 'Poppins_400Regular', fontSize: 14, paddingHorizontal: 5 }} >Pin</Text>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        maxLength: 4,
                        minLength: 4
                    }}
                    render={( { field: { onChange, onBlur, value } }) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            autoFocus={false}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={() => clearErrors()}
                            placeholder="Enter Pin"
                            keyboardType="number-pad"
                            secureTextEntry={true}
                        />
                    )}
                    name="pin"
                />
                {
                    errors.pin &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.pin?.message ? errors.pin?.message : 'Invalid Pin'}</Text>
                }
                <Text allowFontScaling={false} style={{ color: '#489AAB', marginTop: 20, fontFamily: 'Poppins_400Regular', fontSize: 14, paddingHorizontal: 5 }}>Pin Confirmation</Text>
                <Controller
                    control={control}
                    rules={{
                        required: !isTermsAccepted || pinStatus === 'TEMPORARY',
                        maxLength: 4,
                        minLength: 4,
                        validate: value => value === getValues('pin')
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                            allowFontScaling={false}
                            style={styles.input}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            maxLength={4}
                            onChange={() => clearErrors()}
                            placeholder="Enter Pin Confirmation"
                            keyboardType="number-pad"
                            secureTextEntry={true}
                        />
                    )}
                    name="pinConfirmation"
                />
                {
                    errors.pinConfirmation &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.pinConfirmation?.message ? errors.pinConfirmation?.message : 'Invalid Pin Confirmation'}</Text>
                }

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 50,
                    marginBottom: 5
                }}>
                    <Pressable style={styles.button} onPress={handleSubmit(onSubmit)}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {loading && <RotateView color="#FFFFFF"/>}
                            <Text allowFontScaling={false} style={styles.buttonText}>Save</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: height -200, width }}>
                <Text allowFontScaling={false} style={{...styles.input, borderWidth: 0, height: 'auto', textAlign: 'center'}}>{errorSMS}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#FFFFFF'
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
    button: {
        backgroundColor: '#3D889A',
        elevation: 3,
        borderRadius: 50,
        paddingHorizontal: 15,
        paddingVertical: 7,
        width: '99%'
    },
    buttonText: {
        fontSize: 14,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_400Regular',
    },
})

export default SetPin
