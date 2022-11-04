import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Circle as ProgressCircle} from "react-native-progress";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";

import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_700Bold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useState} from "react";
import {toMoney} from "../Account";
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
    loan: LoanRequestData,
    setLoan: any,
    onPress: any
}
const { width, height } = Dimensions.get("window");

export default function LoanRequest ({loan, setLoan, onPress}: propInterface) {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    return (
        <View style={styles.main}>
            <TouchableOpacity style={styles.tile} onPress={() => {
                setLoan(loan)
                onPress()
            }}>
                <View style={styles.progress}>
                    {
                        loan.signingStatus === 'INPROGRESS' &&
                        <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <ProgressCircle size={70} thickness={5} showsText={true} unfilledColor='#CCCCCC' formatText={() => `${loan.loanRequestProgress}%`} progress={loan.loanRequestProgress / 100} color='#489bab' borderColor='transparent'/>
                            <Text allowFontScaling={false} style={{
                                fontFamily: 'Poppins_500Medium',
                                color: '#9a9a9a',
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
                                color: '#9a9a9a',
                                marginTop: 5,
                                textTransform: 'capitalize'
                            }}>{loan.signingStatus}</Text>
                        </View>
                    }
                    {
                        loan.signingStatus === 'ERROR'  &&
                        <View style={{paddingVertical: 20,paddingHorizontal: 40, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Ionicons name="alert-circle" size={40} color="#ff003b" />
                            <Text allowFontScaling={false} style={{
                                fontFamily: 'Poppins_500Medium',
                                color: '#9a9a9a',
                                marginTop: 5,
                                textTransform: 'capitalize'
                            }}>{loan.signingStatus}</Text>
                        </View>
                    }
                </View>
                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_600SemiBold', color: '#9a9a9a', fontSize: 13, maxWidth: 80 }}>{ loan.loanProductName }</Text>
                <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_600SemiBold', color: '#9a9a9a', fontSize: 13, paddingRight: 15 }}>Ksh. { toMoney(`${loan.loanAmount}`) }</Text>
                <View style={{position: 'absolute', top: 10, right: 5, paddingHorizontal: 10, width: width/1.5}}>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_600SemiBold', color:  loan.applicantSigned ? '#0BB962FF' : '#CCCCCC', fontSize: 8, textAlign: 'right' }}>{loan.applicantSigned ? 'APPLICANT SIGNED' : 'APPLICANT NOT SIGNED'}</Text>
                </View>
                <View style={{position: 'absolute', bottom: 10, right: 5, paddingHorizontal: 10, width: width/1.5}}>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', color: '#CCCCCC', fontSize: 8, textAlign: 'right' }}>{loan?.loanDate}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        marginVertical: 15,
        borderRadius: 25,
        marginHorizontal: 20,
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
        position: 'relative'
    },
    progress: {
        backgroundColor: '#d7d7d7',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25
    },
    guarantorContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: 20,
    }
})
