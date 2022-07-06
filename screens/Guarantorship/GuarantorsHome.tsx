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
    Keyboard,
    NativeModules,
    TouchableHighlight
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import {NativeStackScreenProps} from "@react-navigation/native-stack";

import {store} from "../../stores/store";

import {useDispatch, useSelector} from "react-redux";

import {
    getContactsFromDB,
    searchContactsInDB,
    setLoading,
    storeState,
    validateNumber
} from "../../stores/auth/authSlice";

import {
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium, Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
    useFonts
} from "@expo-google-fonts/poppins";

import {MaterialIcons, Ionicons} from "@expo/vector-icons";

import {useEffect, useRef, useState} from "react";

import { useForm, Controller } from "react-hook-form";

import ContactTile from "./Components/ContactTile";

import {cloneDeep} from "lodash";

import {RotateView} from "../Auth/VerifyOTP";

import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, useAnimatedGestureHandler, withSpring} from "react-native-reanimated";

import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";

import configuration from "../../utils/configuration"

type NavigationProps = NativeStackScreenProps<any>;

const { width, height } = Dimensions.get("window");
type FormData = {
    searchTerm: string;
    phoneNumber: string | undefined;
    memberNumber: string | undefined;
    inputStrategy: string | number;
};

export default function GuarantorsHome({ navigation, route }: NavigationProps) {
    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { loading, tenants, selectedTenantId } = useSelector((state: { auth: storeState }) => state.auth);

    const [contacts, setContacts] = useState([]);

    const CSTM = NativeModules.CSTM;

    const [from, setFrom] = useState(0);

    const [to, setTo] = useState(100);

    const settings = configuration.find(conf => conf.tenantId === selectedTenantId);

    useEffect(() => {
        let syncContacts = true;
        (async () => {
            await dispatch(getContactsFromDB({setContacts, from, to}));
        })()
        return () => {
            dispatch(setLoading(false));
            Keyboard.removeAllListeners('keyboardDidHide');
            Keyboard.removeAllListeners('keyboardDidShow');
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
    } = useForm<FormData>();

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
    const [keyboardHidden, setKeyboardHidden] = useState<boolean>(false);

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
                            if (keyboardHidden) {
                                console.log(phoneNumber);
                            }
                        }
                        break;
                    case 'memberNumber':
                        if (type === 'change') {
                            setMemberNumber(value.memberNumber);
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

    const addToSelected = async (identifier: string) => {
        if (inputStrategy === 1) {
            let phone: string = ''
            if (identifier[0] === '+') {
                let number = identifier.substring(1);
                phone = `${number.replace(/ /g, "")}`;
                console.log('starts @+' ,phone);
            } else if (identifier[0] === '0') {
                let number = identifier.substring(1);
                console.log('starts @0', `254${number.replace(/ /g, "")}`);
                phone = `254${number.replace(/ /g, "")}`;
            }

            const result: any = await dispatch(validateNumber(phone));

            const {payload, type}: {payload: any, type: string} = result;

            if (type === 'validateNumber/rejected') {
                console.log(`${phone} ${result.error.message}`)
                CSTM.showToast(`${phone} ${result.error.message}`);
                return
            }

            if (type === "validateNumber/fulfilled") {
                // add this guy to contact table
                // result added, add to contact list
                console.log(payload)
            }
        }
    }

    useEffect(() => {
        let searchingManual = true;
        (async () => {
            if (searchingManual) {
                if (keyboardHidden && inputStrategy === 0 && memberNumber) {
                    console.log(memberNumber);

                }
                if (keyboardHidden && inputStrategy === 1 && phoneNumber) {
                    console.log(phoneNumber);
                    await addToSelected(phoneNumber.toString());
                }
            }
        })();
        return () => {
            searchingManual = false;
        };
    }, [keyboardHidden]);

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [addingManually, setAddingManually] = useState<boolean>(false);
    const [employerInput, setEmployerInput] = useState<boolean>(false);

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        setSelectedContacts(newDeserializedCopy);
        return true;
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

            return phone0 === phone;
        });

        if (!isDuplicate) {
            newDeserializedCopy.push(contact2Add);
            setSelectedContacts(newDeserializedCopy);
            settings && setEmployerInput(settings.employerInfo)
            return true;
        }
        return false;
    }

    Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHidden(true);
    });

    Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardHidden(false);
    });

    const setSelectedValue = (itemValue: string | number) => {
        setValue('inputStrategy', itemValue)
    }

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const requiredGuarantors = () => {

        if (tenant && tenant.tenantId === 't74411') {
            return 1
        }

        if (tenant && tenant.tenantId === 't72767') {
            return 4
        }

        return 1
    }

    const opacity = useSharedValue(0);

    const style = useAnimatedStyle(() => {
        return {
            opacity: withTiming(opacity.value + 1, {
                duration: 500,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
        };
    });

    const SCREEN_HEIGHT = height + (Bar.currentHeight ? Bar.currentHeight : 0);
    const MAX_TRANSLATE_Y = -SCREEN_HEIGHT/1.5;

    const translateY = useSharedValue(0);

    const context = useSharedValue({y: 0});

    const gesture = Gesture.Pan().onStart(() => {
        context.value = { y: translateY.value };
    }).onUpdate((event) => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    }).onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT/3) {
            translateY.value = withSpring(0, { damping: 50 });
            setTimeout(() => {
                setAddingManually(false);
            },1000)
        } else if (translateY.value < -SCREEN_HEIGHT/ 3) {
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
        }
    });

    const transform = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }]
        }
    });

    const launchOther = () => {
        setAddingManually(true);
        setTimeout(() => {
            translateY.value = withSpring(-SCREEN_HEIGHT/1.5, {
                damping: 50
            });
        }, 500);
    };

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
                addingManually &&
                <GestureHandlerRootView style={{ position: 'absolute', zIndex: 12, height: height + (Bar.currentHeight ? Bar.currentHeight : 0), width }}>
                    <Animated.View style={[style, {height: "100%", width: "100%", backgroundColor: 'rgba(0,0,0,0.5)'}]}>
                        <GestureDetector gesture={gesture}>
                            <Animated.View style={[
                                { position: 'absolute', top: height + (Bar.currentHeight ? Bar.currentHeight : 0), zIndex: 12, borderRadius: 25, backgroundColor: '#FFFFFF', height, width },
                                transform
                            ]}>
                                <View style={{width: 75, height: 4, backgroundColor: 'grey', borderRadius: 2, marginVertical: 15, alignSelf: 'center'}}></View>
                                <ScrollView contentContainerStyle={{display: 'flex', alignItems: 'center', width}}>
                                    <Controller
                                        control={control}
                                        render={( { field: { onChange, onBlur, value } }) => (
                                            <View style={styles.input0}>
                                                <Picker
                                                    style={{color: '#767577', fontFamily: 'Poppins_400Regular', fontSize: 15, }}
                                                    onBlur={onBlur}
                                                    selectedValue={value}
                                                    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                                                >
                                                    { [{name: "Member Number", value: 0}, {name: "Phone Number", value: 1}].map((p, i) =>(
                                                        <Picker.Item key={i} label={p.name} value={p.value} color='#767577' fontFamily='Poppins_500Medium' />
                                                    ))}
                                                </Picker>
                                                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_400Regular', color: '#cccccc', marginTop: 10, marginLeft: -5, fontSize: 10}}>Select Desired Identifier</Text>
                                            </View>
                                        )}
                                        name="inputStrategy"
                                    />

                                    {inputStrategy === 1 && <Controller
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
                                </ScrollView>
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>
                </GestureHandlerRootView>
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
                        <TouchableOpacity onPress={() => navigation.navigate('ProfileMain')} style={{ position: 'absolute', backgroundColor: '#CCCCCC', borderRadius: 100, top: 10, left: 10, zIndex: 11 }}>
                            <Ionicons name="person-circle" color="#FFFFFF" style={{ paddingLeft: 2 }} size={35} />
                        </TouchableOpacity>

                        <View style={{paddingHorizontal: 20, marginTop: 30}}>
                            <Text allowFontScaling={false} style={{ textAlign: 'left', color: '#489AAB', fontFamily: 'Poppins_600SemiBold', fontSize: 18 }}>
                                Enter Guarantors ({route.params?.loanProduct.requiredGuarantors} Required)
                            </Text>
                            <Controller
                                control={control}
                                render={( { field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        allowFontScaling={false}
                                        style={styles.input}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Search Contact name or phone"
                                    />
                                )}
                                name="searchTerm"
                            />
                        </View>
                        <View style={{paddingHorizontal: 20, marginBottom: 20, marginTop: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <ScrollView horizontal>
                                {selectedContacts && selectedContacts.map((co,i) => (
                                    <View key={i} style={{
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
                                            fontSize: 10,
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
                            <TouchableHighlight onPress={() => launchOther()} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginVertical: 15 }}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                    <MaterialIcons name="dialpad" size={16} color="white" />
                                    <Text allowFontScaling={false} style={styles.buttonText0}>Other</Text>
                                </View>
                            </TouchableHighlight>
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
                        <TouchableOpacity disabled={selectedContacts.length < requiredGuarantors()} onPress={() => navigation.navigate('WitnessesHome', {
                            guarantors: selectedContacts,
                            ...route.params
                        })} style={{ display: 'flex', alignItems: 'center', backgroundColor: selectedContacts.length < requiredGuarantors() ? '#CCCCCC' : '#336DFF', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                            <Text allowFontScaling={false} style={styles.buttonText}>CONTINUE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
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
      fontSize: 20,
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
        fontSize: 14,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 54,
        width: '90%',
        marginTop: 10,
        paddingHorizontal: 20,
        fontSize: 14,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 20,
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
    }
});
