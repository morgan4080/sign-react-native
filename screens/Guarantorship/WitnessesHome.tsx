import * as React from "react";
import {
    View,
    Text,
    Dimensions,
    StatusBar as Bar,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    TextInput,
    Keyboard
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {getContactsFromDB, searchContactsInDB, setLoading, storeState} from "../../stores/auth/authSlice";
import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";
import {Circle as ProgressCircle} from "react-native-progress";
import {MaterialIcons, Ionicons} from "@expo/vector-icons";
import {useEffect, useState} from "react";
import * as Contacts from 'expo-contacts';
import { useForm, Controller } from "react-hook-form";
import ContactTile from "./Components/ContactTile";
import {PhoneNumber} from "expo-contacts";
import {cloneDeep} from "lodash";
import {RotateView} from "../Auth/VerifyOTP";
type NavigationProps = NativeStackScreenProps<any>
const { width, height } = Dimensions.get("window");
type FormData = {
    searchTerm: string;
    phoneNumber: string;
}
export default function WitnessesHome({ navigation, route }: NavigationProps) {
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const { loading } = useSelector((state: { auth: storeState }) => state.auth);
    const [contacts, setContacts] = useState([])
    const [from, setFrom] = useState(0)
    const [to, setTo] = useState(100)
    useEffect(() => {
        let syncContacts = true;
        (async () => {
            console.log('with constraints')
            await dispatch(getContactsFromDB({setContacts, from, to}));
        })()
        return () => {
            dispatch(setLoading(false));
            Keyboard.removeAllListeners('keyboardDidHide');
            syncContacts = false;
        }
    }, [from, to]);

    useEffect(() => {
        if (loading) {
            if (contacts.length > 0) {
                dispatch(setLoading(false));
            }
        }
        return () => {
            dispatch(setLoading(false));
        };
    }, [contacts]);

    const {
        control,
        watch,
        handleSubmit,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>()
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const filterContactsCB = async (searchTerm: string = '') => {
        await dispatch(searchContactsInDB({searchTerm, setContacts}))
    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            switch (name) {
                case 'searchTerm':
                    if (type === 'change') {
                        console.log(value.searchTerm)
                        filterContactsCB(value.searchTerm);
                    }
                    break;
                case 'phoneNumber':
                    if (type === 'change') {
                        console.log(value.phoneNumber)
                        // search organisation database for user
                    }
                    break;
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [addingManually, setAddingManually] = useState<boolean>(false);

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): number | string => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        setSelectedContacts(newDeserializedCopy);
        return contact2Remove.contact_id;
    }

    const addContactToList = (contact2Add: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let phone: string = '';
        if (contact2Add.phone[0] === '+') {
            let number = contact2Add.phone.substring(1);
            phone = `${number.replace(/ /g, "")}`;
        } else if (contact2Add.phone[0] === '0') {
            let number = contact2Add.phone.substring(1);
            phone = `254${number.replace(/ /g, "")}`;
        }
        const isDuplicate = newDeserializedCopy.some((contact) => {
            let phone0: string = '';
            if (contact.phone[0] === '+') {
                let number = contact.phone.substring(1);
                phone0 = `${number.replace(/ /g, "")}`;
            } else if (contact.phone[0] === '0') {
                let number = contact.phone.substring(1);
                phone0 = `254${number.replace(/ /g, "")}`;
            }
            console.log(phone, phone0);
            return phone0 === phone;
        });
        console.log('duplicate?', isDuplicate);
        if (!isDuplicate) {
            newDeserializedCopy.push(contact2Add);
            setSelectedContacts(newDeserializedCopy);
            return true;
        }
        return false;
    }

    Keyboard.addListener('keyboardDidHide', () => {
        setAddingManually(false)
        console.log("if member was found during the watch process, add them or let them know that member wasn't found")
    })

    if (fontsLoaded) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                {
                    loading &&
                    <View style={{position: 'absolute', top: 50, zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width}}>
                        <RotateView/>
                    </View>
                }
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
                {
                    addingManually && <View style={{ position: 'absolute', zIndex: 5, backgroundColor: 'rgba(0,0,0,0.84)', display: 'flex', justifyContent: 'center', alignItems: 'center', height: height + 100, width }}>
                        <Controller
                            control={control}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input0}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoFocus={true}
                                    placeholder="Enter phone number"
                                    keyboardType="numeric"
                                />
                            )}
                            name="phoneNumber"
                        />
                    </View>
                }
                <View style={styles.container}>
                    <View style={{flex: 1, alignItems: 'center', position: 'relative'}}>
                        <View style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            width,
                            height: 4/12 * height,
                            position: 'relative'
                        }}>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10 }}>
                                <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                            </TouchableOpacity>

                            <View style={{paddingHorizontal: 20, marginTop: 30}}>
                                <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 22 }}>
                                    Enter Witnesses (1 Required)
                                </Text>
                                <Controller
                                    control={control}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Search Phone"
                                        />
                                    )}
                                    name="searchTerm"
                                />

                            </View>
                            <View style={{paddingHorizontal: 20, marginBottom: 20, marginTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <ScrollView horizontal>
                                    {selectedContacts && selectedContacts.map((co,i) => (
                                        <View key={co.contact_id} style={{
                                            backgroundColor: 'rgba(50,52,146,0.31)',
                                            width: width / 7,
                                            height: width / 7,
                                            borderRadius: 100,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 10,
                                            position: 'relative'
                                        }}>
                                            <TouchableOpacity onPress={() => removeContactFromList(co)} style={{ position: 'absolute', top: -2, right: -1 }}>
                                                <MaterialIcons name="cancel" size={24} color="red" />
                                            </TouchableOpacity>
                                            <Text allowFontScaling={false} style={{
                                                color: '#363D7D',
                                                fontSize: 11,
                                                fontFamily: 'Poppins_400Regular',
                                                textAlign: 'center'
                                            }}>{co.name}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1, width, height: 8/12 * height, backgroundColor: '#e8e8e8', borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                            <View style={{ position: 'absolute', marginTop: -35, zIndex: 7, width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => setAddingManually(true)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginVertical: 15 }}>
                                    <MaterialIcons name="dialpad" size={16} color="white" />
                                    <Text allowFontScaling={false} style={styles.buttonText0}>Other</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView contentContainerStyle={{ display: 'flex', marginTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
                                {
                                    contacts && contacts.map((contact: any, i: number) => (
                                        <ContactTile key={contact.contact_id} contact={contact} addContactToList={addContactToList} removeContactFromList={removeContactFromList} />
                                    ))
                                }
                            </ScrollView>
                        </SafeAreaView>

                        <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={ selectedContacts.length < 1 } onPress={() => {
                                navigation.navigate('LoanConfirmation', {
                                    witnesses: selectedContacts,
                                    ...route.params
                                })
                            }} style={{ display: 'flex', alignItems: 'center', backgroundColor: selectedContacts.length < 1 ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <RotateView/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    dialPad: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', width: width/3, height: (height/2)/ 4
    },
    dialPadText: {
        fontSize: 30,
        color: '#336DFF',
        fontFamily: 'Poppins_300Light',
    },
    input: {
        borderWidth: 2,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 54,
        marginTop: 10,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
    },
    input0: {
        borderWidth: 2,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 54,
        width: '80%',
        marginTop: 10,
        paddingHorizontal: 20,
        fontSize: 15,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    },
    buttonText0: {
        fontSize: 15,
        marginLeft: 10,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_300Light',
    }
});
