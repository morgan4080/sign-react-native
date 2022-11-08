import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useCallback, useEffect, useState} from "react";
import {
    Alert,
    Dimensions,
    NativeModules,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {Controller, useForm} from "react-hook-form";
import {getSecureKey} from "../../utils/secureStore";
import {getContact, requestPhoneNumberFormat} from "../../utils/smsVerification";
import {AntDesign} from "@expo/vector-icons";
import {
    replaceGuarantor,
    searchByMemberNo,
    storeState,
    validateNumber
} from "../../stores/auth/authSlice";
import {store} from "../../stores/store";
import {useDispatch, useSelector} from "react-redux";
import {cloneDeep} from "lodash";
import ContactSectionList from "../../components/ContactSectionList";
type NavigationProps = NativeStackScreenProps<any>;
interface GuarantorData {
    refId: string,
    memberNumber: string,
    memberRefId: string,
    firstName: string,
    lastName: string,
    dateAccepted?: string,
    isAccepted?: string,
    dateSigned?: string,
    isSigned?: boolean,
    isApproved?: boolean,
    isActive: boolean,
    committedAmount: number,
    availableAmount: number,
    totalDeposits: number
}
interface LoanRequestData {
    "refId": string,
    "loanDate": string,
    "loanRequestNumber": string,
    "loanProductName": string,
    "loanProductRefId": string,
    "loanAmount": number,
    "guarantorsRequired": number,
    "guarantorCount": number,
    "status": string,
    "signingStatus": string,
    "acceptanceStatus": string,
    "applicationStatus": string,
    "memberRefId": string,
    "memberNumber": string,
    "memberFirstName": string,
    "memberLastName": string,
    "phoneNumber": string,
    "loanRequestProgress": number,
    "totalDeposits": number,
    "applicantSigned": boolean,
    "witnessName": string,
    "guarantorList": GuarantorData[],
}
interface FormData {
    searchTerm: string;
}
type AppDispatch = typeof store.dispatch;
type SearchedMemberType = { contact_id: string; memberNumber: string; memberRefId: string; name: string; phone: string };
const { CSTM } = NativeModules;
const { width } = Dimensions.get("window");
const ReplaceActor = ({ navigation, route }: NavigationProps) => {
    const { loading, member } = useSelector((state: { auth: storeState }) => state.auth);
    const [loan, setLoan] = useState<LoanRequestData>()
    const [guarantor, setGuarantor] = useState<GuarantorData>()
    const [phonebook_contact_name, set_phonebook_contact_name] = useState("");
    const [searching, setSearching] = useState<boolean>(false);
    const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
    const [employerDetailsEnabled, setEmployerDetailsEnabled] = useState(false);
    const dispatch : AppDispatch = useDispatch();
    useEffect(() => {
        let starting = true;
        if (starting) {
            setGuarantor(route.params?.item);
            setLoan(route.params?.loan);
        }
        return () => {
            starting = false;
        }
    }, []);

    const {
        control,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: {

        }
    });

    const searchMemberByPhone = async (phone: string): Promise<SearchedMemberType | undefined> => {
        const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(validateNumber(phone));

        if (type === 'validateNumber/rejected') {
            CSTM.showToast(`${phone} ${error?.message}`);
            setValue('searchTerm', '');
            set_phonebook_contact_name('');
            return undefined;
        }

        if (type === "validateNumber/fulfilled") {
            return {
                contact_id: `${Math.floor(Math.random() * (100000 - 10000)) + 10000}`,
                memberNumber: `${payload.memberNumber}`,
                memberRefId: `${payload.refId}`,
                name: `${payload.firstName}`,
                phone: `${payload.phoneNumber}`
            };
        }
    }

    const removeContactFromList = (contact2Remove: {contact_id: string, memberNumber: string,memberRefId: string,name: string,phone: string}): boolean => {
        let newDeserializedCopy: any[] = cloneDeep(selectedContacts);
        let index = newDeserializedCopy.findIndex(contact => contact.contact_id === contact2Remove.contact_id);
        newDeserializedCopy.splice(index, 1);
        setSelectedContacts(newDeserializedCopy);
        return true;
    }

    const isDuplicateGuarantor = (member: SearchedMemberType) => {
        return cloneDeep(selectedContacts).some((contact) => (member.phone === contact.phone || member.memberRefId === contact.memberRefId));
    }

    const addContactToList = async (searchedMember: SearchedMemberType | undefined) => {
        if (searchedMember) {
            if (guarantor?.memberNumber === searchedMember.memberNumber) {
                setValue('searchTerm', '');
                set_phonebook_contact_name('');
                CSTM.showToast("Select a different guarantor");
                return;
            }
            if (!isDuplicateGuarantor(searchedMember)) {
                const newDeserializedCopy: any[] = cloneDeep([]);
                newDeserializedCopy.push(searchedMember);
                setSelectedContacts(newDeserializedCopy);
                setValue('searchTerm', '');
                set_phonebook_contact_name('');
            } else {
                setValue('searchTerm', '');
                set_phonebook_contact_name('');
                CSTM.showToast("Duplicate Entry");
            }
        }
    }

    const searchMemberByMemberNo = async (member_no: string): Promise<SearchedMemberType | undefined> => {
        const {payload, type, error}: {payload: any, type: string, error?: any} = await dispatch(searchByMemberNo(member_no));

        if (type === 'searchByMemberNo/rejected') {
            CSTM.showToast(`${member_no}: is not a member.`);
            setValue('searchTerm', '');
            set_phonebook_contact_name('');
            return undefined;
        }

        if (type === "searchByMemberNo/fulfilled") {
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
                    CSTM.showToast(e.message);
                });
        }

        return () => {
            reactToSearch = false;
            setSearching(false);
        };
    }, [searching]);

    const submitEdit = () => {
        const [phoneRegex, memberNoRegex] = [
            /^([\d{1,2}[]?|)\d{3}[]?\d{3}[]?\d{4}$/i,
            /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{3,9}$/i
        ];
        if (memberNoRegex.test(getValues("searchTerm"))) {
            searchMemberByMemberNo(getValues("searchTerm"))
                .then(addContactToList)
                .catch(e => {
                    CSTM.showToast(e.message);
                });
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
            CSTM.showToast("Wrong Format: remove country code");
        }
    }

    const onPress = useCallback((ctx: string) => {
        console.log('onpress', ctx);
    },[]);

    const requiredGuarantors = () => {
        return 1;
    }

    const isDisabled = () => {
        return selectedContacts.length < requiredGuarantors();
    };

    const submitLoanRequest = () => {
        return Alert.alert('Confirmation', `Are you sure you want to replace ${guarantor?.firstName} ${guarantor?.lastName} as your guarantor?`, [
            {
                text: 'CANCEL',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel'
            },
            {
                text: 'YES',
                onPress: () => {
                    if (loan && guarantor && !isDisabled()) {
                        dispatch(replaceGuarantor({
                            loanRefId : `${loan?.refId}`,
                            memberRefId: member?.refId as string,
                            oldGuarantorRef: `${guarantor?.memberRefId}`,
                            newGuarantorRef: `${selectedContacts[0].memberRefId}`,
                        })).then((response) => {
                            const {error, meta, payload, type}: any = response;

                            if (type === "replaceGuarantor/rejected") {
                                setValue('searchTerm', '');
                                set_phonebook_contact_name('');
                                CSTM.showToast(error.message);
                            } else {
                                setValue('searchTerm', '');
                                set_phonebook_contact_name('');
                                CSTM.showToast("Guarantor Replaced");
                            }
                        }).catch(error => {
                            console.warn(error.message);
                            CSTM.showToast(error.message ? error.message : "Couldn't replace guarantor");
                        }).finally(() => navigation.navigate('LoanRequests'))
                    } else {
                        CSTM.showToast("Missing Data");
                    }
                }
            }
        ])
    };

    const computeProgress = (item?: GuarantorData) => {
        let progress: number = 0.0
        if (item) {
            if (item.isAccepted) {
                progress+=0.25
            }
            if (item.isSigned) {
                progress+=0.25
            }
            if (item.isApproved) {
                progress+=0.5
            }
        }
        return progress
    }

    return (
        <View style={styles.container}>
            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end', marginHorizontal: 10, paddingHorizontal: 5}}>
                <Pressable style={{paddingBottom: 6, paddingRight: 20}} onPress={() => navigation.navigate('LoanRequests')}>
                    <AntDesign name="arrowleft" size={24} color="#489AAB" />
                </Pressable>
                <Text style={{fontSize: 17, lineHeight: 22, letterSpacing: 0.5, paddingTop: 20, paddingBottom: 10 }}>Replace Guarantor ({guarantor?.memberNumber})</Text>
            </View>
            <View style={styles.searchableHeader}>
                <Pressable style={{flex: 0.1,display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}} onPress={submitEdit}>
                    <AntDesign name="search1" size={15} color="rgba(0,0,0,0.90)" />
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

                    <AntDesign style={{ paddingRight: 10, paddingVertical: 5 }} name="adduser" size={18} color="rgba(0,0,0,0.89)" />
                </Pressable>
            </View>

            <ContactSectionList contactsData={
                [
                    {
                        id: 2,
                        title:`SELECTED GUARANTOR`,
                        data: selectedContacts.length > 0 ? selectedContacts : [
                            {
                                name: false
                            }
                        ]
                    }
                ]
            } searching={searching} addContactToList={addContactToList} removeContactFromList={removeContactFromList} contactList={selectedContacts} onPress={onPress} setEmployerDetailsEnabled={setEmployerDetailsEnabled} />
            <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'rgba(255,255,255,0.9)', width, display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity disabled={isDisabled() || loading} onPress={submitLoanRequest} style={{ display: 'flex', alignItems: 'center', backgroundColor: isDisabled() || loading ? '#CCCCCC' : '#489AAB', width: width/2, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 25, marginVertical: 10 }}>
                    <Text allowFontScaling={false} style={styles.buttonText}>Set Guarantor</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
        marginHorizontal: 0,
        backgroundColor: '#F6F6F6'
    },
    searchableHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
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
    buttonText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#FFFFFF',
        fontFamily: 'Poppins_600SemiBold'
    },
});

export default ReplaceActor;
