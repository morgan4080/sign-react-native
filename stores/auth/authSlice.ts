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
}

export type storeState = {
    user: AuthData | null;
    isLoggedIn: boolean;
    loading: boolean;
    isJWT: boolean | string;
    otpSent: boolean;
}

export const checkForJWT = createAsyncThunk('checkForJWT', async () => {
    return await getSecureKey('jwt')
})

export const setLoading = createAsyncThunk('setLoading', async (loading: boolean) => {
    return Promise.resolve(loading)
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

        console.log("login response status", response.status)

        if (response.status === 401) {
            reject("Incorrect phone number or password")
        }

        if (response.status === 200) {
            const data = await response.json();
            const result: any = await saveKeys(data)
            resolve(result)
        }
    })
})

const saveKeys = async ({ access_token, expires_in, refresh_expires_in, refresh_token }: any) => {
    console.log("got JWTS", expires_in, refresh_expires_in)
    await saveSecureKey('jwt', access_token)
    await saveSecureKey('jwtRefresh', refresh_token)
    return Promise.resolve(true)
}

export const authenticate = createAsyncThunk('authenticate', async () => {
    return new Promise(async (resolve, reject) => {
       try {
           const key = await getSecureKey('jwt')
           if (!key) {
               console.log("key not available")
               reject("You are not authenticated")
           } else {
               console.log("authenticating....")
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
               resolve(data)
           } else {
               reject("Authentication Failed")
           }
       } catch (e: any) {
           reject(e.message)
       }
    })
})

export const logoutUser = createAsyncThunk('logoutUser', async () => {
    return await deleteSecureKey('jwt')
})

export const sendOTP = createAsyncThunk('sendOTP', async (phoneNumber: string) => {
    console.log("sending OTP", phoneNumber)
    return Promise.resolve(true)
})

export const verifyOTP = createAsyncThunk('verifyOTP', async (OTP: string) => {
    return Promise.resolve(true)
})

const authSlice = createSlice({
    name: 'auth',
    initialState: <storeState>{
        user: null,
        isLoggedIn: false,
        loading: false,
        isJWT: false,
        otpSent: false,
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(checkForJWT.pending, state => {
            state.loading = true
        })
        builder.addCase(checkForJWT.fulfilled, (state, action) => {
            state.isJWT = !!action.payload
            state.loading = false
        })
        builder.addCase(checkForJWT.rejected, (state) => {
            state.loading = false
        })


        builder.addCase(loginUser.pending, state => {
            state.loading = true
        })
        builder.addCase(loginUser.fulfilled, (state,action) => {
            console.log('loginUser.fulfilled', action.payload)
            state.loading = false
        })
        builder.addCase(loginUser.rejected, (state, error) => {
            console.log("loginUser.rejected", error)
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
            console.log('logout fulfilled', action)
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

export default authSlice.reducer
