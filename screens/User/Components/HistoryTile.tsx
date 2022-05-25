import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Pie as ProgressPie, Bar as ProgressBar} from "react-native-progress";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import * as React from "react";
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
    history: any
}
const { width, height } = Dimensions.get("window");
export default function HistoryTile ({history}: propInterface) {
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
            <View style={styles.tile} >
                <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: width/5}}>
                    <Ionicons name="person-circle" size={40} color="#CCCCCC" />
                </View>
                <View style={{ width: width * 3/5 }}>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: '#9a9a9a', fontSize: 12, maxWidth: 200 }}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#323492' }}>
                            { history.executor ? `${ history.executor } ` : '' }
                        </Text>
                        { history.event ? `${history.event} ` : '' }
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#323492' }}>
                            { history.subject }
                        </Text>
                    </Text>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: '#9a9a9a', fontSize: 12 }}>{ history.time }</Text>
                </View>
                <Ionicons style={{ width: width/5 }} name="ellipsis-vertical" size={20} color="#ADADAD" />
            </View>
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
