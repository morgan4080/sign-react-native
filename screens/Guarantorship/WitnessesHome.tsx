import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import {Picker} from "@react-native-picker/picker";

import ContactTile from "./Components/ContactTile";

import {NativeStackScreenProps} from "@react-navigation/native-stack";

import {
    getContactsFromDB,
    searchByMemberNo,
    searchContactsInDB,
    setLoading,
    validateNumber
} from "../../stores/auth/authSlice";

import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";

import {FontAwesome5, Ionicons, MaterialIcons} from "@expo/vector-icons";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import {Controller, useForm} from "react-hook-form";

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import cloneDeep from "lodash/cloneDeep";

import {RotateView} from "../Auth/VerifyOTP";

import BottomSheet, {BottomSheetBackdrop, BottomSheetFlatList} from "@gorhom/bottom-sheet";
import {showSnack} from "../../utils/immediateUpdate";
import {useAppDispatch, useLoading, useMember, useSettings} from "../../stores/hooks";

type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");

type FormData = {
    searchTerm: string;
    phoneNumber: string | undefined;
    memberNumber: string | undefined;
    employerName: string;
    amountToGuarantee: string | undefined;
    inputStrategy: string | number;
    employerDetails: boolean;
    serviceNo: string;
    grossSalary: string;
    netSalary: string;
    businessLocation: string;
    businessType: string;
};

export default function GuarantorsHome({ navigation, route }: NavigationProps) {

    const [loading] = useLoading();
    const [settings] = useSettings();
    const [member] = useMember();

    const dispatch = useAppDispatch();

    const [contacts, setContacts] = useState([]);

    const from = 0;

    const to = 15;

    const [memberSearching, setMemberSearching] = useState<boolean>(false);

    const [context, setContext] = useState<string>("");

    useEffect(() => {
        let syncContacts = true;
        (async () => {
            await dispatch(getContactsFromDB({setContacts, from, to}));
        })()
        return () => {
            dispatch(setLoading(false));
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
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            employerDetails: settings && settings.employerInfo
        }
    });

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
        await dispatch(searchContactsInDB({searchTerm, setContacts}));
    };
    const [inputStrategy, setInputStrategy] = useState<number | string | undefined>(0);
    const [memberNumber, setMemberNumber] = useState<number | string | undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState<number | string | undefined>(undefined);
    const [allGuaranteedAmounts, setAllGuaranteedAmounts] = useState<string[]>([]);

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            (async () => {
                switch (name) {
                    case 'searchTerm':
                        if (type === 'change') {
                            await filterContactsCB(value.searchTerm);
                        }
                        break;
                    case 'phoneNumber':
                        if (type === 'change') {
                            setPhoneNumber(value.phoneNumber);
                            setMemberSearching(true);
                        }
                        break;
                    case 'memberNumber':
                        if (type === 'change') {
                            setMemberNumber(value.memberNumber);
                            setMemberSearching(true);
                        }
                        break;
                    case 'inputStrategy':
                        setValue('memberNumber', undefined);
                        setValue('phoneNumber', undefined);
                        setInputStrategy(value.inputStrategy);
                        break;
                }
            })()
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
        amountsToG.splice(index, 1);
        setAllGuaranteedAmounts(amountsToG);
        setSelectedContacts(newDeserializedCopy);
        return true;
    }

    const addContactToList = async (contact2Add: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}, press: boolean = true): Promise<boolean> => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let phone: string = '';
        if (contact2Add.phone[0] === '+') {
            let number = contact2Add.phone.substring(1);
            phone = `${number.replace(/ /g, "")}`;
        } else if (contact2Add.phone[0] === '0') {
            let number = contact2Add.phone.substring(1);
            phone = `254${number.replace(/ /g, "")}`;
        } else if (contact2Add.phone[0] === '2') {
            phone = `${contact2Add.phone}`;
        }

        const isDuplicate = newDeserializedCopy.some((contact) => {
            let phone0: string = '';
            if (contact.phone[0] === '+') {
                let number = contact.phone.substring(1);
                phone0 = `${number.replace(/ /g, "")}`;
            } else if (contact.phone[0] === '0') {
                let number = contact.phone.substring(1);
                phone0 = `254${number.replace(/ /g, "")}`;
            } else if (contact2Add.phone[0] === '2') {
                phone = `${contact2Add.phone}`;
            }

            return (phone0 === phone || contact2Add.phone === contact.phone || contact2Add.memberRefId === contact.memberRefId);
        });

        if (!isDuplicate) {
            newDeserializedCopy.push(contact2Add);
            setSelectedContacts(newDeserializedCopy);
            return Promise.resolve(true);
        } else {
            showSnack('Cannot add duplicate guarantors');
        }

        return Promise.resolve(false);
    }

    const addToSelected = async (identifier: string) => {
        try {
            if (inputStrategy === 1) {
                let phone: string = ''
                if (identifier[0] === '+') {
                    let number = identifier.substring(1);
                    phone = `${number.replace(/ /g, "")}`;
                } else if (identifier[0] === '0') {
                    let number = identifier.substring(1);
                    phone = `254${number.replace(/ /g, "")}`;
                } else if (identifier[0] === '2') {
                    phone = `${identifier}`;
                }

                const result: any = await dispatch(validateNumber(phone));

                const {payload, type}: {payload: any, type: string} = result;

                if (type === 'validateNumber/rejected') {
                    showSnack(`${phone} ${result.error.message}`);
                    return
                }

                if (type === "validateNumber/fulfilled" && member) {
                    // add this guy to contact table
                    // result added, add to contact list

                    let memberCustom = {
                        contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                        memberNumber: `${payload.memberNumber}`,
                        memberRefId: `${payload.refId}`,
                        name: `${payload.firstName}`,
                        phone: `${payload.phoneNumber}`
                    }
                    await addContactToList(memberCustom, false);
                }
            }

            if (inputStrategy === 0) {
                // implement search by memberNo

                const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(searchByMemberNo(identifier))

                if (type === 'searchByMemberNo/rejected') {
                    showSnack(`${error.message}`);
                    return
                }

                if (type === "searchByMemberNo/fulfilled" && member) {
                    // add this guy to contact table
                    // result added, add to contact list

                    if (!payload.hasOwnProperty("isTermsAccepted")) {
                        showSnack(`${identifier}: is not a member.`);
                        return
                    }

                    let memberCustom = {
                        contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                        memberNumber: `${payload.memberNumber}`,
                        memberRefId: `${payload.refId}`,
                        name: `${payload.firstName}`,
                        phone: `${payload.phoneNumber}`
                    }

                    await addContactToList(memberCustom, false);
                }
            }
        } catch (e: any) {
            console.log(e.message)
        }
    }

    const setSelectedValue = (itemValue: string | number) => {
        setValue('inputStrategy', itemValue)
    }

    const sheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

    // callbacks
    const handleSheetChange = useCallback((index: any) => {
        console.log("handleSheetChange", index);
    }, []);

    const handleSnapPress = useCallback((index: any) => {
        sheetRef.current?.snapToIndex(index);
    }, []);

    const handleClosePress = useCallback(() => {
        sheetRef.current?.close();
    }, []);

    const [bSActive, setBSActive] = useState(false);

    const onPress = useCallback((ctx: string) => {
        if (!bSActive) {
            setContext(ctx);
            handleSnapPress(1);
        } else {
            handleClosePress();
        }
        setBSActive(!bSActive);
        setMemberSearching(false);
    }, []);

    const submitSearch = async (ctx: string) => {
        if (ctx === 'search') {
            if (inputStrategy === 1 && phoneNumber) {
                await addToSelected(phoneNumber.toString());
            } else if (inputStrategy === 0 && memberNumber) {
                await addToSelected(`${memberNumber}`);
            }

            return
        }
    }

    const navigateUser = async () => {
        navigation.navigate('LoanConfirmation', {
            witnesses: selectedContacts,
            ...route.params
        })
    }

    const [witnessOptions, setWitnessOptions] = useState([
        {
            id: "1",
            name: "Search Member No.",
            context: "search",
            icon: "verified-user"
        },
        {
            id: "2",
            name: "Search Phone No.",
            context: "search",
            icon: "phone-iphone"
        },
        {
            id: "3",
            name: "Self Guarantee",
            context: "self-guarantee",
            icon: "self-improvement"
        }
    ]);

    useEffect(() => {
        if (settings && !settings.selfGuarantee) {
            const newOptions = witnessOptions.filter(option => option.context !== "self-guarantee");
            setWitnessOptions(newOptions);
        }
    }, []);

    const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
        <TouchableOpacity onPress={onPress} style={[styles.option, backgroundColor]}>
            <MaterialIcons name={item.icon} size={24} style={[textColor]} />
            <Text allowFontScaling={false} style={[styles.optionName, textColor]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: any) => {
        const backgroundColor = item.context === context? "#489AAB" : "#FFFFFF";
        const color = item.context === context ? 'white' : '#767577';

        return (
            <Item
                item={item}
                onPress={() => {
                    if (item.context === 'self-guarantee') {
                        // submit self as guarantor
                        if (member && member.memberNumber) {
                            (async () => {
                                await addToSelected(member.memberNumber);
                            })()
                        }
                        return
                    }
                    if (item.name === 'Search Member No.') setValue('inputStrategy', 0)
                    if (item.name === 'Search Phone No.') setValue('inputStrategy', 1)
                    setContext(item.context);
                }}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

    const isDisabled = () => {
        return selectedContacts.length < 1
    }

    // disappearsOnIndex={1}
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={1}
            />
        ),
        []
    );

    return (
        <GestureHandlerRootView style={{flex: 1, position: 'relative', alignItems: 'center'}}>
            <View style={[styles.searchbar]}>
                <View style={{paddingHorizontal: 20, marginBottom: 5}}>

                    <View style={{position: 'relative', display: 'flex', flexDirection: 'row', overflow: 'hidden'}}>
                        <View style={{position: 'absolute', display: 'flex', height: 45, zIndex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Ionicons name="search" size={25} color="#CCCCCC" style={{paddingHorizontal: 10}} />
                        </View>

                        <Controller
                            control={control}
                            render={( { field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    allowFontScaling={false}
                                    style={styles.input}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Search Contacts"
                                />
                            )}
                            name="searchTerm"
                        />
                        <TouchableOpacity style={styles.optionsButton} onPress={() => {
                            onPress('options');
                        }}>
                            <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#FFFFFF', fontSize: 10, paddingLeft: 10 }}>OPTIONS</Text>
                            <Ionicons name="options-outline" size={20} color="white" style={{paddingLeft: 5, paddingRight: 15}} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{paddingHorizontal: 20, marginTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <ScrollView horizontal>
                        {selectedContacts && selectedContacts.map((co,i) => (
                            <TouchableOpacity onPress={() => removeContactFromList(co)} key={i} style={{
                                backgroundColor: 'rgba(72,154,171,0.18)',
                                width: width / 7,
                                height: width / 7,
                                borderRadius: 100,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 10,
                                position: 'relative'
                            }}>
                                <View style={{ position: 'absolute', top: 0, right: -1 }}>
                                    <FontAwesome5 name="minus-circle" size={14} color="#767577" />
                                </View>
                                <Text allowFontScaling={false} style={{
                                    color: '#489AAB',
                                    fontSize: 8,
                                    fontFamily: 'Poppins_400Regular',
                                    textAlign: 'center',
                                    zIndex: 2
                                }}>{co.name.split(' ')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <SafeAreaView style={{ flex: 1, width, borderTopLeftRadius: 15, borderTopRightRadius: 15, backgroundColor: "rgba(72,154,171,0.05)" }}>
                <ScrollView contentContainerStyle={{ display: 'flex', paddingHorizontal: 20, paddingBottom: 100 }}>
                    {
                        contacts.length ? contacts.map((contact: any, i: number) => (
                                <ContactTile key={contact.contact_id} contact={contact} addContactToList={addContactToList} removeContactFromList={removeContactFromList} contactList={selectedContacts} />
                            )) :
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
                                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', fontSize: 12}}>No Contacts Found</Text>
                            </View>
                    }
                </ScrollView>
            </SafeAreaView>

            <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity disabled={ isDisabled() || loading } onPress={navigateUser} style={{ display: 'flex', alignItems: 'center', backgroundColor: isDisabled() || loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                    <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                </TouchableOpacity>
            </View>
            <BottomSheet
                ref={sheetRef}
                index={-1}
                snapPoints={snapPoints}
                onChange={handleSheetChange}
                backdropComponent={renderBackdrop}
            >
                {context === "options" &&
                    <BottomSheetFlatList
                        data={witnessOptions}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                }
                { context === "search" &&
                    <View style={{display: 'flex', alignItems: 'center', width}}>
                        <Text allowFontScaling={false} style={styles.subtitle}>Search Member</Text>
                        <Controller
                            control={control}
                            render={( {field: {onChange, onBlur, value}}) => (
                                <View style={styles.input0}>
                                    <Picker
                                        itemStyle={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                        style={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 14, marginTop: -5, marginLeft: -15 }}
                                        onBlur={onBlur}
                                        selectedValue={value}
                                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                                        mode="dropdown"
                                    >
                                        {[
                                            {
                                                name: "Member Number",
                                                value: 0
                                            },
                                            {
                                                name: "Phone Number",
                                                value: 1
                                            }
                                        ].map((p, i) =>(
                                            <Picker.Item key={i} label={p.name} value={p.value} color='#767577' fontFamily='Poppins_400Regular' />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                            name="inputStrategy"
                        />

                        { inputStrategy === 1 && <Controller
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (
                                <TextInput
                                    allowFontScaling={false}
                                    style={styles.input0}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="0720000000"
                                    keyboardType="numeric"
                                />
                            )}
                            name="phoneNumber"
                        />}

                        {inputStrategy === 0 && <Controller
                            control={control}
                            render={({field: {onChange, onBlur, value}}) => (
                                <TextInput
                                    allowFontScaling={false}
                                    style={styles.input0}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    placeholder="Enter member number"
                                />
                            )}
                            name="memberNumber"
                        />}
                    </View>
                }

                <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity disabled={!memberSearching || loading} onPress={() => submitSearch(context)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: !memberSearching || loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                        {loading && <RotateView/>}
                        <Text allowFontScaling={false} style={styles.buttonText}>{context === 'search' ? 'Search' : 'Submit'}</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative'
    },
    searchbar: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width,
        position: 'relative',
        marginBottom: 10,
        marginTop: 10,
        paddingBottom: 10
    },
    dialPad: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: width/3,
        height: (height/2)/ 4
    },
    dialPadText: {
        fontSize: 20,
        color: '#489AAB',
        fontFamily: 'Poppins_300Light'
    },
    subtitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        paddingHorizontal: 30,
        marginBottom: 5
    },
    tabTitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 12,
        padding: 5
    },
    input: {
        borderWidth: 2,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        height: 45,
        paddingLeft: 50,
        fontSize: 12,
        color: '#767577',
        width: '100%',
        fontFamily: 'Poppins_400Regular'
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 45,
        width: '90%',
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20
    },
    buttonText: {
        fontSize: 15,
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
    },
    option: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: width/1.12,
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        borderColor: '#CCCCCC',
        borderWidth: .5,
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
    },
    optionName: {
        fontSize: 16,
        fontFamily: 'Poppins_300Light',
        marginLeft: 10
    },
    optionsButton: {
        backgroundColor: '#489AAB',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderRightWidth: 2,
        borderColor: '#cccccc',
        position: 'absolute',
        right: 1,
        borderTopRightRadius: 13,
        borderBottomRightRadius: 13,
        top: 0,
        height: 45,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
