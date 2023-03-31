import { Poppins_600SemiBold, useFonts } from "@expo-google-fonts/poppins";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {useSelector} from "react-redux";
import {storeState} from "../../stores/auth/authSlice";
type NavigationProps = NativeStackScreenProps<any>;

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
        <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
    </TouchableOpacity>
);

const RenderItem = ({ item, selectedTenantId, navigation }: any) => {
    const backgroundColor = item.id === selectedTenantId ? "#489AAB" : "#FFFFFF";
    const color = item.id === selectedTenantId ? 'white' : 'black';

    return (
        <Item item={item} onPress={() => {
            navigation.navigate('SetTenant', {
                code: "254",
                numericCode: "404",
                alpha2Code: "KE",
                flag: "https://flagcdn.com/28x21/ke.png",
                selectedTenant: item
            })
        }} backgroundColor={{ backgroundColor }} textColor={{ color }} />
    )
}

const Organisations = ({navigation, route}: NavigationProps) => {
    useFonts({
        Poppins_600SemiBold,
    });
    const { organisations, loading, selectedTenantId } = useSelector((state: { auth: storeState }) => state.auth);
    const reFetch = () => {

    }
    
    
    return (
        <SafeAreaView>
            <KeyboardAvoidingView style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: 20, paddingHorizontal: 5}}>
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_600SemiBold', fontSize: 17, lineHeight: 22, color: '#489AAB', letterSpacing: 0.5, paddingTop: 20, paddingBottom: 10 }}>Choose Organisation</Text>
            </KeyboardAvoidingView>
            <FlatList
                refreshing={loading}
                progressViewOffset={50}
                onRefresh={reFetch}
                data={organisations}
                renderItem={({item}) => {
                    return <RenderItem item={item} selectedTenantId={selectedTenantId} navigation={navigation} />
                }}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{height: 50}} />}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    tenantName: {
        fontSize: 16,
        fontFamily: 'Poppins_300Light',
        lineHeight: 22,
        letterSpacing: 0.5
    },
})

export default Organisations;
