import {ScrollView, StyleSheet, TouchableOpacity, Text} from "react-native";
import {useFonts, Poppins_600SemiBold} from "@expo-google-fonts/poppins";
interface ComponentProps {
    buttons: {
        label: string;
        selected: boolean;
    }[]
}
const SegmentedButtons = ({buttons}: ComponentProps) => {
    useFonts({
        Poppins_600SemiBold
    })
    return (
        <ScrollView contentContainerStyle={styles.container} horizontal>
            {
                buttons.map((button, i) => (
                    <TouchableOpacity key={i}>
                        <Text allowFontScaling={false} style={styles.buttonText}>{button.label}</Text>
                    </TouchableOpacity>
                ))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 15,
        backgroundColor: "rgba(72,154,171,0.25)"
    },
    button: {
        borderRadius: 15,
        backgroundColor: "rgb(72,154,171)"
    },
    buttonText: {
        fontSize: 15,
        fontFamily: "Poppins_600SemiBold"
    }
})

export default SegmentedButtons