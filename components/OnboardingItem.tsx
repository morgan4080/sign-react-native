import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native'
import {Poppins_700Bold, useFonts} from "@expo-google-fonts/poppins";

const OnboardingItem = ({ item }: any) => {

    useFonts({
        Poppins_700Bold
    })

    const { width, height } = useWindowDimensions();

    return (
        <View style={{flex: 1, width: width * 0.93, height: height * 0.84}}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 80 }}>
                <Image source={item.image} style={[styles.image, { width: width * 0.93, resizeMode: 'contain' }]}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({

    image: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },

    title: {
        marginTop: 10,
        fontFamily: "Poppins_700Bold",
        fontSize: 34,
        color: '#0C212C',
        textAlign: "left",
        lineHeight: 41,
        letterSpacing: 0.6,
        width: "90%"
    },

    description: {
        marginTop: 60,
        fontWeight: '300',
        color: '#62656b'
    }
})

export default OnboardingItem
