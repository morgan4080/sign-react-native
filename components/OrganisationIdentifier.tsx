import {StyleSheet, Text, View} from "react-native";
import OrganisationSelected from "./OrganisationSelected";
import {useEffect, useState} from "react";
import {organisationType, storeState} from "../stores/auth/authSlice";
import {useSelector} from "react-redux";
import {useForm, Controller} from "react-hook-form";
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

type FormData = {
    organisationSelected: organisationType | undefined
}
type NavigationProps = NativeStackScreenProps<any>;
const OrganisationIdentifier = ({ nav }: { nav: NavigationProps }) => {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });
    const {organisations} = useSelector((state: { auth: storeState }) => state.auth)
    const [organisationSelected, setOrganisationSelected] = useState<organisationType | undefined>(undefined)

    return (
        <View>
            <View style={styles.input0}>
                <Picker
                    mode={"dialog"}
                    selectedValue={organisationSelected}
                    dropdownIconRippleColor={'#487588'}
                    onValueChange={(itemValue, itemIndex) => {
                        setOrganisationSelected(itemValue);
                    }}>
                    <Picker.Item fontFamily='Poppins_300Light' style={{fontSize: 16, color: 'rgba(9,16,29,0.34)'}} key={'custom'} label={'Select Organisation..'} value={undefined}/>
                    {organisations.map(org => <Picker.Item style={{fontSize: 16, color: '#101828'}} fontFamily='Poppins_300Light' key={org.clientSecret} label={org.tenantName.toUpperCase()} value={org}/>)}
                </Picker>
            </View>
            <OrganisationSelected tenantId={organisationSelected?.tenantId} nav={nav} />
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
