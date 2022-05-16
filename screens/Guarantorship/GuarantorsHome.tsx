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
import {setLoading, storeState} from "../../stores/auth/authSlice";
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
import {EvilIcons, Ionicons} from "@expo/vector-icons";
import {useCallback, useEffect, useState} from "react";
import * as Contacts from 'expo-contacts';
import { useForm, Controller } from "react-hook-form";
import ContactTile from "./Components/ContactTile";
import {PhoneNumber} from "expo-contacts";
import {cloneDeep} from "lodash";
type NavigationProps = NativeStackScreenProps<any>
const { width, height } = Dimensions.get("window");
type FormData = {
    searchTerm: string;
}
export default function GuarantorsHome({ navigation, route }: NavigationProps) {
    const { loading } = useSelector((state: { auth: storeState }) => state.auth);
    // console.log("route params", route.params)
    const [contacts, setContacts] = useState<any[]>([])
    type AppDispatch = typeof store.dispatch;
    const dispatch : AppDispatch = useDispatch();
    const {
        control,
        watch,
        handleSubmit,
        setError,
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

    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const { data } = await Contacts.getContactsAsync();
                if (data.length > 0) {
                    const clean = data.reduce((acc:any[],contact: any) => {
                        if (contact.phoneNumbers && contact.phoneNumbers.length > 0 ) {
                            acc.push(contact)
                        }
                        return acc
                    },[])
                    setContacts(clean)
                    console.log(clean)
                }
            }
        })();
    }, []);

    const filterContactsCB = (searchTerm: any = '') => {
        const filteredContacts = contacts.reduce((acc,contact) => {
            if (contact.phoneNumbers && contact.phoneNumbers.length > 0 ) {
                const re = new RegExp(searchTerm);
                if (contact.phoneNumbers.some((phone:PhoneNumber) => re.test(phone.number as string) )) {
                    acc.push(contact)
                }
            }
            return acc
        },[]);
        if (filteredContacts.length > 0) {
            setContacts(filteredContacts)
        }
    }

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (value.searchTerm !== '') {
                filterContactsCB(value.searchTerm);
            } else {
                (async () => {
                    const { status } = await Contacts.requestPermissionsAsync();
                    if (status === 'granted') {
                        Keyboard.dismiss()
                        dispatch(setLoading(true))
                        const { data } = await Contacts.getContactsAsync();
                        if (data.length > 0) {
                            const clean = data.reduce((acc:any[],contact: any) => {
                                if (contact.phoneNumbers && contact.phoneNumbers.length > 0 ) {
                                    acc.push(contact)
                                }
                                return acc
                            },[])
                            setContacts(clean)
                            console.log(clean)
                        }
                        dispatch(setLoading(false))
                    }
                })();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const removeContactToList = (contact2Remove: any) => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts)
        let index = newDeserializedCopy.findIndex(contact => contact.id === contact2Remove.id)
        newDeserializedCopy.splice(index, 1)
        setSelectedContacts(newDeserializedCopy)
    }

    const addContactToList = (contact2Add: any) => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts)
        newDeserializedCopy.push(contact2Add)
        setSelectedContacts(newDeserializedCopy)
    }

    if (fontsLoaded) {
        return (
            <View style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
                <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
                <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
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

                            <View style={{paddingHorizontal: 20, marginTop: 50}}>
                                <Text style={{ textAlign: 'left', color: '#323492', fontFamily: 'Poppins_600SemiBold', fontSize: 22, maxWidth: 200 }}>
                                    Enter Guarantors ({route.params?.loanProduct.requiredGuarantors} Required)
                                </Text>
                                <Controller
                                    control={control}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Phone or Member Number"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="searchTerm"
                                />

                            </View>
                            <View style={{paddingHorizontal: 20, marginTop: 15, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <ScrollView horizontal>
                                    {selectedContacts && selectedContacts.map((co,i) => (
                                        <View key={co.id} style={{
                                            backgroundColor: 'rgba(50,52,146,0.31)',
                                            width: width / 6,
                                            height: width / 6,
                                            borderRadius: 100,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 10,
                                            position: 'relative'
                                        }}>
                                            <TouchableOpacity onPress={() => removeContactToList(co)} style={{ position: 'absolute', top: -2, right: -1 }}>
                                                <Ionicons name="ios-remove-circle" size={24} color="pink" />
                                            </TouchableOpacity>
                                            <Text style={{
                                                color: '#363D7D',
                                                fontSize: 12,
                                                fontFamily: 'Poppins_400Regular',
                                                textAlign: 'center'
                                            }}>{co.name}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                        <SafeAreaView style={{ flex: 1, width, height: 8/12 * height }}>
                            <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 100 }}>
                                {
                                    !loading && contacts && contacts.map((contact: any, i: number) => (
                                        <ContactTile key={contact.id} contact={contact} addContactToList={addContactToList} removeContactToList={removeContactToList} />
                                    ))
                                }
                                {
                                    loading && <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                                        <ProgressCircle indeterminate={true} size={50} />
                                    </View>
                                }
                            </ScrollView>
                        </SafeAreaView>

                        <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ display: 'flex', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                <Text style={styles.buttonText}>CONTINUE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height, width }}>
                <ProgressCircle indeterminate={true} size={50} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
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
    buttonText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold',
    }
});
