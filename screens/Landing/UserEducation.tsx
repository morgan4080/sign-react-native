import * as React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ScrollView, TouchableHighlight
} from 'react-native';
import AppLoading from 'expo-app-loading';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type NavigationProps = NativeStackScreenProps<any>

const { width, height } = Dimensions.get("window");

export default function UserEducation({navigation}: NavigationProps) {

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
            <SafeAreaView  style={{ flex: 1, paddingTop: StatusBar.currentHeight,backgroundColor: 'rgb(255,255,255)' }}>
                <ScrollView snapToInterval={width} decelerationRate="fast" style={styles.container} horizontal>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/LogoSmall.png')}
                        />
                        <Text allowFontScaling={false} style={styles.titleText}>One-click Guarantorship Request</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                            <Image
                                style={styles.artwork}
                                source={require('../../assets/images/user-education-1.png')}
                            />
                        </View>
                        <Text allowFontScaling={false} style={styles.subTitleText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulputate sit purus scelerisque et suspendisse dictum quis facilisi. Faucibus nisi, lectus auctor augue faucibus suspendisse. Neque, lacus nullam amet malesuada eleifend. Cras lectus amet phasellus pulvinar sed vitae, et pharetra, consequat.
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 80 }}>
                            <View style={{ width: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={{ backgroundColor: '#323492', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/LogoSmall.png')}
                        />
                        <Text allowFontScaling={false} style={styles.titleText}>Track your Loan & Guarantorship status</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                            <Image
                                style={styles.artwork}
                                source={require('../../assets/images/user-education-2.png')}
                            />
                        </View>
                        <Text allowFontScaling={false} style={styles.titleText}>In progress</Text>
                        <Text allowFontScaling={false} style={styles.subTitleText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vulputate sit purus scelerisque et suspendisse dictum quis facilisi. Faucibus nisi, lectus auctor augue faucibus suspendisse. Neque, lacus nullam amet malesuada eleifend. Cras lectus amet phasellus pulvinar sed vitae, et pharetra, consequat.
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 80 }}>
                            <View style={{ width: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#323492', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', width, height, overflow: "hidden", }}>
                        <Image
                            style={styles.landingLogo}
                            source={require('../../assets/images/LogoSmall.png')}
                        />
                        <Text allowFontScaling={false} style={styles.titleText}>Sign all Documents electronically</Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                            <Image
                                style={styles.artwork}
                                source={require('../../assets/images/user-education-3.png')}
                            />
                        </View>
                        <Text allowFontScaling={false} style={styles.subTitleText}>
                            Digitally sign your loan documents from the cmfort of your mobile phone fast and easy.
                        </Text>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 40, marginBottom: 80 }}>
                            <View style={{ width: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#C4C4C4', height: 10, width: 10, borderRadius: 50 }} />
                                <TouchableOpacity style={{ backgroundColor: '#323492', height: 10, width: 10, borderRadius: 50 }} />
                            </View>
                        </View>
                        <TouchableHighlight style={styles.button} onPress={() => navigation.navigate('Login')}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text allowFontScaling={false} style={styles.buttonText}>ACTIVATE ACCOUNT</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                </ScrollView>
            </SafeAreaView >
        )
    } else {
        return (
            <AppLoading/>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    landingLogo: {
        marginTop: 20,
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
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    artwork: {
        marginTop: 10
    },
    titleText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#323492',
        fontFamily: 'Poppins_600SemiBold',
        paddingTop: 10,
        marginHorizontal: 10,
    },
    subTitleText: {
        fontSize: 14,
        marginHorizontal: 60,
        textAlign: 'center',
        color: '#8d8d8d',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
});
