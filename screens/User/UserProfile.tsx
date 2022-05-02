import * as React from 'react';
import {Text, View, ScrollView, StyleSheet, TouchableHighlight, TouchableOpacity} from 'react-native';
import AppLoading from 'expo-app-loading';
import t from 'tcomb-form-native';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import {useEffect, useRef} from "react";
import _ from "lodash";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useDispatch, useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
import { checkForJWT, authenticate } from "../../stores/auth/authSlice";
import {store} from "../../stores/store";

// Types

type NavigationProps = NativeStackScreenProps<any>

export default function UserProfile({ navigation }: NavigationProps) {
    const { isLoggedIn, isJWT, loading } = useSelector((state: { auth: storeState }) => state.auth);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    if (!isLoggedIn) {
        navigation.navigate('Login')
    }

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    if (fontsLoaded && !loading) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.subTitleText}>We will send you a One Time Pin. use it to verify your phone number</Text>
            </ScrollView>
        )
    } else {
        return (
            <AppLoading/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    subTitleText: {
        fontSize: 15,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
});
