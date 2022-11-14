import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {FlatList, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View, StatusBar} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedTenant, storeState} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {deleteSecureKey} from "../../utils/secureStore";
type AppDispatch = typeof store.dispatch;
type NavigationProps = NativeStackScreenProps<any>;

const Organisations = ({navigation, route}: NavigationProps) => {
    const { organisations, loading, selectedTenantId } = useSelector((state: { auth: storeState }) => state.auth);
    const dispatch : AppDispatch = useDispatch();
    const reFetch = () => {

    }
    const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
        <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
            <Text allowFontScaling={false} style={[styles.tenantName, textColor]}>{item.tenantName}</Text>
        </TouchableOpacity>
    );
    const renderItem = ({ item }: any) => {
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
    return (
        <KeyboardAvoidingView style={styles.container}>
            <KeyboardAvoidingView style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: 20, paddingHorizontal: 5}}>
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_600SemiBold', fontSize: 17, lineHeight: 22, color: '#489AAB', letterSpacing: 0.5, paddingTop: 20, paddingBottom: 10 }}>Choose Organisation</Text>
            </KeyboardAvoidingView>
            <FlatList
                refreshing={loading}
                progressViewOffset={50}
                onRefresh={reFetch}
                data={organisations}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ListFooterComponent={<View style={{height: 50}} />}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#FFFFFF'
    },
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
