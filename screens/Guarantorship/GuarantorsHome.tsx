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
    NativeModules, TouchableOpacity, Switch,
} from "react-native";
type NavigationProps = NativeStackScreenProps<any>;
import {Controller, EventType, useForm} from "react-hook-form";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {getContact, requestPhoneNumberFormat} from "../../utils/smsVerification";
import {getSecureKey} from "../../utils/secureStore";
import {cloneDeep} from "lodash";
import configuration from "../../utils/configuration";
import ContactSectionList from "../../components/ContactSectionList";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop, BottomSheetFlatList  } from "@gorhom/bottom-sheet";
import {RotateView} from "../Auth/VerifyOTP";
import {toMoney} from "../User/Account";
const { CSTM } = NativeModules;
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

const GuarantorsHome = ({ navigation, route }: NavigationProps) => {
    StatusBar.setBackgroundColor('#FFFFFF', true);

    const [searching, setSearching] = useState<boolean>(false);

    const [context, setContext] = useState<string>("");

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { loading, tenants, selectedTenantId, user, member, isLoggedIn } = useSelector((state: { auth: storeState }) => state.auth);

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const settings = configuration.find(config => config.tenantId === (tenant ? tenant.tenantId : user?.tenantId));

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const [allGuaranteedAmounts, setAllGuaranteedAmounts] = useState<string[]>([]);

    const [employerDetailsEnabled, setEmployerDetailsEnabled] = useState(false);

    // set current guarantor on settings requiring amount

    const [currentGuarantor, setCurrentGuarantor] = useState<{contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}>()

    const requiredGuarantors = () => {
        return settings ? settings.minGuarantors : 1;
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
            CSTM.showToast(`${phone} ${error?.message}`);
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
        const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(searchByMemberNo(member_no));

        if (type === 'searchByMemberNo/rejected') {
            CSTM.showToast(`${error.message}`);
            return undefined;
        }

        if (type === "searchByMemberNo/fulfilled" && member) {
            if (payload && !payload.hasOwnProperty("firstName")) {
                CSTM.showToast(`${member_no}: is not a member.`);
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
                    setContext('amount');



                } else if (settings && settings.guarantors === 'count' && member) {
                    // calculate amount to guarantee
                    const theAmount = (selectedContacts.length <= 4) ? route.params?.loanDetails.desiredAmount/requiredGuarantors() : route.params?.loanDetails.desiredAmount/selectedContacts.length;

                    const amountsToG: any[] = cloneDeep(allGuaranteedAmounts);

                    const newDeserializedCopy: any[] = cloneDeep(selectedContacts);

                    amountsToG.push(theAmount);

                    setAllGuaranteedAmounts(amountsToG);

                    newDeserializedCopy.push(searchedMember);

                    setSelectedContacts(newDeserializedCopy);

                    setValue('searchTerm', '');
                }
            } else {
                setValue('searchTerm', '');
                CSTM.showToast("Duplicate Entry");
            }
        } else {
            CSTM.showToast('could not add contact');
        }
    }

    const {
        control,
        watch,
        handleSubmit,
        clearErrors,
        setError,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>({});

    useEffect(() => {
        let reactToSearch = true;

        if (reactToSearch && searching) {
            getSecureKey("alpha2Code")
                .then(alpha2Code => getContact(421, alpha2Code))
                .then(data => Promise.resolve(JSON.parse(data)))
                .then(({ country_code, phone_no }) => {
                    setValue('searchTerm', `${country_code}${phone_no}`);
                    return searchMemberByPhone(`${country_code}${phone_no}`);
                })
                .then(addContactToList)
                .catch(e => {
                    CSTM.showToast(e.message);
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

    const [guarantorshipOptions, setGuarantorshipOptions] = useState([
        {
            id: "1",
            name: "Self Guarantee",
            context: "self-guarantee",
            icon: "self-improvement"
        }
    ]);

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
                            setValue("amountToGuarantee", route.params?.loanDetails.desiredAmount);
                            searchMemberByMemberNo(member.memberNumber)
                            .then(addContactToList)
                            .catch(e => {
                                CSTM.showToast(e.message);
                            });
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

    const toggleEmployerDetailsEnabled = () => setEmployerDetailsEnabled((previousState: boolean) => {
        if (!previousState) {
            handleSnapPress(2);
        } else {
            setContext('options');
            handleClosePress();
        }
        return !previousState
    });

    const [tab, setTab] = useState<number>(0);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.searchableHeader}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Pressable style={{alignSelf: 'flex-start'}} onPress={() => {
                        navigation.goBack();
                    }}>
                        <AntDesign name="arrowleft" size={24} color="rgba(0,0,0,0.89)" />
                    </Pressable>
                    <Controller
                        control={control}
                        render={( { field: { onChange, onBlur, value } }) => (
                            <TextInput
                                allowFontScaling={false}
                                style={{paddingLeft: 20, fontFamily: 'Poppins_500Medium', fontSize: 13, minWidth: width/1.5, color: '#393a34', textDecorationLine: "underline"}}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder={`Search Phone or Member No`}
                                maxLength={12}
                                onSubmitEditing={() => {
                                    const [phoneRegex, memberNoRegex] = [
                                        /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{4}$/i,
                                        /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{3,9}$/i
                                    ];
                                    if (memberNoRegex.test(getValues("searchTerm"))) {
                                        console.log('member', getValues("searchTerm"));
                                    } else if (phoneRegex.test(getValues("searchTerm"))) {
                                        getSecureKey("alpha2Code")
                                        .then(alpha2Code => requestPhoneNumberFormat(alpha2Code, getValues("searchTerm")))
                                        .then((jsonDat) => Promise.resolve(JSON.parse(jsonDat)))
                                        .then(({country_code, phone_no}) => searchMemberByPhone(`${country_code}${phone_no}`))
                                        .then(addContactToList)
                                        .catch(e => {
                                            CSTM.showToast(e.message);
                                        })
                                    } else {
                                        CSTM.showToast("Invalid Identifier");
                                    }
                                }}
                                clearButtonMode="while-editing"
                            />
                        )}
                        name="searchTerm"
                    />
                </View>
                <Pressable onPress={() => {
                    setSearching(!searching);
                }}>
                    <AntDesign style={{paddingHorizontal: 10}} name="search1" size={20} color="rgba(0,0,0,0.89)" />
                </Pressable>
            </View>
            <ContactSectionList contactsData={
                [
                    {
                        title: 'OPTIONS',
                        data: [
                            {
                                name: ''
                            }
                        ]
                    },
                    {
                        title: 'SELECTED GUARANTORS',
                        data: selectedContacts
                    }
                ]
            } searching={searching} addContactToList={addContactToList} removeContactFromList={removeContactFromList} contactList={selectedContacts} onPress={onPress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} />
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
                        renderItem={renderItem}

                    />
                    :
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white"}}>
                        {
                            context === "amount" &&
                            <View style={{display: 'flex', alignItems: 'center', width, marginBottom: 10}}>
                                <Text allowFontScaling={false} style={styles.subtitle}>Add {currentGuarantor?.name}'s Guarantorship Amount</Text>
                                <Text allowFontScaling={false} style={{ alignSelf: 'flex-start', textAlign: 'left', color: '#767577', fontFamily: 'Poppins_300Light', fontSize: 12, paddingHorizontal: 30 }}>Un-guaranteed Amount <Text style={{textDecorationLine: 'underline'}}>{toMoney(`${route.params?.loanDetails.desiredAmount - calculateGuarantorship(route.params?.loanDetails.desiredAmount)}` )}</Text></Text>
                                <Controller
                                    control={control}
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            allowFontScaling={false}
                                            style={styles.input0}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Amount to guarantee"
                                            keyboardType="numeric"
                                        />
                                    )}
                                    name="amountToGuarantee"
                                />


                            </View>
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
                                { tab === 0 ?
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
                                    :
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

                                    </> }
                            </View>
                        }
                        {
                            context !== 'amount' &&
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width, marginHorizontal: 20 }}>
                                <Controller
                                    control={control}
                                    rules={{
                                        required: true,
                                    }}
                                    render={( { field: { onChange, onBlur, value } }) => (
                                        <Switch
                                            trackColor={{ false: "#767577", true: "#489AAB" }}
                                            thumbColor={employerDetailsEnabled ? "#FFFFFF" : "#f4f3f4"}
                                            onValueChange={toggleEmployerDetailsEnabled}
                                            value={employerDetailsEnabled}
                                        />
                                    )}
                                    name="employerDetails"
                                />
                                <Text allowFontScaling={false} style={{ fontSize: 12, color: '#CCCCCC', fontFamily: 'Poppins_400Regular' }}>Enter Employer details</Text>
                            </View>
                        }

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
        marginHorizontal: 0
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: "#FFFFFF",
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        shadowColor: 'rgba(0,0,0,0.7)', // IOS
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
        width: '90%',
        paddingHorizontal: 20,
        fontSize: 12,
        color: '#767577',
        fontFamily: 'Poppins_400Regular',
        marginTop: 20,
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
        alignSelf: 'flex-start',
        color: '#489AAB',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        paddingHorizontal: 30,
        marginBottom: 2
    },
});

export default GuarantorsHome;
