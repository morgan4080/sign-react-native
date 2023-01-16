import {
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    Text,
    Dimensions,
    SafeAreaView,
    View,
    ScrollView,
    TouchableOpacity, Pressable, TouchableHighlight
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import Logo from "../../assets/images/Presta Sign Logo - colour.svg";
import OrganisationIdentifier from "../../components/OrganisationIdentifier";
import {useEffect, useRef} from "react";
const { width, height } = Dimensions.get("window");
type NavigationProps = NativeStackScreenProps<any>;
const SetTenant = (props: NavigationProps) => {
    useEffect(() => {
        return () => {
            Keyboard.removeAllListeners('keyboardDidShow');
        }
    }, []);
    const scrollViewRef = useRef<any>();
    Keyboard.addListener('keyboardDidShow', () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
    });
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView ref={scrollViewRef}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        <Logo style={{alignSelf: 'center', marginTop: 30}} width={width/2} height={height/4} />
                        {/*<Text allowFontScaling={false} style={styles.header}>Start your Digital Journey here</Text>*/}
                        <Text allowFontScaling={false} style={styles.tagLine}>Guarantee and sign loan forms digitally from anywhere, anytime.</Text>
                        <OrganisationIdentifier nav={props} />
                        {/*<Text allowFontScaling={false} style={{ paddingTop: '50%', fontSize: 10, color: '#090A0A', textAlign: 'center', marginBottom: 10, fontFamily: 'Poppins_300Light' }}>By continuing, you agree to Presta's Terms of Service and privacy policy.</Text>*/}
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    inner: {
        position: 'relative',
        padding: 24,
        flex: 1
    },
    header: {
        fontSize: 18,
        marginBottom: 14,
        color: '#487588',
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center'
    },
    tagLine: {
        fontSize: 12,
        marginBottom: 35,
        color: '#515151',
        textAlign: 'center',
        fontFamily: 'Poppins_300Light',
        paddingHorizontal: 20
    },
    textInput: {
        height: 40,
        borderColor: '#000000',
        borderBottomWidth: 1,
        marginBottom: 36,
    },
    btnContainer: {
        backgroundColor: 'white',
        marginTop: 12,
    },
});

export default SetTenant
