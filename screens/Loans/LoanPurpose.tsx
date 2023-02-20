import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text, RefreshControl, NativeModules
} from "react-native";

import {StatusBar} from "expo-status-bar";
import {Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {setLoanCategories, storeState} from "../../stores/auth/authSlice";
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
import {useEffect, useState} from "react";
import LoanPurposeTile from './Components/LoanPurposeTile'
import {RotateView} from "../Auth/VerifyOTP";
const CSTM = NativeModules.CSTM;

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function LoanPurpose ({ navigation, route }: NavigationProps) {
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const { loanCategories } = useSelector((state: { auth: storeState }) => state.auth);
    type CategoryType = {code: string, name: string, options: {code: string, name: string, options: {code: string, name: string,selected: boolean}[], selected: boolean}[]}

    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null)
    const [refreshing, setRefreshing] = useState(false);
    const fetchLoanCategories = async () => {
        setRefreshing(true);
        const controller = new AbortController();
        const signal = controller.signal;
        dispatch(setLoanCategories(signal)).finally(() => {
            setRefreshing(false);
            controller.abort();
        });
    }

    useEffect(() => {
        let catLoading = true;
        if (catLoading) {
            fetchLoanCategories().catch(error => {
                console.log("reload categories error", error)
                CSTM.showToast("Pull Down To Load")
            })
        }
        return () => {
            catLoading = false
        }
    }, [])

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });
    const [currentOpenIndex, setCurrentOpenIndex] = useState<number>(-1);
    const isOpen = (index: number): void => {
        setCurrentOpenIndex(index);
    }
    const [optionSelected, setOptionSelected] = useState<boolean>(false);
    const setFormData = (data: CategoryType) => {
        const expected: any = data.options.reduce((acc:CategoryType | {}, curr) => {
            if (curr.selected) {
                let sel = curr.options.some(element => element.selected)
                if (sel) acc = curr
            }
            return acc
        }, {});
        if (Object.keys(expected).length !== 0) {
            setOptionSelected(true);
            setSelectedCategory(data)
        } else {
            setOptionSelected(false);
            setSelectedCategory(null);
        }
    }

    if (fontsLoaded) {
        return (
            <SafeAreaView style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: '20%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: '10%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 10, left: 10 }}>
                                <Ionicons name="chevron-back-sharp" size={30} style={{ paddingLeft: 2 }} color="#489AAB" />
                            </TouchableOpacity>

                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginTop: 15, marginBottom: 10 }}>Loan Purpose Category</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0)', borderTopLeftRadius: 25, borderTopRightRadius: 25, width }}>
                            <ScrollView refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={fetchLoanCategories} />
                            } contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 120 }}>
                                { loanCategories ?
                                    loanCategories.map((category, index: number) => (
                                        <LoanPurposeTile key={category.code} componentIndex={index} currentOpenIndex={currentOpenIndex} isOpen={isOpen} setFormData={setFormData} category={category} />
                                    )) : null
                                }
                            </ScrollView>
                        </View>
                        <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={!optionSelected} onPress={() => {
                                selectedCategory ? navigation.navigate('GuarantorsHome', {
                                    category: selectedCategory,
                                    ...route.params
                                }) : null
                            }} style={{ display: 'flex', alignItems: 'center', backgroundColor: optionSelected? '#489AAB' : '#CCCCCC', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </SafeAreaView>
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
        backgroundColor: '#489AAB',
        elevation: 3,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginHorizontal: 80,
        marginBottom: 20,
        marginTop: 30,
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
        marginTop: 5
    }
});
