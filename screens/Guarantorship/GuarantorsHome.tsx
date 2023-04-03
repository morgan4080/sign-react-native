import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
    LoadOrganisation,
    searchByMemberNo,
    validateNumber
} from "../../stores/auth/authSlice";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity
} from "react-native";
type NavigationProps = NativeStackScreenProps<any>;
import {useForm} from "react-hook-form";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getContact, requestPhoneNumberFormat} from "../../utils/smsVerification";
import {getSecureKey} from "../../utils/secureStore";
import {cloneDeep} from "lodash";
import ContactSectionList from "../../components/ContactSectionList";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop, BottomSheetFlatList  } from "@gorhom/bottom-sheet";
import {toMoney} from "../User/Account";
import {showSnack} from "../../utils/immediateUpdate";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";
import {
    useAppDispatch, useClientSettings,
    useLoading,
    useMember,
    useSettings, useUser
} from "../../stores/hooks";
import {Poppins_300Light, Poppins_400Regular, useFonts} from "@expo-google-fonts/poppins";
type searchedMemberType = { contact_id: string; memberNumber: string; memberRefId: string; name: string; phone: string }
type FormData = {
    searchTerm: string;
    amountToGuarantee: string | undefined;
    employerName: string;
    employerDetails: boolean;
    serviceNo: string;
    grossSalary: string;
    netSalary: string;
    kraPin: string;
    businessLocation: string;
    businessType: string;
};
type employerPayloadType = {
    employerName: string | undefined;
    serviceNo: string | undefined;
    grossSalary: string | undefined;
    netSalary: string | undefined;
    kraPin: string | undefined;
};
type businessPayloadType = {
    businessLocation: string | undefined;
    businessType: string | undefined;
    kraPin: string | undefined;
};
const { width } = Dimensions.get("window");

const Item = ({ item, onPress, backgroundColor, textColor }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.option, backgroundColor]}>
        <MaterialIcons name={item.icon} size={24} style={[textColor]} />
        <Text allowFontScaling={false} style={[styles.optionName, textColor]}>{item.name}</Text>
    </TouchableOpacity>
);

const RenderItem = ({ item, context, member, setValue, route, searchMemberByMemberNo, addContactToList, handleClosePress, setEmployerDetailsEnabled, setContext }: any) => {
    const backgroundColor = item.context === context? "#489AAB" : "#FFFFFF";
    const color = item.context === context ? 'white' : '#767577';

    return (
        <Item
            item={item}
            onPress={() => {
                if (item.context === 'self-guarantee') {
                    // submit self as guarantor
                    if (member && member.memberNumber) {
                        setValue("amountToGuarantee", route.params?.loanDetails.desiredAmount);
                        searchMemberByMemberNo(member.memberNumber)
                            .then(addContactToList)
                            .catch((e: any) => {
                                showSnack(e.message, "WARNING");
                            });
                    } else {
                        handleClosePress();
                    }
                    return
                }
                setEmployerDetailsEnabled(false);
                setContext(item.context);
            }}
            backgroundColor={{ backgroundColor }}
            textColor={{ color }}
        />
    );
};

const GuarantorsHome = ({ navigation, route }: NavigationProps) => {
    const [member] = useMember();
    const [loading] = useLoading();
    const [settings] = useSettings();
    const [clientSettings] = useClientSettings();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(LoadOrganisation())
            .catch((error) => showSnack(error.message, "ERROR"))
    }, []);

    console.log(JSON.stringify(clientSettings));

    useFonts([
        Poppins_300Light,
        Poppins_400Regular
    ]);

    const {
        control,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm<FormData>();

    const [searching, setSearching] = useState<boolean>(false);

    const [context, setContext] = useState<string>("");

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const [allGuaranteedAmounts, setAllGuaranteedAmounts] = useState<string[]>([]);

    const [employerDetailsEnabled, setEmployerDetailsEnabled] = useState(false);

    const [heldMember, setHeldMember] = useState<searchedMemberType | null>(null);

    const [employerPayload, setEmployerPayload] = useState<employerPayloadType>();

    const [businessPayload, setBusinessPayload] = useState<businessPayloadType>();

    const [currentGuarantor, setCurrentGuarantor] = useState<{contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}>()

    const requiredGuarantors = () => {
        if (route.params?.loanProduct.requiredGuarantors === 0) {
            return 0
        } else if (route.params?.loanProduct.requiredGuarantors) {
            return route.params?.loanProduct.requiredGuarantors
        } else if (settings) {
            return settings.minGuarantors
        } else {
            return 1
        }
    }

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
        amountsToG.splice(index, 1);
        setAllGuaranteedAmounts(amountsToG);
        setSelectedContacts(newDeserializedCopy);
        return true;
    };

    const searchMemberByPhone = async (phone: string): Promise<searchedMemberType | undefined> => {
        const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(validateNumber(phone));

        if (type === 'validateNumber/rejected') {
            showSnack(`${phone} ${error?.message}`, "WARNING");
            return undefined;
        }

        if (type === "validateNumber/fulfilled" && member) {
            return {
                contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                memberNumber: `${payload.memberNumber}`,
                memberRefId: `${payload.refId}`,
                name: `${payload.firstName}`,
                phone: `${payload.phoneNumber}`
            };
        }
    }

    const searchMemberByMemberNo = async (member_no: string): Promise<searchedMemberType | undefined> => {
        const {payload, type}: {payload: any, type: string, error?: any} = await dispatch(searchByMemberNo(member_no));

        if (type === 'searchByMemberNo/rejected') {
            showSnack(`${member_no}: is not a member.`, "WARNING");
            return undefined;
        }

        if (type === "searchByMemberNo/fulfilled" && member) {
            if (payload && !payload.hasOwnProperty("firstName")) {
                showSnack(`${member_no}: is not a member.`, "WARNING");
                return undefined;
            }

            return {
                contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                memberNumber: `${payload.memberNumber}`,
                memberRefId: `${payload.refId}`,
                name: `${payload.firstName}`,
                phone: `${payload.phoneNumber}`
            }
        }
    }

    const isDuplicateGuarantor = (member: searchedMemberType) => {
        return cloneDeep(selectedContacts).some((contact) => (member.phone === contact.phone || member.memberRefId === contact.memberRefId));
    }

    const addContactToList = async (searchedMember: searchedMemberType | undefined) => {
        if (searchedMember) {
            if (!isDuplicateGuarantor(searchedMember)) {
                // if amount required take it
                if (settings && settings.guarantors === 'value' && settings.amounts) {
                    setCurrentGuarantor(searchedMember);

                    setContext('amount');

                    setHeldMember(searchedMember);

                    handleSnapPress(1);

                } else if (settings && settings.guarantors === 'count' && member) {
                    // calculate amount to guarantee
                    const theAmount = (selectedContacts.length <= 4) ? route.params?.loanDetails.desiredAmount/requiredGuarantors() : route.params?.loanDetails.desiredAmount/selectedContacts.length;

                    const amountsToG: any[] = cloneDeep(allGuaranteedAmounts);

                    amountsToG.push(theAmount);

                    setAllGuaranteedAmounts(amountsToG);

                    const newDeserializedCopy: any[] = cloneDeep(selectedContacts);

                    newDeserializedCopy.push(searchedMember);

                    setSelectedContacts(newDeserializedCopy);

                    setValue('searchTerm', '');

                    handleClosePress();
                }
            } else {
                setValue('searchTerm', '');
                showSnack("Duplicate Entry", "WARNING");
                handleClosePress();
            }
        }
    }

    const [phonebook_contact_name, set_phonebook_contact_name] = useState("");

    const un_guaranteed = () => {
        return `${route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount)}`;
    }

    // add to sectionList
    // ${route.params?.loanProduct.requiredGuarantors} ${route.params?.loanProduct.requiredGuarantors == 1 ? 'Guarantor' : 'Guarantors'}`

    const calculateGuarantorship = useCallback((amount: string): any => {
        if (settings && settings.guarantors) {
            if (settings.guarantors === 'value') {
                // sum all guarantors amount inputs until they equal amount
                // when sum === amount stop ability to add guarantors
                let summation = allGuaranteedAmounts.reduce((a, b) => {
                    return a + parseInt(b)
                }, 0);

                return `${summation}`
            }
            if (settings.guarantors === 'count') {
                // split requiredGuarantors to amount
                // when sum === amount stop ability to add guarantors

                let summation = allGuaranteedAmounts.reduce((a, b) => {
                    return a + parseInt(b)
                }, 0);

                return `${summation}`
            }
            return "0"
        }
        return amount
    },[allGuaranteedAmounts]);

    const isDisabled = () => {
        if (requiredGuarantors() === 0) return false
        let reminder = route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount);
        if (reminder > 2) {
            return true
        }
        return selectedContacts.length < requiredGuarantors();
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
            if (ctx === 'employment') {
                handleSnapPress(2);
            } else {
                handleSnapPress(1);
            }
        } else {
            handleClosePress();
        }
        setBSActive(!bSActive)
    }, []);

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

    const [guarantorshipOptions, setGuarantorshipOptions] = useState<any[]>([]);

    useEffect(() => {
        let change = true;
        if (change) {
            if (clientSettings && clientSettings.allowSelfGuarantee) {
                setGuarantorshipOptions([{
                    id: "1",
                    name: "Self Guarantee",
                    context: "self-guarantee",
                    icon: "self-improvement"
                }]);
            }
        }
        return () => {
            change = false;
        }
    }, [clientSettings])

    /*const toggleEmployerDetailsEnabled = () => setEmployerDetailsEnabled((previousState: boolean) => {
        if (!previousState) {
            handleSnapPress(2);
        } else {
            setContext('options');
            handleClosePress();
        }
        return !previousState
    });*/

    const [tab, setTab] = useState<number>(0);

    const submitEdit = () => {
        const [phoneRegex, memberNoRegex] = [
            /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{4}$/i,
            /^(?=.*[0-9a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{3,8}$/i
        ];
        if (memberNoRegex.test(getValues("searchTerm"))) {
            searchMemberByMemberNo(getValues("searchTerm"))
                .then(addContactToList)
                .catch(e => {
                    showSnack(e.message, "WARNING");
                });
        } else if (phoneRegex.test(getValues("searchTerm"))) {
            getSecureKey("alpha2Code")
                .then(alpha2Code => requestPhoneNumberFormat(alpha2Code, getValues("searchTerm")))
                .then((jsonDat) => Promise.resolve(JSON.parse(jsonDat)))
                .then(({country_code, phone_no}) => searchMemberByPhone(`${country_code}${phone_no}`))
                .then(addContactToList)
                .catch(e => {
                    showSnack(e.message, "WARNING");
                })
        } else {
            showSnack("Incorrect Format", "WARNING");
        }
    }

    const submitAmount = () => {
        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
        amountsToG.push(getValues("amountToGuarantee"));
        setAllGuaranteedAmounts(amountsToG);
        setValue("amountToGuarantee", "");
        handleClosePress();
        const newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        newDeserializedCopy.push({...heldMember, amountToGuarantee: getValues("amountToGuarantee")});
        setSelectedContacts(newDeserializedCopy);
    }

    const submitKYC = () => {
        clearErrors();
        if (tab === 0) {
            // set payload for employer
            // check em
            if (getValues("employerName") === undefined || getValues("employerName") === "" || getValues("employerName") === null) {
                setError("employerName", {type: 'custom', message: "required"});
                return
            }
            if (getValues("serviceNo") === undefined || getValues("serviceNo") === "" || getValues("serviceNo") === null) {
                setError("serviceNo", {type: 'custom', message: "required"});
                return
            }
            if (getValues("grossSalary") === undefined || getValues("grossSalary") === "" || getValues("grossSalary") === null) {
                setError("grossSalary", {type: 'custom', message: "required"});
                return
            }
            if (getValues("netSalary") === undefined || getValues("netSalary") === "" || getValues("netSalary") === null) {
                setError("netSalary", {type: 'custom', message: "required"});
                return
            }
            if (getValues("kraPin") === undefined || getValues("kraPin") === "" || getValues("kraPin") === null) {
                setError("kraPin", {type: 'custom', message: "required"});
                return
            }
            let payloadCode = {
                employerName: getValues("employerName"),
                serviceNo: getValues("serviceNo"),
                grossSalary: getValues("grossSalary"),
                netSalary: getValues("netSalary"),
                kraPin: getValues("kraPin")
            };

            console.log('employed', payloadCode);
            setEmployerPayload(payloadCode);
            handleClosePress();
        } else if (tab === 1) {
            if (getValues("businessLocation") === undefined || getValues("businessLocation") === "" || getValues("businessLocation") === null) {
                setError("businessLocation", {type: 'custom', message: "required"});
                return
            }
            if (getValues("businessType") === undefined || getValues("businessType") === "" || getValues("businessType") === null) {
                setError("businessType", {type: 'custom', message: "required"});
                return
            }
            if (getValues("kraPin") === undefined || getValues("kraPin") === "" || getValues("kraPin") === null) {
                setError("kraPin", {type: 'custom', message: "required"});
                return
            }


            let payloadCode = {
                businessLocation: getValues("businessLocation"),
                businessType: getValues("businessType"),
                kraPin: getValues("kraPin")
            };

            console.log('business', payloadCode);

            setBusinessPayload(payloadCode);

            handleClosePress();
        }
    }

    const navigateUser = async () => {
        if (
            member &&
            route.params &&
            route.params.loanProduct &&
            route.params.loanDetails &&
            (selectedContacts.length > 0 || route.params?.loanProduct.requiredGuarantors === 0)
        ) {
            if (settings) {
                if (settings.employerInfo  && !(employerPayload || businessPayload)) {
                    setEmployerDetailsEnabled(true);
                    onPress("employment");
                    return;
                }

                if (clientSettings.requireWitness) {
                    navigation.navigate('WitnessesHome', {
                        guarantors: selectedContacts.map((cont, i) => {
                            if (settings.amounts) {
                                cont = {
                                    ...cont,
                                    committedAmount: allGuaranteedAmounts[i]
                                }
                            }
                            return cont
                        }),
                        employerPayload,
                        businessPayload,
                        ...route.params
                    })
                } else if (!clientSettings.requireWitness) {
                    navigation.navigate('LoanConfirmation', {
                        witnesses: [],
                        guarantors: selectedContacts.map((cont, i) => {
                            if (settings.amounts) {
                                cont = {
                                    ...cont,
                                    committedAmount: allGuaranteedAmounts[i]
                                }
                            }
                            return cont
                        }),
                        employerPayload,
                        businessPayload,
                        ...route.params
                    })
                }
            } else {
                showSnack(`SETTINGS NOT AVAILABLE`, "WARNING");
            }
        } else {
            showSnack(`CANNOT VALIDATE GUARANTORS`, "WARNING");
        }
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.searchableHeader}>
                <TouchableOpacity style={{flex: 0.1,display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onPress={handleSubmit(submitEdit)}>
                    <AntDesign name="search1" size={22} color="rgba(0,0,0,0.89)" />
                </TouchableOpacity>
                <View style={{flex: 0.6, display: 'flex', alignItems: 'center'}}>
                    <TextField label={"mobile/member no."} field={"searchTerm"} val={getValues} watch={watch} control={control} error={errors.searchTerm} required={true} />
                </View>
                <TouchableOpacity style={{ flex: 0.3, display: "flex", flexDirection: "row", justifyContent: 'space-around', alignItems: 'center' }} onPress={() => {
                    setSearching(true);
                    getSecureKey("alpha2Code")
                    .then(alpha2Code => getContact(421, alpha2Code))
                    .then((data) => {
                        if (data) {
                            const dataObject = JSON.parse(data);
                            set_phonebook_contact_name(`${dataObject.name ? dataObject.name : "" }`);
                            setValue('searchTerm', `${dataObject.country_code}${dataObject.phone_no}`);
                            return searchMemberByPhone(`${dataObject.country_code}${dataObject.phone_no}`);
                        }
                    })
                    .then(addContactToList)
                    .catch(e => {
                        showSnack(e.message, "WARNING");
                    }).finally(() => {
                        setSearching(false);
                    });
                }}>
                    <Text allowFontScaling={false} style={{ flex: 0.8, fontFamily: 'Poppins_400Regular', letterSpacing: 0.6, fontSize: 10, color: '#000000', textTransform: "capitalize"}}>{ phonebook_contact_name !== "" ? phonebook_contact_name : 'Phone Book' }</Text>

                    <AntDesign name="contacts" size={22} color="rgba(0,0,0,0.89)" style={{ flex: 0.3 }} />
                </TouchableOpacity>
            </View>
            <ContactSectionList
                contactsData={
                    [0].reduce((acc: {id: number; title: string; data: any[]}[], curr) => {
                        if (guarantorshipOptions.length === 0) {
                            acc = [
                                {
                                    id: 2,
                                    title:`SELECTED GUARANTORS (REQUIRES ${route.params?.loanProduct.requiredGuarantors} ${route.params?.loanProduct.requiredGuarantors == 1 ? 'GUARANTOR' : 'GUARANTORS'})`,
                                    data: selectedContacts.length > 0 ? selectedContacts : [
                                        {
                                            name: false
                                        }
                                    ]
                                }
                            ]
                        } else {
                            acc = [
                                {
                                    id: 1,
                                    title: 'OPTIONS',
                                    data: [
                                        {
                                            name: ''
                                        }
                                    ]
                                },
                                {
                                    id: 2,
                                    title:`SELECTED GUARANTORS (REQUIRES ${route.params?.loanProduct.requiredGuarantors} ${route.params?.loanProduct.requiredGuarantors == 1 ? 'GUARANTOR' : 'GUARANTORS'})`,
                                    data: selectedContacts.length > 0 ? selectedContacts : [
                                        {
                                            name: false
                                        }
                                    ]
                                }
                            ]
                        }
                        return acc
                    }, [])
                }
                searching={searching}
                addContactToList={addContactToList}
                removeContactFromList={removeContactFromList}
                contactList={selectedContacts}
                onPress={onPress}
                setEmployerDetailsEnabled={setEmployerDetailsEnabled}
            />
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
                <TouchableOpacity style={{ position: 'absolute', top: -25, right: 12, backgroundColor: '#767577', borderRadius: 15 }} onPress={() => {
                    setEmployerDetailsEnabled(false);
                    onPress('options');
                }}>
                    <AntDesign name="close" size={15} style={{padding: 2}} color="#FFFFFF" />
                </TouchableOpacity>
                {context === "options" ?
                    <BottomSheetFlatList
                        data={guarantorshipOptions}
                        keyExtractor={item => item.id}
                        renderItem={({i, item}: any) => (
                            <RenderItem
                                item={item}
                                context={context}
                                member={member}
                                setValue={setValue}
                                route={route}
                                searchMemberByMemberNo={searchMemberByMemberNo}
                                addContactToList={addContactToList}
                                handleClosePress={handleClosePress}
                                setEmployerDetailsEnabled={setEmployerDetailsEnabled}
                                setContext={setContext}
                            />
                        )}
                        ListEmptyComponent={() => (
                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', fontSize: 12, marginRight: 10, color: '#737373', textAlign: 'center', width: '66%'}}>
                                    Options unavailable. Use the search bar on top to add a guarantor/ witness.
                                </Text>
                            </View>
                        )}
                    />
                    :
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white", paddingHorizontal: 16}}>
                        {
                            context === "amount" &&
                            <>
                                <View style={{paddingHorizontal: 5}}>
                                    <Text allowFontScaling={false} style={styles.subtitle}>Guarantor: {currentGuarantor?.name}</Text>
                                    <Text allowFontScaling={false} style={styles.subtitle2}>
                                        Remaining Amount:
                                        <Text style={{textDecorationLine: 'underline'}}>{toMoney(un_guaranteed())}</Text>
                                    </Text>
                                </View>

                                <TextField
                                    label={"Amount to guarantee"}
                                    field={"amountToGuarantee"}
                                    val={getValues}
                                    watch={watch}
                                    control={control}
                                    error={errors.amountToGuarantee}
                                    required={true}
                                    keyboardType={"number-pad"}
                                />

                                <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(submitAmount)} />
                            </>
                        }
                        { context === "employment" &&
                            <>
                                <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', width: width-50, paddingBottom: 15 }}>
                                    <TouchableOpacity onPress={() => {
                                        setTab(0)
                                    }} style={{ display: 'flex', borderBottomWidth: tab === 0 ? 2 : 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: (width-50) / 2, borderColor: '#489AAB' }}>
                                        <Text allowFontScaling={false} style={[{color: tab === 0 ? '#489AAB' : '#c6c6c6'}, styles.tabTitle]}>Employed</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setTab(1)
                                    }} style={{ display: 'flex', borderBottomWidth: tab === 1 ? 2 : 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: (width-50) / 2, borderColor: '#489AAB' }}>
                                        <Text allowFontScaling={false} style={[{color: tab === 1 ? '#489AAB' : '#c6c6c6'}, styles.tabTitle]}>Business/ Self Employed</Text>
                                    </TouchableOpacity>
                                </View>
                                {   tab === 0 ?
                                    <>
                                        <TextField
                                            field={"employerName"}
                                            label={"Employer"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.employerName}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Employer Name is required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />
                                        <TextField
                                            field={"serviceNo"}
                                            label={"Employment Number"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.serviceNo}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Employer service no. required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />
                                        <TextField
                                            field={"grossSalary"}
                                            label={"Gross Salary"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.grossSalary}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Gross salary required"
                                                }
                                            }}
                                            keyboardType={"numeric"}
                                            secureTextEntry={false}
                                        />
                                        <TextField
                                            field={"netSalary"}
                                            label={"Net Salary"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.netSalary}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "Net salary required"
                                                }
                                            }}
                                            keyboardType={"numeric"}
                                            secureTextEntry={false}
                                        />
                                        <TextField
                                            field={"kraPin"}
                                            label={"KRA Pin"}
                                            val={getValues}
                                            watch={watch}
                                            control={control}
                                            error={errors.kraPin}
                                            required={true}
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: "KRA pin required"
                                                }
                                            }}
                                            keyboardType={"default"}
                                            secureTextEntry={false}
                                        />
                                    </> : null
                                }

                                {
                                    tab === 1 ?
                                        <>
                                            <TextField
                                                field={"businessLocation"}
                                                label={"Business Location"}
                                                val={getValues}
                                                watch={watch}
                                                control={control}
                                                error={errors.businessLocation}
                                                required={true}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Business location required"
                                                    }
                                                }}
                                                keyboardType={"default"}
                                                secureTextEntry={false}
                                            />

                                            <TextField
                                                field={"businessType"}
                                                label={"Business Type"}
                                                val={getValues}
                                                watch={watch}
                                                control={control}
                                                error={errors.businessType}
                                                required={true}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "Business type required"
                                                    }
                                                }}
                                                keyboardType={"default"}
                                                secureTextEntry={false}
                                            />

                                            <TextField
                                                field={"kraPin"}
                                                label={"KRA Pin"}
                                                val={getValues}
                                                watch={watch}
                                                control={control}
                                                error={errors.kraPin}
                                                required={true}
                                                rules={{
                                                    required: {
                                                        value: true,
                                                        message: "KRA pin required"
                                                    }
                                                }}
                                                keyboardType={"default"}
                                                secureTextEntry={false}
                                            />

                                        </> : null
                                }

                                <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(submitKYC)} />
                            </>
                        }
                    </BottomSheetScrollView>
                }
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 25,
        borderRadius: 50,
        paddingHorizontal: 5,
        marginHorizontal: 16,
        backgroundColor: '#EFF3F4',
    },
    header: {
        fontSize: 15,
        color: 'rgba(0,0,0,0.89)',
        paddingLeft: 20,
        fontFamily: 'Poppins_500Medium'
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
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_300Light',
        alignSelf: 'flex-start',
        paddingHorizontal: 30,
        marginTop: 5
    },
    input0: {
        borderWidth: 1,
        borderColor: '#cccccc',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 45,
        width: width -35,
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
    },
    subtitle2: {
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        lineHeight: 22,
        letterSpacing: 0.5,
        paddingBottom: 3,
    },
    tabTitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 12,
        padding: 5
    },
    subtitle: {
        textAlign: 'left',
        color: '#489AAB',
        fontSize: 14,
        lineHeight: 22,
        letterSpacing: 0.5,
        paddingBottom: 3,
    },
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
});

export default GuarantorsHome;