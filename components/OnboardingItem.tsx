import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native'

const OnboardingItem = ({ item }: any) => {

    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <Image source={item.image} style={[styles.image, { width: width/2, resizeMode: 'contain' }]}/>
            <View style={{ flex: 0.3 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    image: {
        flex: 0.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },

    title: {
        fontWeight: '800',
        fontSize: 28,
        marginBottom: 10,
        color: 'rgb(61,136,154)',
        textAlign: 'center'
    },

    description: {
        fontWeight: '300',
        color: '#62656b',
        textAlign: 'center',
        paddingHorizontal: 64
    }
})

export default OnboardingItem
