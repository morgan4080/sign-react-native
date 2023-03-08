import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {searchByMemberNo, storeState, validateNumber} from "../../stores/auth/authSlice";
import {
    Pressable,
    StatusBar,
    StyleSheet,
    TextInput,
    Text,
    View,
    Dimensions,
    TouchableOpacity
} from "react-native";
type NavigationProps = NativeStackScreenProps<any>;
import {Controller, useForm} from "react-hook-form";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getContact, requestPhoneNumberFormat} from "../../utils/smsVerification";
import {getSecureKey} from "../../utils/secureStore";
import {cloneDeep} from "lodash";
import ContactSectionList from "../../components/ContactSectionList";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop, BottomSheetFlatList  } from "@gorhom/bottom-sheet";
import {toMoney} from "../User/Account";
import {showSnack} from "../../utils/immediateUpdate";
import Container from "../../components/Container";
import TextField from "../../components/TextField";
import TouchableButton from "../../components/TouchableButton";
const { width } = Dimensions.get("window");
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
                                showSnack(e.message, "ERROR");
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

type employerPayloadType = {
    employerName: string | undefined;
    serviceNo: string | undefined;
    grossSalary: string | undefined;
    netSalary: string | undefined;
    kraPin: string | undefined;
}
type businessPayloadType = {
    businessLocation: string | undefined;
    businessType: string | undefined;
    kraPin: string | undefined;
}

const GuarantorsHome = ({ navigation, route }: NavigationProps) => {
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

    StatusBar.setBackgroundColor('#FFFFFF', true);

    const [searching, setSearching] = useState<boolean>(false);

    const [context, setContext] = useState<string>("");

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { loading, tenants, selectedTenantId, user, member, organisations } = useSelector((state: { auth: storeState }) => state.auth);

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const settings = organisations.find(org => org.tenantId === (tenant ? tenant.tenantId : user?.tenantId));

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const [allGuaranteedAmounts, setAllGuaranteedAmounts] = useState<string[]>([]);

    const [employerDetailsEnabled, setEmployerDetailsEnabled] = useState(false);

    const [heldMember, setHeldMember] = useState<searchedMemberType | null>(null);

    const [employerPayload, setEmployerPayload] = useState<employerPayloadType>();

    const [businessPayload, setBusinessPayload] = useState<businessPayloadType>();

    // set current guarantor on settings requiring amount

    const [currentGuarantor, setCurrentGuarantor] = useState<{contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}>()

    const requiredGuarantors = () => {
        return route.params?.loanProduct.requiredGuarantors ? route.params?.loanProduct.requiredGuarantors : settings ? settings.minGuarantors : 1;
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
            showSnack(`${phone} ${error?.message}`, "ERROR");
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
            showSnack(`${member_no}: is not a member.`, "ERROR");
            return undefined;
        }

        if (type === "searchByMemberNo/fulfilled" && member) {
            if (payload && !payload.hasOwnProperty("firstName")) {
                showSnack(`${member_no}: is not a member.`, "ERROR");
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
                showSnack("Duplicate Entry", "ERROR");
                handleClosePress();
            }
        }
    }

    const [phonebook_contact_name, set_phonebook_contact_name] = useState("");

    const un_guaranteed = () => {
        return `${route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount)}`;
    }

    useEffect(() => {
        let reactToSearch = true;

        if (reactToSearch && searching) {
            getSecureKey("alpha2Code")
            .then(alpha2Code => getContact(421, alpha2Code))
            .then(data => Promise.resolve(JSON.parse(data)))
            .then((data) => {
                set_phonebook_contact_name(`${data.name ? data.name : "" }`);
                setValue('searchTerm', `${data.country_code}${data.phone_no}`);
                return searchMemberByPhone(`${data.country_code}${data.phone_no}`);
            })
            .then(addContactToList)
            .catch(e => {
                showSnack(e.message, "ERROR");
            });
        }

        return () => {
            reactToSearch = false;
            setSearching(false);
        };
    }, [searching]);

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
            console.log('close it');
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
            if (settings && settings.selfGuarantee) {
                setGuarantorshipOptions([...guarantorshipOptions, {
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
    }, [])

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
                    showSnack(e.message, "ERROR");
                });
        } else if (phoneRegex.test(getValues("searchTerm"))) {
            getSecureKey("alpha2Code")
                .then(alpha2Code => requestPhoneNumberFormat(alpha2Code, getValues("searchTerm")))
                .then((jsonDat) => Promise.resolve(JSON.parse(jsonDat)))
                .then(({country_code, phone_no}) => searchMemberByPhone(`${country_code}${phone_no}`))
                .then(addContactToList)
                .catch(e => {
                    showSnack(e.message, "ERROR");
                })
        } else {
            showSnack("Incorrect Format", "ERROR");
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
        if (member && route.params && route.params.loanProduct && route.params.loanDetails && selectedContacts.length > 0) {
            if (settings && settings.employerInfo  && !(employerPayload || businessPayload)) {
                setEmployerDetailsEnabled(true);
                onPress("employment");
                return;
            }

            if (settings && settings.witness) {
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
            } else if (settings && !settings.witness) {
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
            showSnack(`CANNOT VALIDATE GUARANTORS`, "ERROR");
        }
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: 10, paddingHorizontal: 5}}>
                <Pressable style={{paddingBottom: 6, paddingRight: 20}} onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="#489AAB" />
                </Pressable>
                <Text allowFontScaling={false} style={{fontSize: 18, letterSpacing: 0.5, paddingTop: 20, paddingBottom: 10 }}>Add Guarantors</Text>
            </View>
            <View style={styles.searchableHeader}>
                <Pressable style={{flex: 0.1,display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onPress={submitEdit}>
                    <AntDesign name="search1" size={15} color="rgba(0,0,0,0.89)" />
                </Pressable>
                <View style={{flex: 0.6, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Controller
                        control={control}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={{paddingLeft: 20, fontFamily: 'Poppins_400Regular', fontSize: 12, minWidth: width/1.5, color: '#393a34', textDecorationLine: "underline"}}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder={`Guarantor Mobile or Member No`}
                                maxLength={12}
                                onEndEditing={() => {set_phonebook_contact_name("")}}
                                onSubmitEditing={submitEdit}
                                clearButtonMode="while-editing"
                            />
                        )}
                        name="searchTerm"
                    />
                </View>
                <Pressable style={{ flex: 0.3, display: "flex", flexDirection: "row", justifyContent: 'flex-end', alignItems: 'center'}} onPress={() => {
                    setSearching(!searching);
                }}>
                    <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', fontSize: 10, marginRight: 10, color: '#737373'}}>{ phonebook_contact_name }</Text>

                    <AntDesign style={{ paddingRight: 10, paddingVertical: 5, paddingLeft: 5, borderLeftWidth: 1, borderLeftColor: '#cccccc' }} name="contacts" size={18} color="rgba(0,0,0,0.89)" />
                </Pressable>
            </View>
            <ContactSectionList
                contactsData={
                    [
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
                        style={{zIndex: 15}}
                        data={guarantorshipOptions}
                        keyExtractor={item => item.id}
                        renderItem={({i, item}: any) => (<RenderItem item={item} context={context} member={member} setValue={setValue} route={route} searchMemberByMemberNo={searchMemberByMemberNo} addContactToList={addContactToList} handleClosePress={handleClosePress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} setContext={setContext} />) }
                        ListEmptyComponent={() => (
                            <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                                <Text allowFontScaling={false} style={{fontFamily: 'Poppins_300Light', fontSize: 12, marginRight: 10, color: '#737373', textAlign: 'center', width: '66%'}}>
                                    Options unavailable. Use the search bar on top to add a guarantor/ witness.
                                </Text>
                            </View>
                        )}
                    />
                    :
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white"}}>
                        <Container>
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

                                    {/*<Pressable disabled={!heldMember} onPress={submitAmount} style={{marginTop: 20, backgroundColor: !heldMember ? "#CCCCCC" : "#489AAB", paddingHorizontal: 50, paddingVertical: 15, borderRadius: 25}}>
                                        <Text allowFontScaling={false} style={{color: '#FFFFFF', fontSize: 12, fontFamily: 'Poppins_600SemiBold', textTransform: 'uppercase'}}>Submit Amount</Text>
                                    </Pressable>*/}

                                    <TouchableButton loading={loading} label={"SUBMIT"} onPress={handleSubmit(submitAmount)} />
                                </>
                            }
                            { context === "employment" &&
                                <View style={{display: 'flex', alignItems: 'center', width}}>
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
                                    {   tab === 0 &&
                                        <>
                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Employer name"
                                                    />
                                                )}
                                                name="employerName"
                                            />
                                            {errors.employerName &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.employerName?.message ? errors.employerName?.message : 'Employer name required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Employment/Service No."
                                                    />
                                                )}
                                                name="serviceNo"
                                            />
                                            {errors.serviceNo &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.serviceNo?.message ? errors.serviceNo?.message : 'Service Number required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Gross Salary"
                                                        keyboardType="numeric"
                                                    />
                                                )}
                                                name="grossSalary"
                                            />
                                            {errors.grossSalary &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.grossSalary?.message ? errors.grossSalary?.message : 'Gross salary required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Net Salary"
                                                        keyboardType="numeric"
                                                    />
                                                )}
                                                name="netSalary"
                                            />
                                            {errors.netSalary &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.netSalary?.message ? errors.netSalary?.message : 'Net salary required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="KRA Pin"
                                                    />
                                                )}
                                                name="kraPin"
                                            />
                                            {errors.kraPin &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.kraPin?.message ? errors.kraPin?.message : 'KRA pin required'}</Text>}
                                        </>
                                    }

                                    {
                                        tab === 1 &&
                                        <>
                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Business Location"
                                                    />
                                                )}
                                                name="businessLocation"
                                            />
                                            {errors.businessLocation &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.businessLocation?.message ? errors.businessLocation?.message : 'Business location required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="Business Type"
                                                    />
                                                )}
                                                name="businessType"
                                            />
                                            {errors.businessType &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.businessType?.message ? errors.businessType?.message : 'Business type required'}</Text>}

                                            <Controller
                                                control={control}
                                                render={({field: {onChange, onBlur, value}}) => (
                                                    <TextInput
                                                        allowFontScaling={false}
                                                        style={styles.input0}
                                                        onBlur={onBlur}
                                                        onChangeText={onChange}
                                                        value={value}
                                                        placeholder="KRA Pin"
                                                    />
                                                )}
                                                name="kraPin"
                                            />
                                            {errors.kraPin &&  <Text  allowFontScaling={false}  style={styles.error}>{errors.kraPin?.message ? errors.kraPin?.message : 'KRA pin required'}</Text>}

                                        </>
                                    }

                                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                        <Pressable onPress={submitKYC} style={{marginTop: 20, backgroundColor: !heldMember ? "#CCCCCC" : "#489AAB", paddingHorizontal: 50, paddingVertical: 15, borderRadius: 25}}>
                                            <Text allowFontScaling={false} style={{color: '#FFFFFF', fontSize: 12, fontFamily: 'Poppins_600SemiBold', textTransform: 'uppercase'}}>Submit Details</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            }
                        </Container>
                    </BottomSheetScrollView>
                }
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        marginHorizontal: 0,
        backgroundColor: '#FFFFFF'
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f4f3f4',
        marginTop: 10,
        marginBottom: 25,
        marginHorizontal: 10,
        borderRadius: 50,
        paddingHorizontal: 5,
        paddingVertical: 8,
        shadowColor: 'rgba(0,0,0,0.2)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, // IOS
        elevation: 5, // Android
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
