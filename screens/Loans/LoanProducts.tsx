import {
    Dimensions,
    SafeAreaView,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    View,
    Text, VirtualizedList, SectionList
} from "react-native";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {
    authenticate,
    fetchLoanProducts,
    storeState,
    LoanProduct
} from "../../stores/auth/authSlice";
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
import {useEffect} from "react";
import {RotateView} from "../Auth/VerifyOTP";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function LoanProducts ({ navigation }: NavigationProps) {
    const { loading, loanProducts } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const { type, payload }: any = await dispatch(authenticate());
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

    const Item = ({ product }: { product: LoanProduct } ) => (
        <TouchableOpacity key={product.refId} style={styles.tile} onPress={() => navigation.navigate('LoanProduct', { loanProduct: product })}>
            <Text allowFontScaling={false} style={{color: '#575757', fontFamily: 'Poppins_400Regular', fontSize: 13}}>{ product.name }</Text>
            <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD"/>
        </TouchableOpacity>
    );

    if (fontsLoaded) {
        return (
            <SafeAreaView style={{flex: 1, marginTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: '20%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: '10%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width,
                    position: 'relative'
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 12, left: 12 }}>
                        <Ionicons name="chevron-back-sharp" size={30} style={{ paddingLeft: 2 }} color="#489AAB" />
                    </TouchableOpacity>

                    <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 18, marginVertical: 15 }}>Select Loan Product</Text>
                </View>
                <SectionList
                    style={{paddingHorizontal: 20}}
                    refreshing={loading}
                    progressViewOffset={5}
                    onRefresh={() => dispatch(fetchLoanProducts())}
                    sections={loanProducts ? loanProducts.reduce((acc: {title: string, data: LoanProduct[]}[], product) => {
                        if (product.details.isFosa.value === 'N') {
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
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={{fontFamily: 'Poppins_600SemiBold', color: '#489AAB', fontSize: 15, paddingHorizontal: 20}}>{title}</Text>
                    )}
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
        marginVertical: 10,
        height: 74,
        paddingHorizontal: 20,
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
    }
});
