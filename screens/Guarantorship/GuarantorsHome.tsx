import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Picker} from "@react-native-picker/picker";
import {
    Pressable,
    Text,
    TextInput,
    View,
    Dimensions,
    NativeModules,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
} from "react-native";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {Controller, useForm} from "react-hook-form";
import {useState, useEffect, useCallback, useRef, useMemo} from "react";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {
    authenticate,
    getContactsFromDB, getUserFromDB, saveUser,
    searchByMemberNo,
    searchContactsInDB,
    setLoading,
    storeState,
    updateUser,
    validateGuarantorship,
    validateNumber
} from "../../stores/auth/authSlice";
import cloneDeep from "lodash/cloneDeep";
import {RotateView} from "../Auth/VerifyOTP";
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
import configuration from "../../utils/configuration";
import {toMoney} from "../User/Account";
const { width, height } = Dimensions.get("window");

type NavigationProps = NativeStackScreenProps<any>;
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
}
type businessPayloadType = {
    businessLocation: string | undefined;
    businessType: string | undefined;
    kraPin: string | undefined;
}
const { CSTM } = NativeModules;

// temporary

import {BottomSheetRefProps, MAX_TRANSLATE_Y} from "../../components/BottomSheet";
import ContactSectionList from "../../components/ContactSectionList";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop, BottomSheetFlatList  } from "@gorhom/bottom-sheet";

const GuarantorsHome = ({ navigation, route }: NavigationProps) => {
    StatusBar.setBackgroundColor('#FFFFFF', true);

    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_700Bold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const [searching, setSearching] = useState<boolean>(false);

    type AppDispatch = typeof store.dispatch;

    const dispatch : AppDispatch = useDispatch();

    const { loading, tenants, selectedTenantId, user, member, isLoggedIn } = useSelector((state: { auth: storeState }) => state.auth);

    const [contacts, setContacts] = useState([]);

    const tenant = tenants.find(t => t.id === selectedTenantId);

    const settings = configuration.find(config => config.tenantId === (tenant ? tenant.tenantId : user?.tenantId));

    const [from, setFrom] = useState(0);

    const [to, setTo] = useState(10);

    const [employerDetailsEnabled, setEmployerDetailsEnabled] = useState(false);

    const [dbUser, setDbUser] = useState(false);

    const [DBUser, setDBUser] = useState<{id: number, kraPin: string, employed: number, businessOwner: number, employerName: any, serviceNumber: any, grossSalary: any, netSalary: any, businessType: any, businessLocation: any}[]>([]);

    const [memberSearching, setMemberSearching] = useState<boolean>(false);

    const [context, setContext] = useState<string>("");

    const [employerPayload, setEmployerPayload] = useState<employerPayloadType>();

    const [businessPayload, setBusinessPayload] = useState<businessPayloadType>();

    useEffect(() => {
        (async() => {
            try {
                const {type, payload}: any = await dispatch(getUserFromDB({setDBUser}));

                if (type === 'getUserFromDB/fulfilled') {
                    if (payload && payload.length > 0) {
                        setDbUser(true)
                        setValue("employerName", `${payload[0].employerName}`)
                        setValue("serviceNo", `${payload[0].serviceNumber}`)
                        setValue("grossSalary", `${payload[0].grossSalary}`)
                        setValue("netSalary", `${payload[0].netSalary}`)
                        setValue("kraPin", `${payload[0].kraPin}`)
                        setValue("businessLocation", `${payload[0].businessLocation}`)
                        setValue("businessType", `${payload[0].businessType}`)

                        if (payload[0].businessOwner === 1) {
                            let bsPayload = {
                                businessLocation: payload[0].businessLocation,
                                businessType: payload[0].businessType,
                                kraPin: payload[0].kraPin
                            }

                            setBusinessPayload(bsPayload)
                        }

                        if (payload[0].employed === 1) {
                            let emPayload = {
                                employerName: payload[0].employerName,
                                serviceNo: payload[0].serviceNumber,
                                grossSalary: payload[0].grossSalary,
                                netSalary: payload[0].netSalary,
                                kraPin: payload[0].kraPin,
                            }
                            setEmployerPayload(emPayload)
                        }

                    } else {
                        setDbUser(false)
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })()
    }, []);

    useEffect(() => {
        let syncContacts = true;
        (async () => {
            await dispatch(getContactsFromDB({setContacts, from, to}))
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
        clearErrors,
        setError,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {
            employerDetails: settings && settings.employerInfo
        }
    });

    const filterContactsCB = async (searchTerm: string = '') => {
        await dispatch(searchContactsInDB({searchTerm, setContacts}));
    };
    const [inputStrategy, setInputStrategy] = useState<number | string | undefined>(0);
    const [memberNumber, setMemberNumber] = useState<number | string | undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState<number | string | undefined>(undefined);
    const [employerName, setEmployerName] = useState<string | undefined>(undefined);
    const [serviceNo, setServiceNo] = useState<string | undefined>(undefined);
    const [grossSalary, setGrossSalary] = useState<string | undefined>(undefined);
    const [netSalary, setNetSalary] = useState<string | undefined>(undefined);
    const [kraPin, setKraPin] = useState<string | undefined>(undefined);
    const [businessType, setBusinessType] = useState<string | undefined>(undefined);
    const [businessLocation, setBusinessLocation] = useState<string | undefined>(undefined);
    const [amountToGuarantee, setAmountToGuarantee] = useState<string | undefined>(undefined);
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
                    case  'employerName':
                        clearErrors("employerName");
                        setEmployerName(value.employerName);
                        setMemberSearching(true);
                        break;
                    case  'serviceNo':
                        clearErrors("serviceNo");
                        setServiceNo(value.serviceNo);
                        setMemberSearching(true);
                        break;
                    case  'grossSalary':
                        clearErrors("grossSalary");
                        setGrossSalary(value.grossSalary);
                        setMemberSearching(true);
                        break;
                    case  'netSalary':
                        clearErrors("netSalary");
                        setNetSalary(value.netSalary);
                        setMemberSearching(true);
                        break;
                    case  'kraPin':
                        clearErrors("kraPin");
                        setKraPin(value.kraPin);
                        setMemberSearching(true);
                        break;
                    case  'businessType':
                        clearErrors("businessType");
                        setBusinessType(value.businessType);
                        setMemberSearching(true);
                        break;
                    case  'businessLocation':
                        clearErrors("businessLocation");
                        setBusinessLocation(value.businessLocation);
                        setMemberSearching(true);
                        break;
                    case  'amountToGuarantee':
                        clearErrors("amountToGuarantee");
                        if (value.amountToGuarantee !== '') {
                            setAmountToGuarantee(value.amountToGuarantee);
                            setMemberSearching(true);
                        }
                        break;
                }
            })()
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        console.log('removing');
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
        amountsToG.splice(index, 1);
        setAllGuaranteedAmounts(amountsToG);
        setSelectedContacts(newDeserializedCopy);
        return true;
    }

    const requiredGuarantors = () => {

        if (tenant && tenant.tenantId === 't74411') {
            return 1
        }

        if (tenant && tenant.tenantId === 't72767') {
            return 4
        }

        return 1
    }

    const [currentGuarantor, setCurrentGuarantor] = useState<{contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}>()

    const addContactToList = async (contact2Add: {contact_id: string, memberNumber: string, memberRefId: string, name: string, phone: string}, press: boolean = true): Promise<boolean> => {
        console.log("adding to list contact2Add", contact2Add);
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
            if (settings && settings.guarantors === 'value' && settings.amounts) {
                if (press) {
                    setCurrentGuarantor(contact2Add);
                    onPress('amount');
                } else {
                    setCurrentGuarantor(contact2Add);
                    setContext('amount');
                }

                return Promise.resolve(true);
            } else if (settings && settings.guarantors === 'count' && member) {
                // calculate amount to guarantee
                let theAmount = (selectedContacts.length <= 4) ? route.params?.loanDetails.desiredAmount/requiredGuarantors() : route.params?.loanDetails.desiredAmount/selectedContacts.length;

                // validate guarantor and amount calculated

                type validateGuarantorType = {applicantMemberRefId: string , memberRefIds: string[], loanProductRefId: string, loanAmount: number, guaranteeAmount?: number}

                let payloadOut: validateGuarantorType = {
                    applicantMemberRefId: member?.refId,
                    memberRefIds: [
                        `${contact2Add.memberRefId}`
                    ],
                    loanProductRefId: route.params?.loanProduct.refId,
                    loanAmount: parseInt(route.params?.loanDetails.desiredAmount),
                    // guaranteeAmount: theAmount
                }

                return dispatch(validateGuarantorship(payloadOut)).then(({type, payload}: any) => {

                    if (type === 'validateGuarantorship/fulfilled' && payload.length > 0 && payload[0].isAccepted) {
                        let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
                        amountsToG.push(theAmount);
                        setAllGuaranteedAmounts(amountsToG);
                        newDeserializedCopy.push(contact2Add);
                        console.warn('setting setSelectedContacts', setSelectedContacts)
                        setSelectedContacts(newDeserializedCopy);
                        setValue('searchTerm', '');
                        setMemberNumber('');
                        setPhoneNumber('');
                        setMemberSearching(false);
                        setValue('phoneNumber', '');
                        setValue('memberNumber', '');
                        return payload[0].isAccepted;
                    } else {
                        CSTM.showToast('Member Cannot Guarantee Amount: ' + theAmount);
                        return false;
                    }
                })
            }

            return Promise.resolve(false);
        } else {
            CSTM.showToast('Cannot add duplicate guarantors');
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
                    if (payload && !payload.hasOwnProperty("firstName")) {
                        CSTM.showToast(`${identifier}: is not a member.`);
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
        } catch(e: any) {
            console.log(e.message);
        }
    }

    const setSelectedValue = (itemValue: string | number) => {
        setValue('inputStrategy', itemValue)
    }

    const ref = useRef<BottomSheetRefProps>(null);

    const [bSActive, setBSActive] = useState(false)

    const onPress = useCallback((ctx: string) => {
        if (!bSActive) {
            setContext(ctx);
            if (ctx === 'employment') {
                handleSnapPress(2);
            } else {
                handleSnapPress(1);
            }
            setMemberSearching(false);
        } else {
            console.log('close it');
            handleClosePress();
        }
        setBSActive(!bSActive)
    }, []);

    const [tab, setTab] = useState<number>(0);

    const submitSearch = async (ctx: string) => {
        if (ctx === 'search') {
            if (inputStrategy === 1 && phoneNumber) {
                await addToSelected(phoneNumber.toString());
            } else if (inputStrategy === 0 && memberNumber) {
                await addToSelected(`${memberNumber}`);
            }

            return
        }

        if (ctx === 'employment') {
            if (tab === 0) {
                // set payload for employer
                // check em
                if (employerName === undefined) {
                    setError("employerName", { type: 'custom', message: "Ëmployer name required"});
                    return
                }
                if (serviceNo === undefined) {
                    setError("serviceNo", { type: 'custom', message: "Service no. required"});
                    return
                }
                if (grossSalary === undefined) {
                    setError("grossSalary", { type: 'custom', message: "Gross salary required"});
                    return
                }
                if (netSalary === undefined) {
                    setError("netSalary", { type: 'custom', message: "Net salary required"});
                    return
                }
                if (kraPin === undefined) {
                    setError("kraPin", { type: 'custom', message: "KRA pin required"});
                    return
                }
                let payloadCode = {
                    employerName,
                    serviceNo,
                    grossSalary,
                    netSalary,
                    kraPin
                };
                let dbPayload: {id: number, kraPin: string, employed: number, businessOwner: number, employerName: string | null, serviceNumber: string | null, grossSalary: number | null, netSalary: number | null, businessType: string | null, businessLocation: string | null} = {
                    id: 1,
                    kraPin: kraPin as string,
                    employed: 1,
                    businessOwner: 0,
                    employerName: employerName ? employerName as string : null,
                    serviceNumber: serviceNo ? serviceNo as string : null,
                    grossSalary: grossSalary ? parseInt(grossSalary) : null,
                    netSalary: netSalary ? parseInt(netSalary) : null,
                    businessType: null,
                    businessLocation: null
                }

                if (dbUser) {
                    const statement = `UPDATE user SET kraPin = '${dbPayload.kraPin}', employed = '${dbPayload.employed}', businessOwner = '${dbPayload.businessOwner}', employerName = '${dbPayload.employerName}', serviceNumber = '${dbPayload.serviceNumber}', grossSalary = '${dbPayload.grossSalary}', netSalary = '${dbPayload.netSalary}', businessType = '${dbPayload.businessType}', businessLocation = '${dbPayload.businessLocation}' WHERE id = ${dbPayload.id};`;

                    const {type, payload} = await dispatch(updateUser(statement))

                    if (type === 'updateUser/fulfilled') {
                        setEmployerPayload(payloadCode)
                    } else {
                        console.log("submitSearch error", payload)
                    }

                } else {
                    const {type, payload} = await dispatch(saveUser(dbPayload))

                    if (type === 'saveUser/fulfilled') {
                        setEmployerPayload(payloadCode)
                    } else {
                        console.log("save user error", payload)
                    }
                }

            } else if (tab === 1) {
                // set payload for business
                let payloadCode = {
                    businessLocation,
                    businessType,
                    kraPin
                };
                let dbPayload: {id: number, kraPin: string, employed: number, businessOwner: number, employerName: string | null, serviceNumber: string | null, grossSalary: number | null, netSalary: number | null, businessType: string | null, businessLocation: string | null} = {
                    id: 1,
                    kraPin: kraPin as string,
                    employed: 1,
                    businessOwner: 0,
                    employerName: employerName ? employerName as string : null,
                    serviceNumber: serviceNo ? serviceNo as string : null,
                    grossSalary: grossSalary ? parseInt(grossSalary) : null,
                    netSalary: netSalary ? parseInt(netSalary) : null,
                    businessType: businessType ? businessType : null,
                    businessLocation: businessLocation ? businessLocation : null
                }

                if (dbUser) {
                    const statement = `UPDATE user SET kraPin = '${dbPayload.kraPin}', employed = '${dbPayload.employed}', businessOwner = '${dbPayload.businessOwner}', employerName = '${dbPayload.employerName}', serviceNumber = '${dbPayload.serviceNumber}', grossSalary = '${dbPayload.grossSalary}', netSalary = '${dbPayload.netSalary}', businessType = '${dbPayload.businessType}', businessLocation = '${dbPayload.businessLocation}' WHERE id = ${dbPayload.id};`;

                    const {type, payload} = await dispatch(updateUser(statement))

                    if (type === 'updateUser/fulfilled') {
                        setBusinessPayload(payloadCode);
                    } else {
                        console.log("updateUser error", payload)
                    }

                } else {
                    const {type, payload} = await dispatch(saveUser(dbPayload))
                    if (type === 'saveUser/fulfilled') {
                        setBusinessPayload(payloadCode);
                    } else {
                        console.log("saveUser error", payload)
                    }
                }
            }
            handleClosePress();

            return
        }

        if (ctx === 'amount' && member && currentGuarantor) {
            let amountsToG: any[] = cloneDeep(allGuaranteedAmounts);
            amountsToG.push(amountToGuarantee);
            setValue('amountToGuarantee', '');
            let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
            newDeserializedCopy.push(currentGuarantor);
            type validateGuarantorType = {applicantMemberRefId: string , memberRefIds: string[], loanProductRefId: string, loanAmount: number, guaranteeAmount: number}
            let payloadOut: validateGuarantorType = {
                applicantMemberRefId: member?.refId,
                memberRefIds: [
                    `${currentGuarantor.memberRefId}`
                ],
                loanProductRefId: route.params?.loanProduct.refId,
                loanAmount: parseInt(route.params?.loanDetails.desiredAmount),
                guaranteeAmount: amountToGuarantee ? parseInt(amountToGuarantee) : 0
            }

            const {type, payload}: any = await dispatch(validateGuarantorship(payloadOut));

            if (type === 'validateGuarantorship/fulfilled' && payload.length > 0 && payload[0].isAccepted) {
                setSelectedContacts(newDeserializedCopy);
                setAllGuaranteedAmounts(amountsToG);
                handleClosePress();
                setMemberNumber('');
                setPhoneNumber('');
                setValue('phoneNumber', '');
                setValue('memberNumber', '');
                setMemberSearching(false);
            } else {
                CSTM.showToast(`Member Cannot Guarantee This Amount`);
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
                } else {
                    if (settings && !settings.selfGuarantee) {
                        const newOptions = guarantorshipOptions.filter(option => option.context !== "self-guarantee");
                        setGuarantorshipOptions(newOptions);
                    }
                }
            })()
        }
        return () => {
            authenticating = false
        }
    }, [isLoggedIn]);

    const toggleEmployerDetailsEnabled = () => setEmployerDetailsEnabled((previousState: boolean) => {
        if (!previousState) {
            setContext('employment');
            handleSnapPress(2);
        } else {
            setContext('search');
            handleSnapPress(1);
        }
        return !previousState
    });

    const navigateUser = async () => {
        if (member && route.params && route.params.loanProduct && route.params.loanDetails && selectedContacts.length > 0) {
            if (settings && settings.employerInfo  && !(employerPayload || businessPayload) && DBUser.length === 0) {
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
            CSTM.showToast(`CANNOT VALIDATE GUARANTORS`);
        }
    }

    const [guarantorshipOptions, setGuarantorshipOptions] = useState([
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
                                setValue("amountToGuarantee", route.params?.loanDetails.desiredAmount);
                                console.log("am2g", route.params?.loanDetails.desiredAmount);
                                await addToSelected(member.memberNumber);
                            })()
                        }
                        return
                    }
                    if (item.name === 'Search Member No.') setValue('inputStrategy', 0)
                    if (item.name === 'Search Phone No.') setValue('inputStrategy', 1)
                    setEmployerDetailsEnabled(false);
                    setContext(item.context);
                }}
                backgroundColor={{ backgroundColor }}
                textColor={{ color }}
            />
        );
    };

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
        <GestureHandlerRootView style={styles.container}>
            {
                loading &&
                <View style={{position: 'absolute', top: 50, zIndex: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width}}>
                    <RotateView/>
                </View>
            }
            <View style={styles.searchableHeader}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Pressable style={{alignSelf: 'flex-start'}} onPress={() => {
                        if (searching) {
                            setValue("searchTerm", "");
                            setSearching(!searching);
                        } else {
                            navigation.goBack();
                        }
                    }}>
                        <AntDesign name="arrowleft" size={24} color="rgba(0,0,0,0.89)" />
                    </Pressable>

                    {
                        searching ?

                            <Controller
                                control={control}
                                render={( { field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        allowFontScaling={false}
                                        style={{paddingLeft: 20, fontFamily: 'Poppins_500Medium', fontSize: 15, minWidth: width/1.5, color: '#393a34', textDecorationLine: "underline"}}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="Search Guarantors"
                                        autoFocus={true}
                                    />
                                )}
                                name="searchTerm"
                            />

                            : <Text style={styles.header} allowFontScaling={false}>Add {route.params?.loanProduct.requiredGuarantors} {route.params?.loanProduct.requiredGuarantors == 1 ? 'Guarantor' : 'Guarantors'}</Text>
                    }
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
                    },
                    {
                        title: 'CONTACTS',
                        data: contacts
                    }
                ]
            } searching={searching} addContactToList={addContactToList} removeContactFromList={removeContactFromList} contactList={selectedContacts} onPress={onPress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} />
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
                        renderItem={renderItem}

                    />
                    :
                    <BottomSheetScrollView contentContainerStyle={{backgroundColor: "white"}}>
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
                                        setMemberSearching(false)
                                        setTab(0)
                                    }} style={{ display: 'flex', borderBottomWidth: tab === 0 ? 2 : 0, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', width: (width-50) / 2, borderColor: '#489AAB' }}>
                                        <Text allowFontScaling={false} style={[{color: tab === 0 ? '#489AAB' : '#c6c6c6'}, styles.tabTitle]}>Employed</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => {
                                        setMemberSearching(false)
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
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity disabled={ !memberSearching || loading} onPress={() => submitSearch(context)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: !memberSearching || loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                                {
                                    loading &&
                                    <View style={{marginRight: 10}}>
                                        <RotateView/>
                                    </View>
                                }
                                <Text allowFontScaling={false} style={styles.buttonText}>{context === 'search' ? 'Search' : 'Submit'}</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetScrollView>
                }
            </BottomSheet>

        </GestureHandlerRootView>
    )
}

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
    item: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        padding: 20
    },
    header: {
        fontSize: 18,
        color: 'rgba(0,0,0,0.89)',
        paddingLeft: 20,
        fontFamily: 'Poppins_500Medium'
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins_400Regular'
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
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_300Light',
        alignSelf: 'flex-start',
        paddingHorizontal: 30,
        marginTop: 5
    },
    buttonText0: {
        fontSize: 15,
        marginLeft: 10,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_300Light',
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
    tabTitle: {
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 12,
        padding: 5
    }
});

export default GuarantorsHome;
