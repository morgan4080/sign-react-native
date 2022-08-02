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

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

interface FormData {
    desiredAmount: string | undefined,
    desiredPeriod: string | undefined
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
        setValue,
        formState: { errors }
    } = useForm<FormData>(
        {
            defaultValues: {
                desiredAmount: undefined,
                desiredPeriod: '1'
            }
        }
    )

    const setSelectedValue = (itemValue: string) => {
        setValue('desiredPeriod', itemValue)
    }

    const loanPeriods: {name: string, period: string}[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].reduce((acc: {name: string, period: string}[], current: number) => {
        acc.push({
            name: `${current} ${current === 1 ? 'Month' : 'Months'}`,
            period: `${current}`
        })
        return acc
    }, [])

    const onSubmit = async (value: any): Promise<void> => {
        navigation.navigate('LoanPurpose',
            {
                loanProduct: route.params?.loanProduct,
                loanDetails: {
                    desiredAmount: value.desiredAmount,
                    desiredPeriod: value.desiredPeriod
                }
            }
        )
    };

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width,
                            height: 3/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>

                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 20, marginTop: 30 }}>Enter Loan Details</Text>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 12 }}>{ route.params?.loanProduct.name }</Text>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 9/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50 }}>
                                {/*<Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_400Regular', fontSize: 18, marginTop: 30, maxWidth: width/2 }}>Your current Loan limit is (KES 60,000)</Text>*/}
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            allowFontScaling={false}
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Desired Amount"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="desiredAmount"
                                />
                                {errors.desiredAmount && <Text allowFontScaling={false} style={styles.error}>{errors.desiredAmount?.message ? errors.desiredAmount?.message : 'Loan amount is required'}</Text>}
                                <Controller
                                    control={control}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <View style={styles.input0}>
                                            <Picker
                                                style={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 15, }}
                                                onBlur={onBlur}
                                                selectedValue={value}
                                                onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                                            >
                                                { loanPeriods.map((p, i) =>(
                                                    <Picker.Item key={i} label={p.name} value={p.period} color='#767577' fontFamily='Poppins_500Medium' />
                                                ))}
                                            </Picker>
                                            <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#cccccc', marginTop: 10, marginLeft: -5}}>Select Desired Period (Eg. 1-24 Months)</Text>
                                        </View>
                                    )}
                                    name="desiredPeriod"
                                />

                                <TouchableHighlight style={styles.button} onPress={handleSubmit(onSubmit)}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text allowFontScaling={false} style={styles.buttonText}>CONFIRM</Text>
                                    </View>
                                </TouchableHighlight>

                                <TouchableHighlight style={styles.button0} onPress={() => navigation.navigate('LoanProducts')}>
                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text allowFontScaling={false} style={styles.buttonText0}>Cancel</Text>
                                    </View>
                                </TouchableHighlight>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </View>
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
        borderRadius: 20,
        height: 54,
        marginTop: 40,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 54,
        marginTop: 40,
        fontSize: 15,
        color: '#767577',
        paddingHorizontal: 10,
        fontFamily: 'Poppins_400Regular',
    },
    button: {
        backgroundColor: '#336DFF',
        elevation: 3,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginHorizontal: 80,
        marginBottom: 20,
        marginTop: height/6,
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
