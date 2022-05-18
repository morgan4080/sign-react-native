import * as React from 'react';
import {Text, View, StyleSheet, Image, TouchableHighlight} from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../utils/database";
type NavigationProps = NativeStackScreenProps<any>

export default function GetStarted({ navigation }: NavigationProps) {

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    if (fontsLoaded) {
        return (
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/Logo.png')}
                    />
                </View>
                <Image
                    style={styles.landingBg}
                    source={require('../../assets/images/landingGetStarted.png')}
                />
                <View style={styles.container2}>
                    <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('UserEducation')}>
                        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.buttonText}>Get Started</Text>
                            <Ionicons
                                name="arrow-forward-outline"
                                size={25}
                                color='#fff'
                                style={{ marginLeft: 15 }}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        )
    } else {
        return (
            <AppLoading/>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F4F8',
        height: '100%',
        position: 'relative',
    },
    container2: {
        padding: 20,
        display: 'flex',
        position: 'relative',
        height: '100%',
        width: '100%',
        justifyContent: 'flex-end',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    button: {
        backgroundColor: '#3D889A',
        elevation: 3,
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 25,
        marginHorizontal: 80,
        marginBottom: 20,
        marginTop: 20,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 25,
        color: '#3c3c3c',
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 30,
    },
    linkText: {
        fontSize: 18,
        color: '#3D889A',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    landingBg: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    logoContainer: {
        position: 'absolute',
        top: 250,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
    }
});
