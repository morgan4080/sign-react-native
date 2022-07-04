import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Pie as ProgressPie, Bar as ProgressBar} from "react-native-progress";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import {useState} from "react";
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_700Bold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
interface GuarantorData {
    refId: string,
    memberNumber: string,
    memberRefId: string,
    firstName: string,
    lastName: string,
    dateAccepted?: string,
    isAccepted?: string,
    dateSigned?: string,
    isSigned?: boolean,
    isApproved?: boolean,
    isActive: boolean,
    committedAmount: number,
    availableAmount: number,
    totalDeposits: number
}
interface LoanRequestData {
    "refId": string,
    "loanDate": string,
    "loanRequestNumber": string,
    "loanProductName": string,
    "loanProductRefId": string,
    "loanAmount": number,
    "guarantorsRequired": number,
    "guarantorCount": number,
    "status": string,
    "signingStatus": string,
    "acceptanceStatus": string,
    "applicationStatus": string,
    "memberRefId": string,
    "memberNumber": string,
    "memberFirstName": string,
    "memberLastName": string,
    "phoneNumber": string,
    "loanRequestProgress": number,
    "totalDeposits": number,
    "applicantSigned": boolean,
    "witnessName": string,
    "guarantorList": GuarantorData[],
}

interface propInterface {
    loan: LoanRequestData
}
const { width, height } = Dimensions.get("window");
export default function LoanRequest ({loan}: propInterface) {
    const [open, setOpen] = useState(false);
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const computeProgress = (item: GuarantorData) => {
        let progress: number = 0.0
        if (item.isAccepted) {
            progress+=0.25
        }
        if (item.isSigned) {
            progress+=0.25
        }
        if (item.isApproved) {
            progress+=0.5
        }
        return progress
    }

    return (
        <View style={styles.main}>
            <TouchableOpacity style={styles.tile} onPress={() => setOpen((o) => !o)}>
                <View style={styles.progress}>
                    {
                        loan.signingStatus === 'INPROGRESS' &&
                        <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <ProgressPie progress={loan.loanRequestProgress / 100} size={40}/>
                            <Text allowFontScaling={false} style={{
                                fontFamily: 'Poppins_500Medium',
                                color: '#FFFFFF',
                                marginTop: 5,
                                textTransform: 'capitalize'
                            }}>{loan.signingStatus}</Text>
                        </View>
                    }
                    {
                        loan.signingStatus === 'COMPLETED'  &&
                        <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Ionicons name="checkmark-done-circle-sharp" size={40} color="#0BB962FF" />
                            <Text allowFontScaling={false} style={{
                                fontFamily: 'Poppins_500Medium',
                                color: '#FFFFFF',
                                marginTop: 5,
                                textTransform: 'capitalize'
                            }}>{loan.signingStatus}</Text>
                        </View>
                    }
                </View>
                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_600SemiBold', color: '#9a9a9a', fontSize: 13, maxWidth: 80 }}>{ loan.loanProductName }</Text>
                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_600SemiBold', color: '#9a9a9a', fontSize: 13 }}>Ksh. { loan.loanAmount }</Text>
                {!open && <MaterialIcons name="keyboard-arrow-right" size={40} color="#ADADAD" />}
                {open && <MaterialIcons name="keyboard-arrow-down" size={40} color="#ADADAD" />}
            </TouchableOpacity>
            {
                open && (
                    <View style={styles.guarantorContainer}>
                        <View collapsable={false}>
                            {loan.guarantorList.map((item, key) => (
                                <View key={key} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                                    <View style={{width: width/3}}>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#727272', fontSize: 12 }}>{`${item.firstName} ${item.lastName}`}</Text>
                                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 12 }}>{ item.committedAmount } Ksh</Text>
                                    </View>
                                    <View style={{ position: 'relative' }}>
                                        <View style={{ position: 'absolute', top: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2, width: width/2.1 }}>
                                            <View style={{position: 'relative'}}>
                                                <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isAccepted ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6, position: 'absolute', width: 30, left: 0, bottom: -8 }}>Accepted</Text>
                                            </View>
                                            <View style={{position: 'relative'}}>
                                                <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isSigned ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6, position: 'absolute', width: 30, left: -10, bottom: -8 }}>Signed</Text>
                                            </View>
                                            <View style={{position: 'relative'}}>
                                                <View style={{ width: 8, height: 8, borderRadius: 100, backgroundColor: item.isApproved ? '#0bb962' : '#cccccc', borderWidth: 1, borderColor: '#ffffff' }}></View>
                                                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#9a9a9a', fontSize: 6, position: 'absolute', width: 32, left: -20, bottom: -8 }}>Approved</Text>
                                            </View>
                                        </View>
                                        <ProgressBar progress={computeProgress(item)} color='#0bb962' width={width/2.1}/>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
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
        justifyContent: 'space-between',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    progress: {
        backgroundColor: '#489AAB',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    guarantorContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: 20,
    }
})
