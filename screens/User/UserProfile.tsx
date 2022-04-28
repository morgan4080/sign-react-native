import * as React from 'react';
import {Text, View, StyleSheet, TouchableHighlight, TouchableOpacity} from 'react-native';
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
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    useEffect(() => {
        dispatch(checkForJWT())
    }, []);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const { isLoggedIn, isJWT, loading } = useSelector((state: { auth: storeState })=>state.auth);

    if (isJWT && !isLoggedIn) {
        // use jwt to authenticate and change isLoggedIn to true and set user object
        dispatch(authenticate())
    } else {
        navigation.navigate('Root')
    }

    if (loading) {
        return (
            <AppLoading/>
        )
    } else {
        if (fontsLoaded) {
            return (
                <View style={styles.container}>
                </View>
            )
        } else {
            return (
                <AppLoading/>
            )
        }
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#ffffff',
    },
});
