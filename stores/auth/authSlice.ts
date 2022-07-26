import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {deleteSecureKey, getSecureKey, saveSecureKey} from '../../utils/secureStore'
import {openDatabase} from "../../database";
import * as Contacts from "expo-contacts";
import {SQLError, SQLResultSet, SQLTransaction, WebSQLDatabase} from "expo-sqlite";
export let db: WebSQLDatabase
(async () => {
    db = await openDatabase();
})()

export type loginUserType = {
    phoneNumber: number,
    pin: number | string,
    tenant?: string,
    clientSecret?: string,
}

type CategoryType = {code: string, name: string, options: {code: string, name: string, options: {code: string, name: string,selected: boolean}[], selected: boolean}[]}

interface AuthData {
    companyName: string,
    email: string,
    firstName: string,
    keycloakId: string,
    lastName: string,
    tenantId: string,
    username: string,
    phoneNumber: string,
}

interface MemberData {
    availableAmount: number,
    committedAmount: number,
    createdBy: string,
    details: {Age: { type: string, value: string }, EmployerName: { type: string, value: string }, Gender: { type: string, value: string }},
    email: string,
    firstName: string,
    fullName: string,
    idNumber: string,
    lastName: string,
    memberNumber: string,
    memberStatus: string,
    phoneNumber: string,
    refId: string,
    totalDeposits: number,
    totalShares: number,
    updated: string,
    updatedBy: string,
}

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

interface LoanRequest {
    refId: string,
    loanDate: string,
    loanRequestNumber: string,
    loanAmount: string,
    pdfThumbNail: string,
}

interface LoanProduct {
    refId: string;
    name: string;
    interestRate: number;
    requiredGuarantors: number;
}

type WitnessRequestType = {
    memberRefId: string,
    firstName: string,
    lastName: string,
    witnessAcceptanceStatus: string,
    applicant: {firstName: string, lastName: string, refId: string, memberNo: string},
    loanRequest: {refId: string, loanNumber: string, amount: string}
}

type GuarantorshipRequestType = {
    applicant: {firstName: string, lastName: string, refId: string},
    committedAmount: string,
    firstName: string,
    isActive: string,
    lastName: string,
    loanRequest: {amount: number, loanNumber: string, refId: string},
    memberNumber: string,
    memberRefId: string,
    refId: string
}

type TenantsType = {
    "id": string,
    "keycloakId": string,
    "username": string,
    "phoneNumber": string,
    "email": string,
    "firstName": string,
    "lastName": string,
    "tenantId": string,
    "userType": string,
    "pinStatus": string,
    "invitationStatus": string,
    "tenantName": string
}

type otpResponseType = {
    "requestMapper": string,
    "success": boolean,
    "message": string,
    "ttl": number
}

type MemberDetailsType = {
    "refId": string,
    "created": string,
    "createdBy": string,
    "updated": string,
    "updatedBy": string,
    "isActive": boolean,
    "id": number,
    "firstName": string,
    "fullName": string,
    "lastName": string,
    "idNumber": string,
    "memberNumber": string,
    "phoneNumber": string,
    "email": string,
    "totalShares": number,
    "totalDeposits": number,
    "committedAmount": number,
    "availableAmount": number,
    "isTermsAccepted": boolean,
    "memberStatus": string,
    "details": any,
    "loansGuaranteedByMe": any[],
    "loansGuaranteedToMe": any[],
    "activeLoans": any[],
    "lastModified": string
}

type membersFilter = {
    "isTermsAccepted": boolean,
    "refId": string,
    "created": string,
    "firstName": string,
    "lastName": string,
    "idNumber": string,
    "memberNumber": string,
    "phoneNumber": string,
    "email": string,
    "totalShares": number,
    "totalDeposits": number,
    "committedAmount": number,
    "availableAmount": number,
    "memberStatus": string,
    "loanCount": number
};

export type storeState = {
    user: AuthData | null;
    member: MemberData | null;
    memberDetails: MemberDetailsType | null;
    loanRequests: LoanRequestData[] | null;
    loanRequest: LoanRequest | null;
    loanProducts: LoanProduct[] | null;
    loanProduct: LoanProduct | null;
    isLoggedIn: boolean;
    loading: boolean;
    isJWT: boolean | string;
    otpSent: boolean;
    optVerified: boolean;
    searchedMembers: membersFilter[];
    contacts: {contact_id: number, name: string, phone: string}[] | null;
    loanCategories: CategoryType[] | null,
    appInitialized: boolean,
    witnessRequests: WitnessRequestType[] | []
    guarantorshipRequests: GuarantorshipRequestType[] | []
    tenants: TenantsType[] | []
    selectedTenantId: string | null
    otpResponse: otpResponseType | null
}

const fetchContactsFromPB = async (): Promise<{name: string, phone: string}[]> => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync();
        if (data.length > 0) {
            return data.reduce((acc: any[], contact: any) => {
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                    acc.push({name: contact.name, phone: contact.phoneNumbers[0].number})
                }
                return acc
            }, [])
        } else {
            return []
        }
    } else {
        return []
    }
}

export const searchContactsInDB = createAsyncThunk('searchContactsInDB', async({searchTerm, setContacts}: {searchTerm: string, setContacts: any}) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(`SELECT * FROM contacts WHERE name LIKE '%${searchTerm}%' OR phone LIKE '%${searchTerm}%' LIMIT '0', '100'`, undefined,
                // success callback which sends two things Transaction object and ResultSet Object
                (txObj: any, { rows: { _array } } : any) => {
                    setContacts(_array)
                },
                // failure callback which sends two things Transaction object and Error
                (txObj:any, error: any) => {
                    reject(error)
                }
            ) // end executeSQL
        })
    })
})

export const initializeDB = createAsyncThunk('initializeDB', async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            db.transaction((tx: SQLTransaction) => {
                tx.executeSql(`delete from contacts`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully deleted contacts')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('delete contacts error', error.message)
                    }
                )

                tx.executeSql(`delete from contact_groups`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully deleted contact_groups')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('delete contact_groups error', error.message)
                    }
                )

                tx.executeSql(`delete from groups`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully deleted groups')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('delete groups error', error.message)
                    }
                )

                tx.executeSql(`CREATE TABLE IF NOT EXISTS groups ( group_id integer constraint groups_pk primary key autoincrement, name text not null)`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully created groups')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('create groups error', error.message)
                    }
                )

                tx.executeSql(`CREATE TABLE IF NOT EXISTS contacts ( contact_id integer constraint contacts_pk primary key autoincrement, name text not null, phone text not null, memberNumber text default null, memberRefId text default null)`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully created contacts')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('create contacts error', error.message)
                    }
                )

                tx.executeSql(`create unique index contacts_phone_uindex on contacts (phone)`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully created unique phone')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('error  unique phone index', error.message)
                    }
                )

                tx.executeSql(`CREATE TABLE IF NOT EXISTS contact_groups (contact_id INTEGER references contacts on delete cascade, group_id   INTEGER references groups on delete cascade, primary key (contact_id, group_id))`, undefined,
                    (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                        console.log('successfully created contact_groups')
                    },

                    (txObj: SQLTransaction, error: SQLError): any => {
                        console.log('create contact_groups error', error.message)
                    }
                )

            })
            resolve(Promise.all([true]))
        } catch (e: any) {
            reject(e)
        }
    })
});

type actorTypes = "GUARANTOR" | "WITNESS" | "APPLICANT"

type zohoSignPayloadType = {loanRequestRefId: string,actorRefId: string,actorType: actorTypes}

export const requestSignURL = createAsyncThunk('requestSignURL', async ({loanRequestRefId,actorRefId,actorType}: zohoSignPayloadType) => {
    try {
        const key = await getSecureKey('access_token');

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);
        myHeaders.append("Content-Type", 'application/json');

        const payload: zohoSignPayloadType = {
            loanRequestRefId,
            actorRefId,
            actorType
        };

        const response = await fetch('https://eguarantorship-api.presta.co.ke/api/v1/zoho/get-sign-url', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            const data = await response.json();
            return Promise.resolve(data);
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`Document Expired`);
        }
    } catch (e: any) {
        return Promise.reject(e.message);
    }
});

type validateGuarantorType = {applicantMemberRefId: string , memberRefIds: string[], loanProductRefId: string, loanAmount: number, guaranteeAmount?: number}

export const validateGuarantorship = createAsyncThunk('validateGuarantorship', async (payload:validateGuarantorType) => {
    try {
        const key = await getSecureKey('access_token');

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);
        myHeaders.append("Content-Type", 'application/json');

        const response = await fetch('https://eguarantorship-api.presta.co.ke/api/v1/loan-request/guarantors-status', {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            const data = await response.json();
            return Promise.resolve(data);
        } else if (response.status === 401) {
            console.log('setting to false');
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`Http Status: ${response.status}`);
        }

    } catch (e: any) {
        return Promise.reject(e.message);
    }
});

export const saveContactsToDb = createAsyncThunk('saveContactsToDb', async() => {
    return new Promise(async (resolve, reject) => {
        try {
            const contacts2D = await fetchContactsFromPB()
            db.transaction((tx: SQLTransaction) => {
                contacts2D.reduce((acc: any, {name, phone}: {name: string, phone: string}, currentIndex, arr) => {
                    tx.executeSql('INSERT INTO contacts (name, phone) values (?, ?)', [name, phone],
                        // success callback which sends two things Transaction object and ResultSet Object
                        (txObj: SQLTransaction, resultSet: SQLResultSet) => {
                            acc.push(resultSet.insertId);
                            if (arr.length === (currentIndex + 1)) {
                                resolve(acc);
                            }
                        },
                        // failure callback which sends two things Transaction object and Error
                        (txObj: SQLTransaction, error: SQLError): any => {
                            // console.log(error.message);
                        }
                    )
                    return acc
                }, []);
            })
        } catch (e: any) {
            reject(e)
        }
    })
})

export const updateContact = createAsyncThunk('updateContact', async (sql: string) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(`${sql}`, undefined,
                // success callback which sends two things Transaction object and ResultSet Object
                (txObj: SQLTransaction, { rows: { _array } } : Pick<SQLResultSet, "rows">) => {
                    let result: any = _array
                    console.log(_array)
                    resolve(result)
                },
                // failure callback which sends two things Transaction object and Error
                (txObj: SQLTransaction, error: SQLError): any => {
                    console.log('error updating', error.message);
                    reject(error.message)
                }
            ) // end executeSQL
        })
    })
})

export const getContactsFromDB = createAsyncThunk('getContactsFromDB', async ({setContacts, from, to}: {setContacts: any, from: number, to: number}) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(`SELECT * FROM contacts ORDER BY name LIMIT '0', '100'`, undefined,
                // success callback which sends two things Transaction object and ResultSet Object
                (txObj: any, { rows: { _array } } : any) => {
                    setContacts(_array)
                },
                // failure callback which sends two things Transaction object and Error
                (txObj:any, error: any) => {
                    console.log('getContactsFromDB')
                    reject(error)
                }
            ) // end executeSQL
        })
    })
})

export const checkForJWT = createAsyncThunk('checkForJWT', async () => {
    return await getSecureKey('access_token')
})

export const loginUser = createAsyncThunk('loginUser', async ({ phoneNumber, pin, tenant, clientSecret }: Pick<loginUserType, "phoneNumber" | "pin" | "tenant" | "clientSecret">) => {
    return new Promise(async (resolve, reject) => {
        const details: any = {
            phoneNumber: phoneNumber,
            ussdpin: pin,
            client_id: 'direct-access',
            client_secret: clientSecret,
            grant_type: 'password',
            scope: 'openid'
        }

        let formBody: any = [];
        for (const property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        try {
            const response = await fetch(`https://iam.presta.co.ke/auth/realms/${tenant}/protocol/openid-connect/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                },
                body: formBody
            });

            if (response.status === 401) {
                setAuthState(false);
                // console.log("Incorrect phone number or password");
                reject("Incorrect phone number or password");
            }

            if (response.status === 200) {
                const data = await response.json();
                const result: any = await saveKeys({...data, phoneNumber})
                resolve(result)
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject(response.status)
            }
        } catch (e: any) {
            reject(e.message)
        }
    })
})

export const logoutUser = createAsyncThunk('logoutUser', async () => {
    return await Promise.all([
        deleteSecureKey('otp_verified'),
        deleteSecureKey('access_token'),
        deleteSecureKey('refresh_token'),
        deleteSecureKey('phone_number'),
        deleteSecureKey('existing'),
        deleteSecureKey('fingerPrint')
    ]);
});

export const setLoading = createAsyncThunk('setLoading', async (loading: boolean) => {
    return Promise.resolve(loading)
});

type memberPayloadType = {firstName: string, lastName: string, phoneNumber: string, idNumber: string, email: string, memberRefId?: string}

export const editMember = createAsyncThunk('editMember', async (payload: memberPayloadType) => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/members/${payload.memberRefId}`;

    try {
        const key = await getSecureKey('access_token');

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);

        myHeaders.append("Content-Type", 'application/json');

        delete payload.memberRefId

        console.log(payload)

        const response = await fetch(url, {
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify(payload)
        });

        if (response.status === 200) {
            const data = await response.json();
            return Promise.resolve(data);
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`API error code: ${response.status}`);
        }

    } catch (e: any) {
        return Promise.reject(e.message)
    }
});

const saveKeys = async ({ access_token, expires_in, refresh_expires_in, refresh_token, phoneNumber }: any) => {
    try {
        await Promise.all([
            saveSecureKey('access_token', access_token),
            saveSecureKey('refresh_token', refresh_token),
            saveSecureKey('phone_number', `${phoneNumber}`),
            saveSecureKey('existing', 'true')
        ]);
        return Promise.resolve(true);
    } catch(e: any) {
        console.log("saveKeys", e);
        return Promise.reject(e);
    }
}

export const sendOtp = createAsyncThunk('sendOtp', async (phoneNumber: any) => {
    try {
        const key = await getSecureKey('access_token');

        if (!phoneNumber) {
            return Promise.reject('User not available')
        }

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);
        myHeaders.append("Content-Type", 'application/json');
        console.log(`https://eguarantorship-api.presta.co.ke/api/v1/members/send-otp/${phoneNumber}`);
        const response = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members/send-otp/${phoneNumber}`, {
            method: 'POST',
            headers: myHeaders
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log(data);
            if (data.success) {
                return Promise.resolve(data);
            } else {
                return Promise.reject(data.message);
            }
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`API error code: ${response.status}`);
        }
    } catch (e: any) {
        return Promise.reject(e.message);
    }
})

export const searchByMemberNo = createAsyncThunk('searchByMemberNo', async (memberNo: string) => {
    try {
        const key = await getSecureKey('access_token');

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);
        myHeaders.append("Content-Type", 'application/json');

        const response = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members?order=ASC&pageSize=1&searchTerm=${memberNo}`, {
            method: 'GET',
            headers: myHeaders
        });

        if (response.status === 200) {
            const { list } = await response.json();
            return Promise.resolve(list);
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`is not a member.`);
        }

    } catch (e: any) {
        return Promise.reject(e.message);
    }
})

export const verifyOtp = createAsyncThunk('verifyOtp', async ({ requestMapper, OTP }: { requestMapper: string, OTP: string }) => {
    try {
        const key = await getSecureKey('access_token');

        if (!key) {
            return Promise.reject('You are not authenticated');
        }

        const myHeaders = new Headers();

        myHeaders.append("Authorization", `Bearer ${key}`);
        myHeaders.append("Content-Type", 'application/json');

        const response = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members/validate-otp/${requestMapper}/${OTP}`, {
            method: 'POST',
            headers: myHeaders
        });

        if (response.status === 200) {
            const data = await response.json();
            if (data.validated) {
                await saveSecureKey('otp_verified', 'true');
                return Promise.resolve(data);
            } else {
                return Promise.reject("OTP Invalid");
            }

        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(`API error code: ${response.status}`);
        }
    } catch (e: any) {
        return Promise.reject(e.message);
    }
});

export const submitLoanRequest = createAsyncThunk('submitLoanRequest', async( payload: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token');

            if (!key) {
                reject('You are not authenticated');
            }

            const myHeaders = new Headers();

            myHeaders.append("Authorization", `Bearer ${key}`);
            myHeaders.append("Content-Type", 'application/json');

            const response = await fetch('https://eguarantorship-api.presta.co.ke/api/v2/loan-request', {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(payload)
            });

            if (response.status === 200) {
                const data = await response.json();
                resolve(data);
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject(response);
            }
        } catch (e: any) {
            reject(e.message);
        }
    })
});

export const fetchGuarantorshipRequests = createAsyncThunk('fetchGuarantorshipRequests', ({memberRefId}: {memberRefId: string | undefined }) => {
    return new Promise(async (resolve, reject) => {
        const key = await getSecureKey('access_token');
        if (!memberRefId) {
            reject('No Member Ref Id Provided');
        }
        if (!key) {
            reject("You are not authenticated")
        }
        const result = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/guarantorship-request?acceptanceStatus=INPROGRESS&memberRefId=${memberRefId}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            }
        });

        if (result.status === 200) {
            const data = await result.json();
            console.log('all guarantorship requests', data);
            resolve(data);
        } else if (result.status === 401) {
            setAuthState(false);
            reject(result.status);
        } else {
            reject(`is not a member.`);
        }
    })
});

export const fetchFavouriteGuarantors = createAsyncThunk('fetchFavouriteGuarantors', ({memberRefId, setFaveGuarantors}: {memberRefId: string | undefined, setFaveGuarantors: any}) => {
    return new Promise(async (resolve, reject) => {
        const key = await getSecureKey('access_token');
        if (!memberRefId) {
            reject('No Member Ref Id Provided');
        }
        if (!key) {
            reject("You are not authenticated")
        }
        const result = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/favorite-guarantor/favorite-guarantors/${memberRefId}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            }
        });

        // console.log("favourite guarantors", result.status);

        if (result.status === 204) {
            console.log(`https://eguarantorship-api.presta.co.ke/api/v1/favorite-guarantor/favorite-guarantors/${memberRefId}`);
            reject("No guarantors found");
        }

        if (result.status === 200) {
            const data = await result.json();
            console.log("favourite guarantors", data);
            setFaveGuarantors(data);
            resolve(data);
        } else if (result.status === 401) {
            setAuthState(false);
            reject(result.status);
        } else {
            reject(`is not a member.`);
        }
    })
});

export const validateNumber = createAsyncThunk('validateNumber', async (phone: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token')
            if (!key) {
                reject("You are not authenticated")
            }
            const result = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members/search/by-phone?phoneNumber=${phone}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`,
                }
            });
            if (result.status === 200) {
                const data = await result.json();
                resolve(data);
            } else if (result.status === 401) {
                setAuthState(false);
                reject(result.status);
            } else {
                reject(`is not a member of this organisation`);
            }
        } catch (e: any) {
            reject(e.message);
        }
    })
})

export const authenticate = createAsyncThunk('authenticate', async () => {
    return new Promise(async (resolve, reject) => {
       try {
           const key = await getSecureKey('access_token')

           if (!key) {
               reject("You are not authenticated")
           }
           const response = await fetch(`https://accounts.presta.co.ke/authentication`, {
               method: 'GET',
               headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${key}`,
               }
           })
           if (response.status === 200) {
               const data = await response.json()

               if (key) {
                   const base64Url = key.split('.')[1];
                   const base64String = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                   let str = base64String.replace(/=+$/, '');
                   let output = '';
                   if (str.length % 4 == 1) {
                       throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
                   }
                   for (let bc = 0, bs = 0, buffer, i = 0;
                        buffer = str.charAt(i++);

                        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
                   ) {
                       buffer = chars.indexOf(buffer);
                   }
                   const { phoneNumber }: { phoneNumber?: string } = JSON.parse(output);
                   console.log("user data", {
                       ...data,
                       phoneNumber
                   });
                   resolve({
                       ...data,
                       phoneNumber
                   })
               }

           }  else if (response.status === 401) {
               setAuthState(false);
               reject(response.status);
           } else {
               reject("Authentication Failed")
           }
       } catch (e: any) {
           reject(e.message)
       }
    })
})

export const getTenants = createAsyncThunk('getTenants', async (phoneNumber: string) => {
    const myHeaders = new Headers();
    myHeaders.append("api-key", `EqU.+vP\\_74Vu<'$jGxxfvwqN(z"h46Z2"*G=-ABs=rSDF&4.e`);
    const url = `https://accounts.presta.co.ke/api/v1/users/tenants/${phoneNumber}`;
    console.log(url)
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: myHeaders
        });

        if (response.status === 200) {
            console.log("successful");
            const data = await response.json()
            return Promise.resolve(data)
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            console.log("Failure");
            return Promise.reject("API response code: "+response.status)
        }

    } catch (e: any) {
        console.log(e)
        return Promise.reject(e)
    }
})

export const fetchMember = createAsyncThunk('fetchMember', async (phoneNumber: string | undefined) => {
    return new Promise(async (resolve, reject) => {
       try {
           const key = await getSecureKey('access_token');
           if (!key) {
               reject("You are not authenticated");
           }
           const myHeaders = new Headers();
           myHeaders.append("Authorization", `Bearer ${key}`);
           const response = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members/search/by-phone?phoneNumber=${phoneNumber}`, {
               method: 'GET',
               headers: myHeaders,
               redirect: 'follow'
           });
           console.log(`https://eguarantorship-api.presta.co.ke/api/v1/members/search/by-phone?phoneNumber=${phoneNumber}`);
           if (response.status === 200) {
               const data = await response.json();
               console.log("Fetch Member Data", data);
               resolve(data);
           }  else if (response.status === 401) {
               setAuthState(false);
               reject(response.status);
           } else {
               console.log("Fetch Member Failed");
               reject("Fetch Member Failed");
           }
       } catch (e: any) {
           reject(e.message);
       }
    })
})

export const fetchWitnessRequests = createAsyncThunk('fetchWitnessRequests', async ({memberRefId}: {memberRefId: string | undefined }) => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/witness-request?acceptanceStatus=ANY&memberRefId=${memberRefId}`

    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token')
            if (!key) {
                reject("You are not authenticated")
            }
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${key}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            });

            if (response.status === 200) {
                const data = await response.json();
                console.log("witness data", data);
                resolve(data);
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject("Witness Requests not found!");
            }
        } catch (e: any) {
            reject(e.message)
        }
    });
})

export const fetchLoanRequests = createAsyncThunk('fetchLoanRequests', async (memberRefId: string) => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/loan-request?memberRefId=${memberRefId}`
    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token')
            if (!key) {
                reject("You are not authenticated")
            }
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${key}`)
            const response = await fetch(url, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            })
            if (response.status === 200) {
                const data = await response.json()
                const result: any = await Promise.all(data.content.map(async ({refId}: {refId: string}, i: number) => {
                    const response0 = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/loan-request/${refId}`, {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow'
                    })
                    if (response0.status === 200) {
                        const data0 = await response0.json()
                        return {
                            "refId": data.content[i].refId,
                            "loanDate": data.content[i].loanDate,
                            "loanRequestNumber": data.content[i].loanRequestNumber,
                            "loanProductName": data.content[i].loanProductName,
                            "loanProductRefId": data.content[i].loanProductRefId,
                            "loanAmount": data.content[i].loanAmount,
                            "guarantorsRequired": data.content[i].guarantorsRequired,
                            "guarantorCount": data.content[i].guarantorCount,
                            "status": data.content[i].status,
                            "signingStatus": data.content[i].signingStatus,
                            "acceptanceStatus": data.content[i].acceptanceStatus,
                            "applicationStatus": data.content[i].applicationStatus,
                            "memberRefId": data.content[i].memberRefId,
                            "memberNumber": data.content[i].memberNumber,
                            "memberFirstName": data.content[i].memberFirstName,
                            "memberLastName": data.content[i].memberLastName,
                            "phoneNumber": data.content[i].phoneNumber,
                            "loanRequestProgress": data0.loanRequestProgress,
                            "totalDeposits": data0.totalDeposits,
                            "applicantSigned": data0.applicantSigned,
                            "witnessName": data0.witnessName,
                            "guarantorList": data0.guarantorList,
                        }
                    } else if (response.status === 401) {
                        setAuthState(false);
                        reject(response.status);
                    }
                }))
                resolve(result)
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject("Fetch Member Failed")
            }
        } catch (e: any) {
            reject(e.message)
        }
    })
})

export const fetchLoanRequest = createAsyncThunk('fetchLoanRequest', async (refId: string) => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/loan-request/${refId}`
    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token')
            if (!key) {
                reject("You are not authenticated")
            }
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${key}`)
            const response = await fetch(url, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            })
            if (response.status === 200) {
                const data = await response.json()
                console.log("fetchLoanRequest", data);
                resolve(data)
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject("Fetch Loan Request Failed")
            }
        } catch (e: any) {
            reject(e.message)
        }
    })
})

export const fetchLoanProducts = createAsyncThunk('fetchLoanProducts', async () => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/loans-products`

    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('access_token')
            if (!key) {
                reject("You are not authenticated")
            }
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${key}`)
            const response = await fetch(url, {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            })
            if (response.status === 200) {
                const data = await response.json()
                resolve(data.list)
            } else if (response.status === 401) {
                setAuthState(false);
                reject(response.status);
            } else {
                reject("fetch loan products failed")
            }
        } catch (e: any) {
            reject(e.message)
        }
    })
})

export const setLoanCategories = createAsyncThunk('setLoanCategories', async(signal: any) => {
    const key = await getSecureKey('access_token')
    if (!key) {
        console.log("You are not authenticated")
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${key}`)
    const response = await fetch('https://eguarantorship-api.presta.co.ke/api/v1/jumbostar/sasra-code', {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
        signal: signal
    })

    if (response.status === 200) {
        try {
            const data = await response.json();
            let loanCategories = data.reduce((acc: {code: string, name: string, options: {code: string, name: string, selected: boolean, options: []}[]}[], current: {[key: string]: string}) => {
                acc.push({
                    code: current.code,
                    name: current.name,
                    options: []
                })
                return acc
            },[]);

            let loanSubCategoriesData = loanCategories.reduce((acc: any[], curr: {code: string, name: string, options: {name: string, selected: boolean}[]}) => {
                acc.push(new Promise(resolve => {
                    fetch(`https://eguarantorship-api.presta.co.ke/api/v1/jumbostar/sasra-code?parent=${curr.code}`, {
                        method: 'GET',
                        headers: myHeaders,
                        redirect: 'follow',
                        signal: signal
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            let options = data.map((member: any, i: any) => {
                                let code = Object.keys(member)[0]
                                return {
                                    code: member.code,
                                    name: member.name,
                                    selected: false,
                                    options: [],
                                }
                            })
                            resolve({
                                ...curr,
                                options
                            })
                        }).catch((e: any) => {
                        console.log("error sasra-code?parent", e)
                    })
                }))
                return acc
            },[]);

            const loanSubCategories: CategoryType[] = await Promise.all(loanSubCategoriesData);
            const withAllOptions = loanSubCategories.reduce((accumulator: any[], currentValue) => {
                let allSubOptionsPromises = currentValue.options.reduce((a: any, c) => {
                    a.push(new Promise(resolve => {
                        fetch(`https://eguarantorship-api.presta.co.ke/api/v1/jumbostar/sasra-code?parent=${currentValue.code}&child=${c.code}`, {
                            method: 'GET',
                            headers: myHeaders,
                            redirect: 'follow',
                            signal: signal
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                let options = data.map((member: any, i: any) => {
                                    let code = Object.keys(member)[0]
                                    return {
                                        code: member.code,
                                        name: member.name,
                                        selected: false
                                    }
                                })
                                resolve({
                                    ...c,
                                    options
                                })
                            })
                    }))
                    return a
                },[])
                accumulator.push(new Promise(resolve => {
                    Promise.all(allSubOptionsPromises).then((allSubOptionsData => {
                        resolve({...currentValue, options: allSubOptionsData})
                    }))
                }))
                return accumulator
            }, []);
            return Promise.all(withAllOptions);
        } catch (e: any) {
            console.log('errors not resolving purpose', e);
            return Promise.reject('Cant resolve sasra');
        }
    } else if (response.status === 401) {
        setAuthState(false);
        return Promise.reject(response.status);
    } else {
        return Promise.reject('Cant resolve sasra');
    }
})

export const resubmitForSigning = createAsyncThunk('resubmitForSigning', async (refId: string) => {
    try {
        const url = `https://eguarantorship-api.presta.co.ke/api/v1/loan-request/${refId}/sign`
        const key = await getSecureKey('access_token')
        if (!key) {
            setAuthState(false);
            return Promise.reject(401)
        }
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${key}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: myHeaders
        });
        if (response.status === 200) {
            return Promise.resolve(true);
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(response.status + ": API Error");
        }
    } catch(e: any) {
        console.log(e.message);
        return Promise.reject(e.message);
    }
})

export const fetchMemberDetails = createAsyncThunk('fetchMemberDetails', async ({memberNo, signal}: {memberNo: string | undefined, signal: any}) => {
    try {
        const key = await getSecureKey('access_token')
        if (!key) {
            console.log("You are not authenticated")
        }
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${key}`);

        const url = `https://eguarantorship-api.presta.co.ke/api/v1/jumbostar/member-details?memberId=${memberNo}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow',
            signal: signal
        });
        if (response.status === 200) {
            const data = await response.json();
            if (Array.isArray(data)) {
                return Promise.resolve(data[0])
            } else {
                return Promise.resolve(data)
            }
        } else if (response.status === 401) {
            setAuthState(false);
            return Promise.reject(response.status);
        } else {
            return Promise.reject(response.status + ": API Error");
        }
    } catch (e: any) {
        console.log(e.message);
        return Promise.reject(e.message);
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: <storeState>{
        user: null,
        member: null,
        memberDetails: null,
        isLoggedIn: false,
        loading: false,
        isJWT: false,
        otpSent: false,
        optVerified: false,
        loanRequests: null,
        loanRequest: null,
        contacts: null,
        loanCategories: null,
        appInitialized: false,
        witnessRequests: [],
        guarantorshipRequests: [],
        tenants: [],
        selectedTenantId: null,
        otpResponse: null,
    },
    reducers: {
        createLoanProduct(state, action) {
            state.loanProduct = action.payload
            return state
        },
        setSelectedTenantId(state, action) {
            state.selectedTenantId = action.payload
            return state
        },
        setAuthState(state, action) {
            state.isLoggedIn = action.payload
            console.log('is logged in', state.isLoggedIn);
            return state
        }
    },
    extraReducers: builder => {
        builder.addCase(initializeDB.pending, state => {
            state.loading = true
        })
        builder.addCase(initializeDB.fulfilled, (state, action) => {
            state.appInitialized = true
            state.loading = false
        })
        builder.addCase(initializeDB.rejected, (state) => {
            state.loading = false
        })

        builder.addCase(fetchMemberDetails.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchMemberDetails.fulfilled, (state, action) => {
            state.memberDetails = action.payload
            state.loading = false
        })
        builder.addCase(fetchMemberDetails.rejected, (state) => {
            state.loading = false
        })

        builder.addCase(resubmitForSigning.pending, state => {
            state.loading = true
        })
        builder.addCase(resubmitForSigning.fulfilled, (state, action) => {
            state.loading = false
        })
        builder.addCase(resubmitForSigning.rejected, (state) => {
            state.loading = false
        })

        builder.addCase(checkForJWT.pending, state => {
            state.loading = true
        })
        builder.addCase(checkForJWT.fulfilled, (state, action) => {
            state.isJWT = !!action.payload
            state.loading = false
        })
        builder.addCase(checkForJWT.rejected, (state) => {
            state.isJWT = false
            state.loading = false
        })

        builder.addCase(setLoanCategories.pending, state => {
            state.loading = true
        })
        builder.addCase(setLoanCategories.fulfilled, (state, action) => {
            state.loanCategories = action.payload
            state.loading = false
        })
        builder.addCase(setLoanCategories.rejected, (state) => {
            state.loading = false
        })

        builder.addCase(loginUser.pending, state => {
            state.loading = true
        })
        builder.addCase(loginUser.fulfilled, (state,action) => {
            // state.isLoggedIn = true
            state.loading = false
        })
        builder.addCase(loginUser.rejected, (state, error) => {
            state.isJWT = false
            state.isLoggedIn = false
            state.loading = false
        })

        builder.addCase(authenticate.pending, state => {
            state.loading = true
        })
        builder.addCase(authenticate.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.user = payload;
            state.isLoggedIn = true;
            state.loading = false;
        })
        builder.addCase(authenticate.rejected, state => {
            state.isJWT = false
            state.loading = false
            state.isLoggedIn = false
            state.isJWT = false
        })

        builder.addCase(fetchMember.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchMember.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.member = payload
            state.loading = false
        })
        builder.addCase(fetchMember.rejected, state => {
            state.loading = false
        })

        builder.addCase(getTenants.pending, state => {
            state.loading = true
        })
        builder.addCase(getTenants.fulfilled, (state, { payload }: Pick<TenantsType, any>) => {
            state.tenants = payload
            state.loading = false
        })
        builder.addCase(getTenants.rejected, state => {
            state.loading = false
        })

        builder.addCase(editMember.pending, state => {
            state.loading = true
        })
        builder.addCase(editMember.fulfilled, (state, { payload }: any) => {
            console.log(payload);
            state.loading = false
        })
        builder.addCase(editMember.rejected, state => {
            state.loading = false
        })

        builder.addCase(fetchLoanRequests.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchLoanRequests.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.loanRequests = payload
            state.loading = false
        })
        builder.addCase(fetchLoanRequests.rejected, state => {
            state.loading = false
        })

        builder.addCase(fetchLoanRequest.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchLoanRequest.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.loanRequest = payload
            state.loading = false
        })
        builder.addCase(fetchLoanRequest.rejected, state => {
            state.loading = false
        })

        builder.addCase(fetchLoanProducts.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchLoanProducts.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.loanProducts = payload
            state.loading = false
        })
        builder.addCase(fetchLoanProducts.rejected, state => {
            state.loading = false
        })

        builder.addCase(logoutUser.pending, state => {
            state.loading = true
        })
        builder.addCase(logoutUser.fulfilled, (state, action) => {
            state.isJWT = false
            state.loading = false
            state.isLoggedIn = false
        })
        builder.addCase(logoutUser.rejected, state => {
            state.loading = false
        })

        builder.addCase(requestSignURL.pending, state => {
            state.loading = true
        })
        builder.addCase(requestSignURL.fulfilled, (state, action: any) => {
            console.log("requestSignURL", action.payload)
            state.loading = false
        })
        builder.addCase(requestSignURL.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(validateGuarantorship.pending, state => {
            state.loading = true
        })
        builder.addCase(validateGuarantorship.fulfilled, (state, action: any) => {
            console.log("validateGuarantorship", action.payload)
            state.loading = false
        })
        builder.addCase(validateGuarantorship.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(saveContactsToDb.pending, state => {
            state.loading = true
        })
        builder.addCase(saveContactsToDb.fulfilled, (state, action: any) => {
            state.loading = false
        })
        builder.addCase(saveContactsToDb.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(getContactsFromDB.pending, state => {
            state.loading = true
        })
        builder.addCase(getContactsFromDB.fulfilled, (state, action: any) => {
            // state.contacts = action.payload
            state.loading = false
        })
        builder.addCase(getContactsFromDB.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(searchContactsInDB.pending, state => {
            state.loading = true
        })
        builder.addCase(searchContactsInDB.fulfilled, (state, action: any) => {
            // state.contacts = action.payload
            state.loading = false
        })
        builder.addCase(searchContactsInDB.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(validateNumber.pending, state => {
            state.loading = true
        })
        builder.addCase(validateNumber.fulfilled, (state, action: any) => {
            // state.contacts = action.payload
            // console.log('successfully validated number ', action.payload);
            state.loading = false
        })
        builder.addCase(validateNumber.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(fetchGuarantorshipRequests.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchGuarantorshipRequests.fulfilled, (state, action: any) => {
            state.guarantorshipRequests = action.payload
            state.loading = false
        })
        builder.addCase(fetchGuarantorshipRequests.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(fetchWitnessRequests.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchWitnessRequests.fulfilled, (state, action: any) => {
            state.witnessRequests = action.payload
            state.loading = false
        })
        builder.addCase(fetchWitnessRequests.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(fetchFavouriteGuarantors.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchFavouriteGuarantors.fulfilled, (state, action: any) => {
            // state.contacts = action.payload
            state.loading = false
        })
        builder.addCase(fetchFavouriteGuarantors.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(submitLoanRequest.pending, state => {
            state.loading = true
        })
        builder.addCase(submitLoanRequest.fulfilled, (state, action: any) => {
            // state.contacts = action.payload
            console.log('successfully submitted loan request', action.payload);
            state.loading = false
        })
        builder.addCase(submitLoanRequest.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(sendOtp.pending, state => {
            state.loading = true
        })
        builder.addCase(sendOtp.fulfilled, (state, action: any) => {
            console.log("otp sent", action.payload)
            state.otpResponse = action.payload
            state.otpSent = true
            state.loading = false
        })
        builder.addCase(sendOtp.rejected, (state, action) => {
            state.loading = false
            state.otpSent = false
        })

        builder.addCase(verifyOtp.pending, state => {
            state.loading = true
        })
        builder.addCase(verifyOtp.fulfilled, (state, action: any) => {
            state.optVerified = true;
            state.isLoggedIn = true;
            state.loading = false;
        })
        builder.addCase(verifyOtp.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(searchByMemberNo.pending, state => {
            state.loading = true
        })
        builder.addCase(searchByMemberNo.fulfilled, (state, action: any) => {
            console.log("search by member number", action.payload);
            state.searchedMembers = action.payload
            state.loading = false;
        })
        builder.addCase(searchByMemberNo.rejected, (state, action) => {
            state.loading = false
        })

        builder.addCase(setLoading.fulfilled, (state, { payload }) => {
            state.loading = payload
        })
    }
})

// Extract the action creators object and the reducer
const { actions, reducer } = authSlice
// Extract and export each action creator by name
export const { createLoanProduct, setSelectedTenantId, setAuthState } = actions
// Export the reducer, either as a default or named export
export const authReducer = reducer
