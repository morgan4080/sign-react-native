import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    TextInput,
    TouchableHighlight,
    Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {StatusBar} from "expo-status-bar";
import {Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
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
import {Controller, useForm} from "react-hook-form";
import {RotateView} from "../Auth/VerifyOTP";
import {useState} from "react";
import Container from "../../components/Container";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

interface FormData {
    desiredAmount: string | undefined,
    desiredPeriod: string | undefined,
    customPeriod: string | undefined,
}

export default function LoanProduct ({ navigation, route }: NavigationProps) {
    const { loading } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const {
        control,
        handleSubmit,
        setError,
        watch,
        getValues,
        setValue,
        formState: { errors }
    } = useForm<FormData>(
        {
            defaultValues: {
                desiredAmount: undefined,
                desiredPeriod: '2',
                customPeriod: undefined
            }
        }
    )

    const setSelectedValue = (itemValue: string) => {
        if (itemValue === "-1") {
            setCustom(true)
        } else {
            setCustom(false)
        }
        setValue('desiredPeriod', itemValue)
    }

    let ps = new Array(parseInt(route.params?.loanProduct.maxPeriod));

    let pData = [];

    for(let i=1;i<ps.length;i++){
        pData.push(i+1)
    }

    pData.push(-1)

    const loanPeriods: {name: string, period: string}[] = pData.reduce((acc: {name: string, period: string}[], current: number) => {
        if (current === -1) {
            acc.push({
                name: 'Custom Period',
                period: `${current}`
            })
        } else {
            acc.push({
                name: `${current} ${current === 1 ? 'Month' : 'Months'}`,
                period: `${current}`
            })
        }
        return acc
    }, [])

    const onSubmit = async (value: any): Promise<void> => {
        if (value.customPeriod) {
            navigation.navigate('LoanPurpose',
                {
                    loanProduct: route.params?.loanProduct,
                    loanDetails: {
                        desiredAmount: value.desiredAmount,
                        desiredPeriod: `${value.customPeriod}`.replace(/\,/g, "")
                    }
                }
            )
            return
        }
        navigation.navigate('LoanPurpose',
            {
                loanProduct: route.params?.loanProduct,
                loanDetails: {
                    desiredAmount: value.desiredAmount,
                    desiredPeriod: `${value.desiredPeriod}`.replace(/\,/g, "")
                }
            }
        )
    };

    const [custom, setCustom] = useState<boolean>(false)

    if (fontsLoaded && !loading) {
        return (
            <Container>
                <View style={{ paddingHorizontal: 5, marginTop: 30 }}>
                    <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 20 }}>{ `${route.params?.loanProduct.name}`.replace(/\_/g, " ") }</Text>
                    <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 12 }}>Interest { route.params?.loanProduct.interestRate }%</Text>
                    <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_300Light', fontSize: 12 }}>Max period {route.params?.loanProduct.maxPeriod} (months)</Text>
                </View>

                <TextField
                    label={"Desired amount"}
                    field={"desiredAmount"}
                    val={getValues}
                    watch={watch}
                    control={control}
                    error={errors.desiredAmount}
                    required={true}
                    keyboardType={"numeric"}
                />

                <TextField
                    label={"Desired Period (Months)"}
                    field={"desiredPeriod"}
                    val={getValues}
                    watch={watch}
                    control={control}
                    error={errors.desiredPeriod}
                    required={true}
                    keyboardType={"numeric"}
                    rules={{
                        required: {
                            value: true,
                            message: "Desired period is required"
                        },
                        validate: (value: string) => {
                            if (parseInt(value) < 2) {
                                return "Below minimum period"
                            }
                            if ((parseInt(value) > parseInt(route.params?.loanProduct.maxPeriod))) {
                                return "Maximum period exceeded"
                            }
                            return true
                        }
                    }}
                />

                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#cccccc', marginTop: 10, marginLeft: 5}}>Select Desired Period (Eg. 1-{route.params?.loanProduct.maxPeriod} Months)</Text>

                <TouchableButton loading={loading} label={"Confirm"} onPress={handleSubmit(onSubmit)} />

                <Pressable style={styles.button0} onPress={() => navigation.navigate('LoanProducts')}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text allowFontScaling={false} style={styles.buttonText0}>Cancel</Text>
                    </View>
                </Pressable>
            </Container>
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
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        marginTop: 20,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 2, // Android
    },
    progress: {
        backgroundColor: '#489AAB',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 50,
        height: 54,
        marginTop: 40,
        paddingHorizontal: 30,
        fontSize: 15,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
    },
    input0: {
        backgroundColor: '#EFF3F4',
        borderRadius: 12,
        height: 54,
        marginTop: 20,
        fontSize: 15,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
    },
    button: {
        backgroundColor: '#489AAB',
        elevation: 3,
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 20,
        marginTop: 80,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    button0: {
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginHorizontal: 80,
        marginBottom: 20,
        marginTop: 5,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    buttonText0: {
        fontSize: 15,
        color: '#3D889A',
        textDecorationLine: 'underline',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    error: {
        fontSize: 12,
        color: 'rgba(243,0,0,0.62)',
        fontFamily: 'Poppins_400Regular',
        paddingHorizontal: 10,
        marginTop: 5,
    },
});
