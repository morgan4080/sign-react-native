import {
    StyleSheet,
    Keyboard,
    Button,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Text,
    View,
    Dimensions
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import Logo from "../../assets/images/Presta Sign Logo - colour.svg";
import OrganisationIdentifier from "../../components/OrganisationIdentifier";
const { width, height } = Dimensions.get("window");
type NavigationProps = NativeStackScreenProps<any>;
const SetTenant = (props: NavigationProps) => {
    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.inner}>
                    <Logo style={{alignSelf: 'center'}} width={width/2} height={height/3} />
                    <Text allowFontScaling={false} style={styles.header}>Start your Digital Journey here</Text>
                    <Text allowFontScaling={false} style={styles.tagLine}>Guarantee and sign loan forms digitally from anywhere, anytime.</Text>
                    <OrganisationIdentifier nav={props} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    inner: {
        padding: 24,
        flex: 1,
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
