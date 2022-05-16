import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {deleteSecureKey, getSecureKey, saveSecureKey} from '../../utils/secureStore'

export type loginUserType = {
    phoneNumber: number,
    pin: number,
    tenant?: string
}

interface UserData {
    id: string,
    keycloakId: string,
    username: string,
    phoneNumber: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    userType: string,
    pinStatus: string,
    invitationStatus: string,
    userAssignedRolesId: any[]
}

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
    loanDate: string
}

interface LoanProduct {
    refId: string;
    name: string;
    interestRate: number;
    requiredGuarantors: number;
}

export type storeState = {
    user: AuthData | null;
    member: MemberData | null;
    loanRequests: LoanRequestData[] | null;
    loanRequest: LoanRequest | null;
    loanProducts: LoanProduct[] | null;
    loanProduct: LoanProduct | null;
    isLoggedIn: boolean;
    loading: boolean;
    isJWT: boolean | string;
    otpSent: boolean;
}

const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export const checkForJWT = createAsyncThunk('checkForJWT', async () => {
    return await getSecureKey('jwt')
})

export const loginUser = createAsyncThunk('loginUser', async ({ phoneNumber, pin, tenant = 't72767' }: Pick<loginUserType, "phoneNumber" | "pin" | "tenant">) => {
    return new Promise(async (resolve, reject) => {
        const details: any = {
            phoneNumber: phoneNumber,
            ussdpin: pin,
            client_id: 'direct-access',
            client_secret: '238c4949-4c0a-4ef2-a3de-fa39bae8d9ce',
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
        const response = await fetch(`https://iam.presta.co.ke/auth/realms/${tenant}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: formBody
        })

       // console.log("login response status", response.status)

        if (response.status === 401) {
            reject("Incorrect phone number or password")
        }

        if (response.status === 200) {
            const data = await response.json();
            const result: any = await saveKeys(data)
            // console.log('log in data', data)
            resolve(result)
        }
    })
})

export const logoutUser = createAsyncThunk('logoutUser', async () => {
    return await deleteSecureKey('jwt')
})

export const sendOTP = createAsyncThunk('sendOTP', async (phoneNumber: string) => {
    // console.log("sending OTP", phoneNumber)
    return Promise.resolve(true)
})

export const verifyOTP = createAsyncThunk('verifyOTP', async (OTP: string) => {
    return Promise.resolve(true)
})

export const setLoading = createAsyncThunk('setLoading', async (loading: boolean) => {
    return Promise.resolve(loading)
})

const saveKeys = async ({ access_token, expires_in, refresh_expires_in, refresh_token }: any) => {
    // console.log("got JWTS", expires_in, refresh_expires_in)
    await saveSecureKey('jwt', access_token)
    await saveSecureKey('jwtRefresh', refresh_token)
    return Promise.resolve(true)
}

export const authenticate = createAsyncThunk('authenticate', async () => {
    return new Promise(async (resolve, reject) => {
       try {
           const key = await getSecureKey('jwt')
           let phoneNumber
           if (!key) {
               // console.log("key not available")
               reject("You are not authenticated")
           } else {
               // console.log("authenticating....")
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
                   const { phoneNumber }: { phoneNumber?: string } = JSON.parse(output)
                   resolve({
                       ...data,
                       phoneNumber
                   })
               }

           } else {
               reject("Authentication Failed")
           }
       } catch (e: any) {
           reject(e.message)
       }
    })
})

export const fetchMember = createAsyncThunk('fetchMember', async (phoneNumber: string) => {
    return new Promise(async (resolve, reject) => {
       try {
           const key = await getSecureKey('jwt')
           if (!key) {
               // console.log("key not available")
               reject("You are not authenticated")
           } else {
               // console.log("fetching member....")
           }
           const myHeaders = new Headers();
           myHeaders.append("Authorization", `Bearer ${key}`)
           const response = await fetch(`https://eguarantorship-api.presta.co.ke/api/v1/members/search/by-phone?phoneNumber=${phoneNumber}`, {
               method: 'GET',
               headers: myHeaders,
               redirect: 'follow'
           })
           // console.log(`https://eguarantorship-api.presta.co.ke/api/v1/members/search/by-phone?phoneNumber=${phoneNumber}`, response.status)
           if (response.status === 200) {
               const data = await response.json()
               resolve(data)
           } else {
               reject("Fetch Member Failed")
           }
       } catch (e: any) {
           reject(e.message)
       }
    })
})

export const fetchLoanRequests = createAsyncThunk('fetchLoanRequests', async (memberRefId: string) => {
    const url = `https://eguarantorship-api.presta.co.ke/api/v1/loan-request?memberRefId=${memberRefId}`
    return new Promise(async (resolve, reject) => {
        try {
            const key = await getSecureKey('jwt')
            if (!key) {
                // console.log("key not available")
                reject("You are not authenticated")
            } else {
                // console.log("fetching loan requests....")
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
                        // console.log("guarantor list", data0.guarantorList)
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
                    }
                }))
                resolve(result)
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
            const key = await getSecureKey('jwt')
            if (!key) {
                // console.log("key not available")
                reject("You are not authenticated")
            } else {
                // console.log("fetching loan request....")
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
                resolve(data)
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
            const key = await getSecureKey('jwt')
            if (!key) {
                // console.log("key not available")
                reject("You are not authenticated")
            } else {
                // console.log("fetching loan products....")
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
            } else {
                reject("fetch loan products failed")
            }
        } catch (e: any) {
            reject(e.message)
        }
    })
})

const authSlice = createSlice({
    name: 'auth',
    initialState: <storeState>{
        user: null,
        member: null,
        isLoggedIn: false,
        loading: false,
        isJWT: false,
        otpSent: false,
        loanRequests: null,
        loanRequest: null,
    },
    reducers: {
        createLoanProduct(state, action) {
            state.loanProduct = action.payload
            return state
        }
    },
    extraReducers: builder => {
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

        builder.addCase(loginUser.pending, state => {
            state.loading = true
        })
        builder.addCase(loginUser.fulfilled, (state,action) => {
            // console.log('loginUser.fulfilled', action.payload)
            state.isLoggedIn = true
            state.loading = false
        })
        builder.addCase(loginUser.rejected, (state, error) => {
            // console.log("loginUser.rejected", error)
            state.isJWT = false
            state.isLoggedIn = false
            state.loading = false
        })

        builder.addCase(authenticate.pending, state => {
            state.loading = true
        })
        builder.addCase(authenticate.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.user = payload
            state.isLoggedIn = true
            state.loading = false
        })
        builder.addCase(authenticate.rejected, state => {
            state.isJWT = false
            state.loading = false
        })

        builder.addCase(fetchMember.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchMember.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            // console.log('fetchMember.fulfilled', payload)
            state.member = payload
            state.loading = false
        })
        builder.addCase(fetchMember.rejected, state => {
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

        builder.addCase(sendOTP.pending, state => {
            state.loading = true
        })
        builder.addCase(sendOTP.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.otpSent = true
            state.loading = false
        })
        builder.addCase(sendOTP.rejected, state => {
            state.loading = false
        })

        builder.addCase(logoutUser.pending, state => {
            state.loading = true
        })
        builder.addCase(logoutUser.fulfilled, (state, action) => {
            // console.log('logout fulfilled', action)
            state.isLoggedIn = false
            state.isJWT = false
            state.loading = false
        })
        builder.addCase(logoutUser.rejected, state => {
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
export const { createLoanProduct } = actions
// Export the reducer, either as a default or named export
export default reducer
