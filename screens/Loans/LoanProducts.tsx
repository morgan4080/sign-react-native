import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    SectionList,
    Alert
} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {
    authenticate,
    fetchLoanProducts,
    storeState,
    LoanProduct,
    checkExistingProduct
} from "../../stores/auth/authSlice";
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
import {useEffect} from "react";
import {RotateView} from "../Auth/VerifyOTP";
import {dismissSnack, showSnack} from "../../utils/immediateUpdate";
import {LoanRequestData} from "../User/LoanRequests";
import {toMoney} from "../User/Account";
import {RootStackScreenProps} from "../../types";

const { width, height } = Dimensions.get("window");

// https://eguarantorship-api.presta.co.ke/api/v1/loan-request/query?productRefId=productRefId&memberRefId=memberRefId&loanReqStatus=OPEN&order=ASC&pageSize=10&isActive=false
export default function LoanProducts ({ navigation }: RootStackScreenProps<"LoanProducts">) {
    const { loading, loanProducts, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const { type }: any = await dispatch(authenticate());
                if (type === 'authenticate/rejected') {
                    navigation.navigate('GetTenants')
                } else {
                    try {
                        await Promise.all([dispatch(fetchLoanProducts())]);
                    } catch (e: any) {
                        console.log('promise rejection', e);
                    }
                }
            })()
        }
        return () => {
            authenticating = false;
        }
    }, []);


    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const checkPendingLoan = (product: LoanProduct) => {
        const payloadOut = {productRefId: product.refId, memberRefId: `${member?.refId}`}
        console.log(payloadOut)
        dispatch(checkExistingProduct(payloadOut)).then(({type, error, payload}: any) => {
            if (type === 'checkExistingProduct/rejected') {
                showSnack(`Error checking existing loans: ${error.message}`, "ERROR")
            } else {
                if (payload && payload.empty) {
                    navigation.navigate('LoanProduct', { loanProduct: product })
                } else {
                    const applicationCompleted= payload.content.some((loan_request: any) => loan_request.applicationStatus === 'COMPLETED');
                    const applicationInProgress= payload.content.some((loan_request: any) => loan_request.applicationStatus === 'INPROGRESS');
                    const signingCompleted = payload.content.some((loan_request: any) => loan_request.signingStatus === 'COMPLETED');
                    const signingInProgress = payload.content.some((loan_request: any) => loan_request.signingStatus === 'INPROGRESS');

                    if (applicationCompleted && signingCompleted) {
                        const existingInProgress = payload.content.find((curr: LoanRequestData) => curr.applicationStatus === 'COMPLETED' && curr.signingStatus === 'INPROGRESS')
                        if (existingInProgress) {
                            showSnack(`${existingInProgress.loanProductName} of ${toMoney(existingInProgress.loanAmount)} is in progress from: ${existingInProgress.loanDate}`, "", "Resolve", true, () => {
                                dismissSnack()
                                return Alert.alert(`Resolve ${existingInProgress.loanProductName}`, `You can proceed to create a new loan request or resolve existing ${existingInProgress.loanRequestNumber} of ${toMoney(existingInProgress.loanAmount)} created on ${existingInProgress.loanDate}`, [
                                    {
                                        text: 'Proceed',
                                        onPress: () => navigation.navigate('LoanProduct', { loanProduct: product }),
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Resolve',
                                        onPress: () => {
                                            navigation.navigate("ProfileMain", {
                                                screen: "LoanRequests",
                                                params: {
                                                    loan: existingInProgress
                                                }
                                            })
                                        },
                                    }
                                ])
                                // dismiss snack here before performing next action
                            });
                        } else {
                            const existingCompleted = payload.content.find((curr: LoanRequestData) => curr.applicationStatus === 'COMPLETED' && curr.signingStatus === 'COMPLETED')
                            showSnack(`The same loan product was requested lastly on: ${existingCompleted.loanDate}`)
                            navigation.navigate('LoanProduct', { loanProduct: product })
                        }
                    } else if (applicationInProgress) {
                        const existingInProgress = payload.content.find((curr: LoanRequestData) => curr.signingStatus === 'INPROGRESS')

                        if (existingInProgress) {
                            showSnack(`${product.name} of ${toMoney(existingInProgress.loanAmount)} is in progress from: ${existingInProgress.loanDate}`, "", "Resolve", true, () => {
                                dismissSnack()
                                return Alert.alert(`Resolve ${existingInProgress.loanProductName}`, `You can proceed to create a new loan request or resolve existing ${existingInProgress.loanRequestNumber} of ${toMoney(existingInProgress.loanAmount)} created on ${existingInProgress.loanDate}`, [
                                    {
                                        text: 'Proceed',
                                        onPress: () => navigation.navigate('LoanProduct', { loanProduct: product }),
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Resolve',
                                        onPress: () => {
                                            navigation.navigate("ProfileMain", {
                                                screen: "LoanRequests",
                                                params: {
                                                    loan: existingInProgress
                                                }
                                            })
                                        },
                                    }
                                ])
                                // dismiss snack here before performing next action
                            });
                        } else {
                            navigation.navigate('LoanProduct', { loanProduct: product })
                        }
                    } else if (applicationCompleted && signingInProgress) {
                        const existingInProgress = payload.content.find((curr: LoanRequestData) => curr.applicationStatus === 'COMPLETED' && curr.signingStatus === 'INPROGRESS')
                        if (existingInProgress) {
                            showSnack(`${existingInProgress.loanProductName} of ${toMoney(existingInProgress.loanAmount)} is in progress from: ${existingInProgress.loanDate}`, "", "Resolve", true, () => {
                                dismissSnack()
                                return Alert.alert(`Resolve ${existingInProgress.loanProductName}`, `You can proceed to create a new loan request or resolve existing ${existingInProgress.loanRequestNumber} of ${toMoney(existingInProgress.loanAmount)} created on ${existingInProgress.loanDate}`, [
                                    {
                                        text: 'Proceed',
                                        onPress: () => navigation.navigate('LoanProduct', { loanProduct: product }),
                                        style: 'cancel'
                                    },
                                    {
                                        text: 'Resolve',
                                        onPress: () => {
                                            navigation.navigate("ProfileMain", {
                                                screen: "LoanRequests",
                                                params: {
                                                    loan: existingInProgress
                                                }
                                            })
                                        },
                                    }
                                ])
                                // dismiss snack here before performing next action
                            });
                        } else {
                            navigation.navigate('LoanProduct', { loanProduct: product })
                        }
                    } else {
                        navigation.navigate('LoanProduct', { loanProduct: product })
                    }
                }
            }
        }, (test) => {
            console.log("rejected", test)
        }).catch(e => {
            console.log(e)
        })
    }

    const Item = ({ product }: { product: LoanProduct } ) => (
        <TouchableOpacity key={product.refId} style={styles.tile} onPress={() => checkPendingLoan(product)}>
            <View>
                <Text allowFontScaling={false} style={{ color: '#0C212C', fontSize: 13, fontFamily: 'Poppins_600SemiBold' }}>
                    { `${product.name}`.replace(/_/g, " ") }
                </Text>
                <Text allowFontScaling={false} style={{ color: '#576B74', fontSize: 11, fontFamily: 'Poppins_500Medium' }}>
                    Interest { product.interestRate } %
                </Text>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD"/>
        </TouchableOpacity>
    );

    if (fontsLoaded) {
        return (
            <SafeAreaView style={{flex: 1, marginTop: 10, position: 'relative'}}>
                <SectionList
                    refreshing={loading}
                    progressViewOffset={5}
                    onRefresh={() => dispatch(fetchLoanProducts())}
                    sections={loanProducts && Array.isArray(loanProducts) ? loanProducts.reduce((acc: {title: string, data: LoanProduct[]}[], product) => {
                        if (product.details && product.details.isFosa && product.details.isFosa.value === 'N') {
                            acc[0].data = [...acc[0].data, product]
                        } else {
                            acc[1].data = [...acc[1].data, product]
                        }
                        return acc
                    }, [
                        {
                            title: 'Bosa',
                            data: []
                        },
                        {
                            title: 'Fosa',
                            data: []
                        }
                    ]) : []}
                    renderItem={({ item }) => <Item product={item} />}
                    keyExtractor={item => item.refId}
                    renderSectionHeader={({ section: { title, data } }) => data.length > 1 ? (
                        <Text style={{fontFamily: 'Poppins_600SemiBold', color: '#489AAB', fontSize: 15, paddingHorizontal: 20}}>{title}</Text>
                    ) : (<></>)}
                />

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
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 20,
        margin: 10,
        height: 74,
        paddingHorizontal: 20,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: -1 }, // IOS
        shadowOpacity: 0.8, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 5, // Android
    },
    progress: {
        backgroundColor: '#489AAB',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    }
});
