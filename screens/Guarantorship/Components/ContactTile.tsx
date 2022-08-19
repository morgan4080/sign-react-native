import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons, Octicons} from "@expo/vector-icons";
import {useState} from "react";
import {updateContact, validateNumber} from "../../../stores/auth/authSlice";
import {store} from "../../../stores/store";
import {useDispatch} from "react-redux";
import {NativeModules} from 'react-native';

interface propInterface {
    contact: any,
    addContactToList: any
    removeContactFromList: any
    contactList: any
}
const { width } = Dimensions.get("window");
export default function contactTile ({contact, addContactToList, removeContactFromList, contactList}: propInterface) {
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const CSTM = NativeModules.CSTM;

    const [selectedContact, setSelectedContact] = useState<boolean>(false)
    const selectContact = async (newValue: boolean, contact: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}) => {
        try {
            let phone: string = ''
            if (contact.phone[0] === '+') {
                let number = contact.phone.substring(1);
                phone = `${number.replace(/ /g, "")}`;
            } else if (contact.phone[0] === '0') {
                let number = contact.phone.substring(1);
                phone = `254${number.replace(/ /g, "")}`;
            }

            const result: any = await dispatch(validateNumber(phone));
            const {payload, type}: {payload: any, type: string} = result;

            if (type === 'validateNumber/rejected') {
                CSTM.showToast(`${contact.name} ${result.error.message}`);
                return
            }
            // update contact with member id and ref id
            let res: boolean = false;
            if (type === "validateNumber/fulfilled") {
                if (newValue) {
                    const statement = `UPDATE contacts SET memberNumber = '${payload?.memberNumber}', memberRefId = '${payload?.refId}' WHERE contact_id = ${contact.contact_id};`;
                    await dispatch(updateContact(statement));
                    res = await addContactToList({
                       ...contact,
                        memberNumber: payload?.memberNumber,
                        memberRefId: payload?.refId
                    });
                } else {
                    removeContactFromList({
                        ...contact,
                        memberNumber: payload?.memberNumber,
                        memberRefId: payload?.refId
                    });
                }
                setSelectedContact(res)
            }
        } catch (e: any) {
            console.log("error", e)
        }
    }

    const isChecked = contactList.find((con: any ) => con.memberNumber === contact.memberNumber);

    return (
        <TouchableOpacity style={[{backgroundColor: isChecked ? 'rgb(50,52,146)' : '#FFFFFF'},styles.main]} onPress={() => selectContact(!selectedContact, contact)}>
            <View style={styles.tile}>
                <View style={{padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', width: width/5}}>
                    <Ionicons name="person-circle" size={40} color="#CCCCCC"/>
                </View>
                <View style={{ width: width * 6.8/12 }}>
                    <View style={{ display: 'flex', flexDirection: 'row'}}>
                        <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_400Regular', color: isChecked ? '#FFFFFF' : '#9a9a9a', fontSize: 13, maxWidth: 200 }}>{contact.name}</Text>
                        {contact.memberNumber &&
                            <View style={{ display: 'flex', flexDirection: 'row'}}>
                                <Octicons style={{paddingLeft: 5}} name="verified" size={12} color="#336DFFFF" />
                                <Text allowFontScaling={false} style={{ color: isChecked ? '#FFFFFF' : '#cccccc', fontSize: 10 }}>{contact.memberNumber}</Text>
                            </View>
                        }
                    </View>
                    <Text allowFontScaling={false} style={{ fontFamily: 'Poppins_300Light', color: isChecked ? '#FFFFFF' : '#9a9a9a', fontSize: 13 }}>{contact.phone}</Text>
                </View>
                <View>
                    {
                        isChecked ?

                            <Ionicons name="ios-checkbox-outline" size={22} color="white"/>

                                :

                            <View style={{width: 22, height: 22, borderWidth: 2, borderColor: '#CCCCCC' }} />
                    }
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    main: {
        marginTop: 20,
        borderRadius: 25,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 6, // Android
    },
    tile: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: 25,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
})


