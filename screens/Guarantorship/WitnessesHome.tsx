import {
    Dimensions,
    FlatList,
    NativeModules,
    SafeAreaView,
    ScrollView,
    StatusBar as Bar,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableHighlight,
    View
} from "react-native";

import {Picker} from "@react-native-picker/picker";

import ContactTile from "./Components/ContactTile";

import {NativeStackScreenProps} from "@react-navigation/native-stack";

import {store} from "../../stores/store";

import {useDispatch, useSelector} from "react-redux";

import {
    authenticate,
    getContactsFromDB,
    searchByMemberNo,
    searchContactsInDB,
    setLoading,
    storeState,
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

import {AntDesign, FontAwesome5, Ionicons, MaterialIcons} from "@expo/vector-icons";

import {useCallback, useEffect, useRef, useState} from "react";

import {Controller, useForm} from "react-hook-form";

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import cloneDeep from "lodash/cloneDeep";

import {RotateView} from "../Auth/VerifyOTP";

import configuration from "../../utils/configuration";

import BottomSheet, {BottomSheetRefProps, MAX_TRANSLATE_Y} from "../../components/BottomSheet";

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
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { loading, tenants, selectedTenantId, user, member, isLoggedIn } = useSelector((state: { auth: storeState }) => state.auth);

    const [contacts, setContacts] = useState([]);

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const settings = configuration.find(config => config.tenantId === (tenant ? tenant.tenantId : user?.tenantId));

    const CSTM = NativeModules.CSTM;

    const [from, setFrom] = useState(0);

    const [to, setTo] = useState(15);

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
        handleSubmit,
        setError,
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
            CSTM.showToast('Cannot add duplicate guarantors');
        }

        return Promise.resolve(false);
    }

    const addToSelected = async (identifier: string) => {
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
                CSTM.showToast(`${phone} ${result.error.message}`);
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
                CSTM.showToast(`${error.message}`);
                return
            }

            if (type === "searchByMemberNo/fulfilled" && member) {
                // add this guy to contact table
                // result added, add to contact list

                if (payload.length < 1) {
                    CSTM.showToast(`${identifier}: is not a member.`);
                    return
                }

                let memberCustom = {
                    contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                    memberNumber: `${payload[0].memberNumber}`,
                    memberRefId: `${payload[0].refId}`,
                    name: `${payload[0].firstName}`,
                    phone: `${payload[0].phoneNumber}`
                }

                await addContactToList(memberCustom, false);
            }
        }
    }

    const setSelectedValue = (itemValue: string | number) => {
        setValue('inputStrategy', itemValue)
    }

    const ref = useRef<BottomSheetRefProps>(null);

    const onPress = useCallback((ctx: string) => {
        setContext(ctx);
        const isActive = ref?.current?.isActive();
        if (isActive) {
            ref?.current?.scrollTo(0);
        } else {
            ref?.current?.scrollTo(MAX_TRANSLATE_Y);
        }
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

    useEffect(() => {
        let authenticating = true;
        if (authenticating) {
            (async () => {
                const response = await dispatch(authenticate());
                if (response.type === 'authenticate/rejected') {
                    navigation.navigate('GetTenants')
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, [isLoggedIn]);

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

    return (
        <GestureHandlerRootView style={{flex: 1, paddingTop: Bar.currentHeight, position: 'relative'}}>
            {
                loading &&
                <View style={{position: 'absolute', top: 50, zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width}}>
                    <RotateView/>
                </View>
            }
            <View style={{ position: 'absolute', left: 60, top: -120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
            <View style={{ position: 'absolute', left: -100, top: 200, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 200, height: 200 }} />
            <View style={{ position: 'absolute', right: -80, top: 120, backgroundColor: 'rgba(50,52,146,0.12)', paddingHorizontal: 5, paddingVertical: 5, borderRadius: 100, width: 150, height: 150 }} />
            <View style={styles.container}>
                <View style={{flex: 1, alignItems: 'center', position: 'relative'}}>
                    <View style={styles.searchbar}>
                        <View style={{paddingHorizontal: 20, marginBottom: 5}}>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 16, marginBottom: 10 }}>
                                Add Witnesses (1 Required)
                            </Text>

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
                                    <Ionicons name="options-outline" size={25} color="white" style={{paddingHorizontal: 15}} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{paddingHorizontal: 20, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <ScrollView horizontal>
                                {selectedContacts && selectedContacts.map((co,i) => (
                                    <TouchableOpacity onPress={() => removeContactFromList(co)} key={i} style={{
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
                                        <View style={{ position: 'absolute', top: 0, right: -1 }}>
                                            <FontAwesome5 name="minus-circle" size={14} color="#767577" />
                                        </View>
                                        <Text allowFontScaling={false} style={{
                                            color: '#363D7D',
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
                    <SafeAreaView style={{ flex: 1, width, height: 10/12 * height, borderTopLeftRadius: 25, borderTopRightRadius: 25, }}>
                        <ScrollView contentContainerStyle={{ display: 'flex', marginTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}>
                            {
                                contacts.length ? contacts.map((contact: any, i: number) => (
                                        <ContactTile key={contact.contact_id} contact={contact} addContactToList={addContactToList} removeContactFromList={removeContactFromList} contactList={selectedContacts} />
                                    )) :
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                        <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', fontSize: 12}}>No Contacts Found</Text>
                                    </View>
                            }
                        </ScrollView>
                    </SafeAreaView>

                    <View style={{ position: 'absolute', bottom: 0, zIndex: 2, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity disabled={ isDisabled() || loading } onPress={navigateUser} style={{ display: 'flex', alignItems: 'center', backgroundColor: isDisabled() || loading ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                            <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <BottomSheet ref={ref}>
                <SafeAreaView style={{position: 'relative',display: 'flex', alignItems: 'center', width, height: (height + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)) + (height/11) }}>
                    <TouchableOpacity style={{position: 'absolute', top: -25, right: 12}} onPress={() => {
                        onPress('options');
                    }}>
                        <AntDesign name="closecircleo" size={15} color="#767577" />
                    </TouchableOpacity>
                    {context === "options" &&
                        <FlatList
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
                        <TouchableOpacity disabled={!memberSearching || loading} onPress={() => submitSearch(context)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: !memberSearching || loading ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                            {loading && <RotateView/>}
                            <Text allowFontScaling={false} style={styles.buttonText}>{context === 'search' ? 'Search' : 'Submit'}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
        height: 2/12 * height,
        position: 'relative',
        marginTop: 30,
        marginBottom: 20
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
        color: '#336DFF',
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
