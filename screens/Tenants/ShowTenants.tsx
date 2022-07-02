import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useDispatch, useSelector} from "react-redux";
import {authenticate, storeState, setSelectedTenantId} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {
    FlatList,
    NativeModules,
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    StatusBar as Bar, Dimensions
} from "react-native";
import {useEffect} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RotateView} from "../Auth/VerifyOTP";
const { width, height } = Dimensions.get("window");
type NavigationProps = NativeStackScreenProps<any>;

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
    </TouchableOpacity>
);

const ShowTenants = ({ navigation }: NavigationProps) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { isJWT, selectedTenantId, isLoggedIn, loading, tenants } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const CSTM = NativeModules.CSTM;

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    return
                }
                if (response.type === 'authenticate/fulfilled') {
                    navigation.navigate('VerifyOTP')
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, []);

    useEffect(() => {
        let isLoggedInSubscribed = true;
        if (isLoggedIn) {
            if (isLoggedInSubscribed) navigation.navigate('VerifyOTP')
        }
        return () => {
            // cancel the subscription
            isLoggedInSubscribed = false;
        };
    }, [isLoggedIn]);

    const renderItem = ({ item }: any) => {
        const backgroundColor = item.id === selectedTenantId ? "#489AAB" : "#FFFFFF";
        const color = item.id === selectedTenantId ? 'white' : 'black';

        return (
            <Item
                item={item}
                onPress={() => dispatch(setSelectedTenantId(item.id))}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

    return (
        <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
            <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
            <View style={{ position: 'absolute', left: -100, top: '20%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
            <View style={{ position: 'absolute', right: -80, top: '10%', backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={tenants}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </SafeAreaView>
            <View style={{ backgroundColor: '#489AAB', width, display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative' }}>
                {!loading && <TouchableOpacity onPress={() => (selectedTenantId && navigation.navigate('Login'))} style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderColor: '#FFFFFF',
                    borderWidth: 1,
                    width: width / 2,
                    paddingHorizontal: 20,
                    paddingVertical: 15,
                    borderRadius: 25,
                    marginTop: 45,
                    marginBottom: 25
                }}>
                    <Text allowFontScaling={false} style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>}
                {loading &&
                    <View style={{marginTop: 45, marginBottom: 25}}>
                        <RotateView/>
                    </View>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container0: {
        flex: 1,
        position: 'relative'
    },
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        borderColor: '#CCCCCC',
        borderWidth: .5,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
    },
    tenantName: {
        fontSize: 16,
        fontFamily: 'Poppins_300Light',
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium'
    },
});

export default ShowTenants
