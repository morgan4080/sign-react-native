import React from "react";
import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {RotateView} from "../screens/Auth/VerifyOTP";
import {
    Poppins_600SemiBold,
    useFonts
} from "@expo-google-fonts/poppins";
interface ComponentProps extends React.ComponentPropsWithoutRef<any> {
    loading: boolean;
    label: string;
}
const TouchableButton = ({loading, label, ...props}: ComponentProps) => {
    useFonts({
        Poppins_600SemiBold
    })
    return (
        <TouchableOpacity disabled={loading} style={styles.buttonActive} {...props}>
            {
                loading ?
                    <RotateView color={"#FFFFFF"}/> :
                    <Text allowFontScaling={false} style={styles.buttonText}>{label}</Text>
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonActive: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#489bab',
        marginTop: 54,
        width: "100%",
        height: 45,
        borderRadius: 12,
        marginBottom: 34
    },
    buttonText: {
        fontSize: 16,
        letterSpacing: 0.15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    },
})

export default TouchableButton