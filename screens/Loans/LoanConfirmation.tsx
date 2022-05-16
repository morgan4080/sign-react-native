import {Dimensions, View, Text, StyleSheet, StatusBar as Bar, TouchableOpacity, SafeAreaView, ScrollView} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {useState} from "react";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import {Circle as ProgressCircle} from "react-native-progress";
import * as React from "react";
import {Ionicons} from "@expo/vector-icons";

type NavigationProps = NativeStackScreenProps<any>
const { width, height } = Dimensions.get("window");

export default function LoanConfirmation({navigation, route}: NavigationProps) {
    const { loading, user } = useSelector((state: { auth: storeState }) => state.auth);
    console.log("route params", route.params)
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
    if (fontsLoaded) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center', position: 'relative'}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width,
                            height: 1/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>
                        </View>
                        <SafeAreaView style={{ flex: 1, width, height: 11/12 * height, backgroundColor: '#FFFFFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', flexDirection: 'column', marginTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
                                <Text style={styles.headTitle}>Confirm</Text>
                                <Text style={styles.subtitle}>Loan Request to <Text style={{color: '#323492', textDecorationStyle: 'dotted', textDecorationLine: 'underline'}}>{ `${user?.companyName}` }</Text></Text>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%' }}>Loan Type:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanProduct.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%' }}>Months:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredPeriod} Month</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%' }}>Amount:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.loanDetails.desiredAmount} Month</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%' }}>Guarantors:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.guarantors.length}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%' }}>Witness:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 15, width: '50%', textAlign: 'right'  }}>{route.params?.witnesses.length}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 50, paddingHorizontal: 10}}>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 12, width: '50%' }}>Category:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{route.params?.category.name}</Text>
                                    </View>
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Text style={{ fontFamily: 'Poppins_500Medium', color: '#747474', fontSize: 18, marginBottom: 12, width: '50%' }}>Purpose:</Text>
                                        <Text style={{ fontFamily: 'Poppins_300Light', color: '#747474', fontSize: 18, marginBottom: 12, width: '50%', textAlign: 'right'  }}>{
                                            route.params?.category.options.map((op: any) => {
                                                if (op.selected) {
                                                    return `${op.name}, `
                                                }
                                            })
                                        }</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </SafeAreaView>
                    </View>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <ProgressCircle indeterminate={true} size={50} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    headTitle: {
        textAlign: 'center',
        color: '#323492',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 22,
        marginTop: 22,
    },
    subtitle: {
        textAlign: 'center',
        color: '#747474',
        fontFamily: 'Poppins_400Regular',
        fontSize: 18,
        marginTop: 2,
    }
})
