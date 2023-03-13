import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Dimensions,
    View,
    StyleSheet,
    TextInput,
    Text,
    StatusBar,
    Pressable,
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
import {useSelector} from "react-redux";
import {
    authClient,
    createPin,
    hasPinCheck,
    loginUser,
    loginUserType,
    searchByEmail,
    searchByPhone,
    setAuthState,
    storeState
} from "../../stores/auth/authSlice";
import {Controller, useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import {store} from "../../stores/store";
import {saveSecureKey} from "../../utils/secureStore";
import {showSnack} from "../../utils/immediateUpdate";
import Container from "../../components/Container";
import {useAppDispatch} from "../../stores/hooks";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";

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
    const [errorSMS, setErrorSMS] = useState<string | null>(null)
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
        watch,
        formState: { errors }
    } = useForm<FormData>({})

    const { loading, selectedTenant } = useSelector((state: { auth: storeState }) => state.auth);

    let {phoneNumber, email, realm, client_secret, isTermsAccepted}: any = route.params;

    const dispatch = useAppDispatch();

    const startMemberVerification = async (access_token: string): Promise<any> => {
        if (phoneNumber && access_token) {
            try {
                const res = await dispatch(hasPinCheck({
                    access_token: access_token,
                    phoneNumber: phoneNumber
                }));

                const {type, meta, payload}: Pick<typeof res, "type" | "meta" | "payload"> = res;

                const {pinStatus}: any = payload

                if (pinStatus) {
                    setPinStatus(pinStatus);
                }
            } catch (e) {
                throw (e);
            }

            const response = await dispatch(searchByPhone({phoneNumber, access_token}));

            const {type, meta, payload}: Pick<typeof response, "type" | "meta" | "payload"> = response;

            console.log('search by phone number response', JSON.stringify(response));

            const {refId, error, code, message} = payload as Record<string, any>;

            if (code === 500) {
                throw (`Search By Phone Error: ${code}: ${message}`);
            }

            if (response.type === 'searchByPhone/rejected' || error) {
                throw(error);
            }

            if (type === 'searchByPhone/fulfilled') {
                console.log('searchByPhone user refId', refId);
                if (refId === undefined) {
                    throw ("Member Not Found");
                }

                setSearchRes(payload);

                setUserFound(true);

                return Promise.all([
                    setValue("memberRefId", refId),
                    setValue("access_token", access_token)
                ]);
            }
        } else if (email && access_token) {
            const response = await dispatch(searchByEmail({email, access_token}));

            const {type, meta, payload}: Pick<typeof response, "type" | "meta" | "payload"> = response;

            console.log('search by email response', JSON.stringify(response));

            const {refId, error} = payload as Record<string, string>;

            if (type === 'searchByEmail/rejected' || error) {

                throw (error);

            } else if ('searchByEmail/fulfilled') {
                console.log('searchByEmail,,,', refId);

                setSearchRes(payload);

                setUserFound(true);

                return Promise.all([
                    setValue("memberRefId", refId),
                    setValue("access_token", access_token)
                ]);
            }
        } else {
            return Promise.reject("No Email or Phone Number Provided");
        }
    }

    useEffect(() => {
        let start = true;
        dispatch(authClient({realm, client_secret}))
        .then(({type, meta, payload}) => {
            if (type === 'authClient/fulfilled') {
                setAuthRes(payload);
                const { access_token } = payload as Record<any, any>;
                return startMemberVerification(access_token)
            } else {
                throw ("Couldn't authenticate client")
            }
        }).catch(e => {
            setErrorSMS(`${JSON.stringify(e)}`);
            showSnack(JSON.stringify(e), "ERROR")
        })
        return () => {
            start = false;
        }
    }, []);

    const logUserIn = async (loadOut: loginUserType) => {
        return dispatch(loginUser(loadOut))
        .then(response => {
            const {type, meta, payload}: Pick<typeof response, "type" | "meta" | "payload"> = response;
            console.log("loginUser", JSON.stringify(response));
            const {error, error_description} = payload as Record<string, string>;
            if (type === 'loginUser/rejected' || error) {
                if (error_description && error) {
                    throw (`${error}: ${error_description}: Username ${searchRes.username} web password was reset and needs to be set before proceeding.`);
                }
                throw (error);
            } else {
                return dispatch(setAuthState(true));
            }
        })
        .catch(error => {
            return Promise.reject(error);
        })
    }

    const onSubmit = () => {
        if (realm && client_secret && searchRes) {
            const load: {pinConfirmation: string, memberRefId: string, access_token: string} = {
                pinConfirmation: getValues("pinConfirmation"),
                memberRefId: getValues("memberRefId"),
                access_token: getValues("access_token")
            };
            return dispatch(createPin(load)).then((response) => {
                const {type, meta, payload} = response
                if (type === 'createPin/rejected') {
                    console.log('submitted create pin error', JSON.stringify(response));
                    // TODO: throw exception here
                } else {
                    return saveSecureKey('currentTenant', JSON.stringify(selectedTenant))
                }
            }).then(() => {
                const loadOut: loginUserType = {
                    phoneNumber: searchRes.phoneNumber,
                    pin: getValues("pinConfirmation"),
                    tenant: realm,
                    clientSecret:  client_secret
                }
                return logUserIn(loadOut)
            }).catch(error => {
                showSnack(JSON.stringify(error), "ERROR");
            })
        } else {
            showSnack("realm, client_secret and user not available", "ERROR")
        }
    }

    const loginSubmit = () => {
        saveSecureKey('currentTenant', JSON.stringify(selectedTenant)).then(() => {
            const loadOut: loginUserType = {
                phoneNumber: searchRes.phoneNumber,
                pin: getValues("pin"),
                tenant: realm,
                clientSecret:  client_secret
            };
            return logUserIn(loadOut)
        }).catch(error => {
            /*setError('pinConfirmation', {type: 'custom', message: error.message});
            setError('pin', {type: 'custom', message: error.message});*/
            showSnack(JSON.stringify(error), "ERROR")
        })
    }
    console.log(errorSMS)
    return (
        <Container>
            {
                loading ?
                    <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                        <RotateView/>
                    </View> : (fontsLoaded && userFound) ? (isTermsAccepted && pinStatus === 'SET') ?
                            <View>
                                <Text allowFontScaling={false} style={styles.description}>
                                    Enter your 4 digit pin code to login.
                                </Text>
                                <Text allowFontScaling={false} style={styles.title}>
                                    Your pin code.
                                </Text>
                                <TextField
                                    field={"pin"}
                                    label={"Enter Pin"}
                                    val={getValues}
                                    watch={watch}
                                    control={control}
                                    error={errors.pin}
                                    required={true}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Pin is required"
                                        },
                                        maxLength: {
                                            value: 4,
                                            message: "Pin exceeded required characters"
                                        },
                                        minLength: {
                                            value: 4,
                                            message: "Pin below required characters"
                                        }
                                    }}
                                    keyboardType={"number-pad"}
                                    secureTextEntry={true}
                                />

                                <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(loginSubmit)} />
                            </View> :
                            <View>
                                <Text allowFontScaling={false} style={styles.description}>
                                    Setting up
                                </Text>
                                <Text allowFontScaling={false} style={styles.title}>
                                    Your pin code.
                                </Text>
                                <Text allowFontScaling={false} style={[styles.description, {marginTop: 0}]}>
                                    To setup your pin enter a 4 digit code
                                </Text>
                                <Text allowFontScaling={false} style={[styles.description, {marginTop: 0}]}>
                                    and confirm it below.
                                </Text>

                                <TextField
                                    field={"pin"}
                                    label={"Enter Pin"}
                                    val={getValues}
                                    watch={watch}
                                    control={control}
                                    error={errors.pin}
                                    required={true}
                                    rules={{
                                        required: {
                                            value: true,
                                            message: "Pin is required"
                                        },
                                        maxLength: {
                                            value: 4,
                                            message: "Pin exceeded required characters"
                                        },
                                        minLength: {
                                            value: 4,
                                            message: "Pin below required characters"
                                        }
                                    }}
                                    keyboardType={"number-pad"}
                                    secureTextEntry={true}
                                />

                                <TextField
                                    field={"pinConfirmation"}
                                    label={"Pin Confirmation"}
                                    val={getValues}
                                    watch={watch}
                                    control={control}
                                    error={errors.pinConfirmation}
                                    required={true}
                                    rules={{
                                        required: {
                                            value: !isTermsAccepted || pinStatus === 'TEMPORARY',
                                            message: "Pin is required"
                                        },
                                        maxLength: {
                                            value: 4,
                                            message: "Pin exceeded required characters"
                                        },
                                        minLength: {
                                            value: 4,
                                            message: "Pin below required characters"
                                        },
                                        validate: (value: string) => (value === getValues('pin') ? true : "Pin Confirmation doesnt match pin")
                                    }}
                                    keyboardType={"number-pad"}
                                    secureTextEntry={true}
                                />

                                <TouchableButton loading={loading} label={"Submit"} onPress={handleSubmit(onSubmit)} />

                            </View> :
                        <Text allowFontScaling={false} style={{ color: 'black', borderWidth: 0, height: 'auto', textAlign: 'center'}}>{errorSMS}</Text>
            }
        </Container>
    )
}

const styles = StyleSheet.create({
    title: {
        marginTop: 10,
        fontFamily: "Poppins_700Bold",
        fontSize: 34,
        color: '#0C212C',
        textAlign: "left",
        lineHeight: 41,
        letterSpacing: 0.6
    },

    description: {
        marginTop: 80,
        fontWeight: '300',
        color: '#62656b'
    },
})

export default SetPin
