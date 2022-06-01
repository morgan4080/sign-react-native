import {
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StyleSheet, Text, TouchableHighlight,
    View
} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as React from "react";
import {Ionicons} from "@expo/vector-icons";
import {useDispatch, useSelector} from "react-redux";
import {fetchFavouriteGuarantors, storeState} from "../../stores/auth/authSlice";
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
import {useEffect, useState} from "react";
import {RotateView} from "../Auth/VerifyOTP";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

const FavouriteGuarantors = ({ navigation }: NavigationProps) => {
    const { loading, member } = useSelector((state: { auth: storeState }) => state.auth);
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const [copied, setCopied] = useState<string>('')

    const copyToClipboard = async (content: string) => {
        setCopied(content);
        setTimeout(() => setCopied(''), 1000)
    };

    const [faveGuarantors, setFaveGuarantors] = useState<{ refId: string, fullName: string, memberNumber: string, phoneNumber: string }[]>([]);

    useEffect(() => {
        let fetchingFavs = true
        if (fetchingFavs) {
            (async () => {
                console.log(member)
                await dispatch(fetchFavouriteGuarantors({memberRefId: member?.refId, setFaveGuarantors}))
            })()
        }
        return () => {
            fetchingFavs = false
        };
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

    if (fontsLoaded && !loading) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', right: -30, top: -10, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center',}}>
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 25, borderTopRightRadius: 25, width: width, height }}>

                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 50  }}>
                                {
                                    faveGuarantors && faveGuarantors.map((guarantor, i) => (
                                        <View key={i} style={styles.main}>
                                            <View style={styles.tile} >
                                                <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: width/5}}>
                                                    <Ionicons name="person-circle" size={40} color="#CCCCCC" />
                                                </View>
                                                <View style={{ width: width * 3/5 }}>
                                                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#323492', fontSize: 14, maxWidth: 250 }}>
                                                        { guarantor?.fullName }
                                                    </Text>
                                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 250 }}>
                                                            { guarantor?.phoneNumber }
                                                        </Text>
                                                        {/*<TouchableHighlight style={{marginHorizontal: 10}} onPress={() => copyToClipboard(guarantor.phoneNumber)}>
                                                            <Ionicons name="copy" size={15} color="#ADADAD" />
                                                        </TouchableHighlight>*/}
                                                        {/*{copied === guarantor.phoneNumber && <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', color: '#9a9a9a', fontSize: 10, marginLeft: 2}}>Copied!</Text> }*/}
                                                    </View>
                                                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#9a9a9a', fontSize: 12 }}>
                                                            { guarantor?.memberNumber }
                                                        </Text>
                                                        {/*<TouchableHighlight style={{marginHorizontal: 10}} onPress={() => copyToClipboard(guarantor.memberNumber)}>
                                                            <Ionicons name="copy" size={15} color="#ADADAD" />
                                                        </TouchableHighlight>*/}
                                                        {/*{copied === guarantor.memberNumber && <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', color: '#9a9a9a', fontSize: 10, marginLeft: 2}}>Copied!</Text> }*/}
                                                    </View>
                                                </View>
                                                {/*<Ionicons style={{ width: width/5 }} name="ellipsis-vertical" size={20} color="#ADADAD" />*/}
                                            </View>
                                        </View>
                                    ))
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
    main: {
        marginTop: 20,
        borderRadius: 25,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        backgroundColor: '#FFFFFF',
        elevation: 2, // Android
    },
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25
    },
    guarantorContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: 20,
    }
});


export default FavouriteGuarantors;
