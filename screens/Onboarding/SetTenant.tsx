import {
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    Text,
    Platform,
} from "react-native";
import OrganisationIdentifier from "../../components/OrganisationIdentifier";
import {useEffect} from "react";
import {saveSecureKey} from "../../utils/secureStore";
import {Poppins_700Bold, useFonts} from "@expo-google-fonts/poppins";
import Container from "../../components/Container";
import {RootStackScreenProps} from "../../types";
const SetTenant = ({navigation, route}: RootStackScreenProps<"SetTenant">) => {
    useFonts({
        Poppins_700Bold
    });
    useEffect(() => {
        (async () =>{
            await saveSecureKey('otp_verified', 'false');
        })()
    }, []);
    return (
        <Container>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <>
                    <Text allowFontScaling={false} style={styles.title}>
                        Start your digital guarantorship journey here.
                    </Text>
                    <Text allowFontScaling={false} style={styles.description}>
                        Guarantee and sign loan forms digitally from anywhere, anytime.
                    </Text>
                    <OrganisationIdentifier navigation={navigation} route={route} />
                </>
            </TouchableWithoutFeedback>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    inner: {
        position: 'relative',
        paddingVertical: 24,
        flex: 1
    },
    header: {
        fontSize: 18,
        marginBottom: 14,
        color: '#487588',
        fontFamily: 'Poppins_600SemiBold',
        textAlign: 'center'
    },
    title: {
        marginTop: Platform.OS === 'android' ? 100 : 60,
        fontFamily: "Poppins_700Bold",
        fontSize: 34,
        color: '#0C212C',
        textAlign: "left",
        lineHeight: 41,
        letterSpacing: 0.6
    },

    description: {
        marginTop: 20,
        fontWeight: '300',
        color: '#62656b'
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
