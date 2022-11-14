import {Pressable, StyleSheet, TextInput, View} from "react-native";
import OrganisationSelected from "./OrganisationSelected";
import {useEffect} from "react";
import {
    AuthenticateClient, setSelectedTenant,
    storeState
} from "../stores/auth/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../stores/store";
import {AntDesign} from "@expo/vector-icons";
import {deleteSecureKey} from "../utils/secureStore";
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
const OrganisationIdentifier = ({ nav }: { nav: NavigationProps }) => {
    const {selectedTenant} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
    if (nav.route.params?.selectedTenant) {
        deleteSecureKey("access_token").then(() => {
            dispatch(setSelectedTenant(nav.route.params?.selectedTenant));
        })
    }
    useEffect(() => {
        let changing = true;
        if (selectedTenant && changing) {
            dispatch(AuthenticateClient(selectedTenant)).then((response: any) => {
                if (response.type === 'AuthenticateClient/rejected' && response.error) {
                    console.log("AuthenticateClient", response.error.message)
                }
            }).catch(error => {
                console.log("AuthenticateClient error", error)
            })
        }
        return () => {
            changing = false;
        }
    }, [selectedTenant])
    return (
        <View>
            <Pressable style={{...styles.input, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}} onPress={() => nav.navigation.navigate('Organisations')}>
                <TextInput
                    allowFontScaling={false}
                    style={{fontFamily: 'Poppins_400Regular', color: '#101828', fontSize: 13, width: '90%'}}
                    placeholder="SELECT ORGANISATION"
                    value={selectedTenant?.tenantName}
                    editable={false}
                />
                <AntDesign name="right" size={20} color="#8d8d8d" />
            </Pressable>
            <OrganisationSelected tenantId={selectedTenant?.tenantId} nav={nav} />
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#8d8d8d',
        borderRadius: 8,
        height: 50,
        fontSize: 14,
        paddingHorizontal: 20,
        lineHeight: 1,
        fontFamily: 'Poppins_400Regular',
        color: '#E3E5E5'
    },
});

export default OrganisationIdentifier;
