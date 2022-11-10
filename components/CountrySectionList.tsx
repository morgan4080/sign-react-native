import {Image, SectionList, StyleSheet, Text, View, Pressable} from 'react-native'

type propType = {countriesData: any, searching: any, navigationSet: (code: string, numericCode?: string, alpha2Code?: string, flag?: string) => void}

const CountrySectionList = ({countriesData, searching, navigationSet}: propType) => {

    const Item = ({ country }: { country: {name: string, code: string, numericCode: string, alpha2Code: string, flag: any} }) => (
        <Pressable onPress={() => {
            navigationSet(country.code, country.numericCode, country.alpha2Code, country.flag)
        }} style={styles.item}>
            <View style={{flex: 0.1}}>
                <Image source={{uri: country?.flag}} style={{width: 20, height: 15}}/>
            </View>
            <Text style={{...styles.title, flex: 0.8}}>{country.name}</Text>
            <Text style={{...styles.title, fontSize: 16, flex: 0.1}}>{country.code}</Text>
        </Pressable>
    );

    return (
        <SectionList
            sections={countriesData}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item }) => <Item country={item} />}
            renderSectionHeader={({ section: { title } }) => (
                <></>
            )}
            stickySectionHeadersEnabled={true}
            refreshing={searching}
        />
    )
}

const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        padding: 20
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins_400Regular'
    }
})

export default CountrySectionList;
