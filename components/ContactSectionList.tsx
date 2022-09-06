import {SectionList, StyleSheet, Text, View, TouchableOpacity, NativeModules} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {useState} from "react";
import {updateContact, validateNumber} from "../stores/auth/authSlice";
import {store} from "../stores/store";
import {useDispatch} from "react-redux";
const { CSTM } = NativeModules;

type contactType = {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}

type propType = {
    contactsData: {title: string, data: contactType[]}[],
    searching: any,
    addContactToList: any
    removeContactFromList: any
    contactList: any
    onPress: any
    setEmployerDetailsEnabled: any
}

const getAbrev = (name: string) => {
    return name[0]
}

const Item = ({ contact, selectContact, contactList, section, onPress, setEmployerDetailsEnabled }: { contact: contactType, selectContact: any, contactList: any, section: any, setEmployerDetailsEnabled: any, onPress: any }) => {
    const isChecked = contactList.find((con: any ) => con.memberNumber === contact.memberNumber);
    const [selectedContact, setSelectedContact] = useState<boolean>(false);
    if (section.title === 'SELECTED GUARANTORS' || section.title === 'CONTACTS') {
        return (
            <TouchableOpacity onPress={async () => {
                try {
                    const res = await selectContact(!selectedContact, contact);
                    setSelectedContact(isChecked);
                } catch (e) {
                    console.log("selectContact", e)
                }
            }} style={{
                ...styles.item,
                backgroundColor: isChecked ? 'rgba(72,154,171,0.77)' : '#FFFFFF'
            }}>
                <View style={{flex: 0.1}}>
                    {
                        isChecked ?

                            <Ionicons name="radio-button-on-sharp" size={24} color="white"/>

                            :

                            <View
                                style={{width: 22, height: 22, borderWidth: 1, borderRadius: 50, borderColor: '#CCCCCC'}}/>
                    }
                </View>
                <View style={{flex: 0.13}}>
                    <View style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 30,
                        height: 30,
                        backgroundColor: '#489AAB',
                        borderRadius: 50
                    }}>
                        <Text allowFontScaling={false} style={{
                            ...styles.title,
                            fontSize: 12,
                            color: '#FFFFFF'
                        }}>{getAbrev(contact.name).toUpperCase()}</Text>
                    </View>
                </View>
                <View style={{flex: 0.67}}>
                    <Text allowFontScaling={false}
                          style={{...styles.title, color: isChecked ? '#FFFFFF' : '#393a34', fontSize: 13, fontFamily: 'Poppins_500Medium'}}>{contact.name}</Text>
                    <Text allowFontScaling={false}
                          style={{...styles.title, color: isChecked ? '#FFFFFF' : '#393a34', fontSize: 12, fontFamily: 'Poppins_300Light'}}>{contact.phone}</Text>
                </View>
                <Text allowFontScaling={false} style={{
                    ...styles.title,
                    fontSize: 10,
                    flex: 0.1,
                    color: isChecked ? '#FFFFFF' : '#393a34'
                }}>{contact.memberNumber}</Text>
            </TouchableOpacity>
        )
    } else {
        return (
            <TouchableOpacity onPress={() => {
                setEmployerDetailsEnabled(false);
                onPress('options');
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20}}>
                <View style={styles.optionsButton} >
                    <Ionicons name="options-outline" size={20} color="white" style={{padding: 5}} />
                </View>
                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#000000', fontSize: 10, paddingLeft: 10 }}>OPTIONS</Text>
            </TouchableOpacity>
        )
    }
};

const ContactSectionList = ({contactsData, searching, addContactToList, removeContactFromList, contactList, onPress, setEmployerDetailsEnabled}: propType) => {

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const selectContact = async (newValue: boolean, contact: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}) => {
        console.log("selecting contact", newValue, contact);
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
                return res
            }
        } catch (e: any) {
            console.log("error", e)
        }
    }

    return (
        <SectionList
            sections={contactsData}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item, section }) => (<Item contact={item} section={section} selectContact={selectContact} contactList={contactList} onPress={onPress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} />)}
            renderSectionHeader={({ section: { title, data } }) => data.length > 0 ? (<Text allowFontScaling={false} style={{ fontSize: 12, fontFamily: 'Poppins_300Light', paddingHorizontal: 20, paddingVertical: title !== 'OPTIONS' ? 10 : 0, backgroundColor: '#FFFFFF' }}>{title}</Text>) : (<></>)}
            stickySectionHeadersEnabled={true}
            refreshing={searching}
        />
    )
};

const styles = StyleSheet.create({
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        padding: 20
    },
    title: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular'
    },
    optionsButton: {
        backgroundColor: '#489AAB',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        width: 35,
        height: 35,
    },
});

export default ContactSectionList;
