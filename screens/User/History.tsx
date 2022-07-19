import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import AppLoading from "expo-app-loading";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import HistoryTile from "./Components/HistoryTile";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function History ({ navigation }: NavigationProps) {
    const { isLoggedIn, loading, user, member } = useSelector((state: { auth: storeState }) => state.auth);
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

    /*{
            executor: 'Mary Ang’weno',
            subject: '',
            event: 'requested guarantorship',
            time: new Date().toLocaleTimeString()
        }*/

    const accountHistory: {executor: string, subject: string, event: string, time: string}[] = [

    ]

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width,
                            height: 1/12 * height
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('Modal')} style={{ marginRight: 20, marginLeft: 15 }}>
                                <AntDesign name="arrowleft" size={24} color="#489AAB" />
                            </TouchableOpacity>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_700Bold', fontSize: 18 }}>Account History</Text>
                        </View>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height: 11/12 * height }}>

                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50  }}>
                                {
                                    accountHistory.map((history, i) => (
                                        <HistoryTile key={i} history={history}  />
                                    ))
                                }
                                {
                                    accountHistory.length === 0 && <View><Text style={{fontFamily: 'Poppins_600SemiBold', fontSize: 16}}>Coming Soon</Text></View>
                                }
                            </ScrollView>

                        </SafeAreaView>
                    </View>
                </View>
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'}/>
            </View>
        )
    } else {
        return (
            <AppLoading/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
});
