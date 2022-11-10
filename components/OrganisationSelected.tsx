import {
    Dimensions,
    Image, Linking,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {Controller, useForm} from "react-hook-form";
import {AntDesign, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../screens/Auth/VerifyOTP";
import {useSelector} from "react-redux";
import {storeState} from "../stores/auth/authSlice";
const { width, height } = Dimensions.get("window");
type FormData = {
    phoneNumber: string
    idNumber: string
    email: string
}
type NavigationProps = NativeStackScreenProps<any>;

const OrganisationSelected = ({tenantId, nav}: {tenantId: string | undefined, nav: NavigationProps}) => {
    const [tab, setTab] = useState<number>(0);
    const {loading} = useSelector((state: { auth: storeState }) => state.auth)
    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        watch,
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
            <View style={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 15}}>
                <TouchableOpacity onPress={() => {
                    setTab(0)
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

    const PhoneInput = () => {
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
                                    <Text style={{fontSize: 16, marginLeft: 10,
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
                    rules={{
                        required: true,
                        maxLength: 12
                    }}
                    render={({field: {onChange, value}}) => (
                        <TextInput
                            style={{
                                ...styles.input,
                                color: errors.phoneNumber ? '#d53b39': '#101828',
                                borderColor: errors.phoneNumber ? '#d53b39': '#E3E5E5',
                                paddingLeft: nav.route.params?.flag ? 100 : 60
                            }}
                            keyboardType="phone-pad"
                            onChangeText={onChange}
                            value={value}
                            autoFocus={false}
                            placeholder="Enter Phone Number"
                            maxLength={12}
                        />
                    )}
                    name="phoneNumber"
                />
                {
                    (errors.phoneNumber) &&
                    <Text allowFontScaling={false}
                          style={styles.error}>{errors.phoneNumber?.message ? errors.phoneNumber?.message : 'Required'}</Text>
                }
            </View>
        )
    };

    const EmailInput = () => {
        return (
            <View>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
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
                        />
                    )}
                    name="email"
                />
                {
                    (errors.email) &&
                    <Text  allowFontScaling={false}  style={styles.error}>{errors.email.message ? errors.email.message : 'Required'}</Text>
                }
            </View>
        )
    };

    const IDInput = () => {
        return (
            <View>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        pattern: /^\d+$/
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
                        />
                    )}
                    name="idNumber"
                />
                {
                    (errors.idNumber) &&
                    <Text allowFontScaling={false} style={styles.error}>{errors.idNumber.message ? errors.idNumber.message : 'Required'}</Text>
                }
            </View>
        )
    }

    const SubmitBtn = () => {
        return (
            <View style={{ paddingVertical: 20 }}>
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

    const SectionPerTenant = () => {
        switch (tenantId) {
            case 't72767': // imarisha
                return (
                    <View style={{ position: 'relative' }}>
                        <EmailPhoneTabs/>
                        {
                            tab === 1 &&
                            <EmailInput/>
                        }

                        {
                            tab === 0 &&
                            <PhoneInput/>
                        }
                    </View>
                )
            case 't74411': // wanaanga
                return (
                    <PhoneInput/>
                )
            case 't10099': // centrino
                return (
                    <IDInput/>
                )
            default:
                return (
                    <></>
                )
        }
    }

    const onSubmit =  async (value: any): Promise<void> => {
        alert(JSON.stringify(value));
    }

    const onError = () => {

    }

    return (
        <View>
            <SectionPerTenant/>
            {tenantId && <SubmitBtn/>}
        </View>
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
        position: 'absolute',
        bottom: -20,
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5,
        alignSelf: 'flex-end'
    },
});

export default OrganisationSelected;
