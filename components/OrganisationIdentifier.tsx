import {StyleSheet, Text, View} from "react-native";
import OrganisationSelected from "./OrganisationSelected";
import {useEffect, useState} from "react";
import {
    AuthenticateClient,
    logoutUser,
    organisationType,
    setSelectedTenant,
    storeState
} from "../stores/auth/authSlice";
import {useDispatch, useSelector} from "react-redux";
import {Picker} from "@react-native-picker/picker";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../stores/store";
import {deleteSecureKey} from "../utils/secureStore";
type NavigationProps = NativeStackScreenProps<any>;
type AppDispatch = typeof store.dispatch;
const OrganisationIdentifier = ({ nav }: { nav: NavigationProps }) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });
    const {organisations, selectedTenant} = useSelector((state: { auth: storeState }) => state.auth)
    const dispatch : AppDispatch = useDispatch();
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
            <View style={styles.input0}>
                <Picker
                    mode={"dialog"}
                    selectedValue={selectedTenant}
                    dropdownIconRippleColor={'#487588'}
                    onValueChange={(itemValue, itemIndex) => {
                        deleteSecureKey("access_token").then(() => {
                            dispatch(setSelectedTenant(itemValue));
                        })
                    }}>
                    <Picker.Item fontFamily='Poppins_300Light' style={{fontSize: 16, color: 'rgba(9,16,29,0.34)'}} key={'custom'} label={'Select Organisation..'} value={undefined}/>
                    {organisations.map(org => <Picker.Item style={{fontSize: 16, color: '#101828'}} fontFamily='Poppins_300Light' key={org.clientSecret} label={org.tenantName.toUpperCase()} value={org}/>)}
                </Picker>
            </View>
            <OrganisationSelected tenantId={selectedTenant?.tenantId} nav={nav} />
        </View>
    )
}

const styles = StyleSheet.create({
    input0: {
        borderWidth: 1,
        borderColor: '#E3E5E5',
        borderRadius: 8,
        height: 50,
        lineHeight: 1,
        fontFamily: 'Poppins_400Regular',
    },
});

export default OrganisationIdentifier;
