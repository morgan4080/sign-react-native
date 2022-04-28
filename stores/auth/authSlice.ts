import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getSecureKey, saveSecureKey} from '../../utils/secureStore'

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
    keycloakId: string,
    username: string,
    phoneNumber: string,
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    companyName: string,
}

export type storeState = {
    user: AuthData | null;
    isLoggedIn: boolean;
    loading: boolean;
    isJWT: boolean | string;
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

        console.log("login response status", response.status)

        if (response.status === 200) {
            resolve(await response.json())
        } else {
            reject(await response.json())
        }
    })
})

export const authenticate = createAsyncThunk('authenticate', async () => {
    return new Promise(async (resolve, reject) => {
        const key = await getSecureKey('jwt')
        if (!key) {
            reject("You are not authenticated")
        }
        const response = await fetch(`https://accounts.presta.co.ke/authenticate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            }
        })
        if (response.status === 200) {
            resolve(await response.json())
        } else {
            reject(await response.json())
        }
    })
})

export const logoutUser = createAsyncThunk('logoutUser', async () => {
    return await saveSecureKey('jwt', null)
})

const authSlice = createSlice({
    name: 'auth',
    initialState: <storeState>{
        user: null,
        isLoggedIn: false,
        loading: false,
        isJWT: false
    },
    reducers: {},
    extraReducers: builder => {
        builder.addCase(checkForJWT.pending, state => {
            state.loading = true
        })
        builder.addCase(checkForJWT.fulfilled, (state, action) => {
            console.log("updating isJWT")
            state.isJWT = action.payload
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
            state.loading = true
        })
        builder.addCase(loginUser.rejected, (state, error) => {
            console.log("loginUser.rejected", error)
            state.loading = false
        })





        builder.addCase(authenticate.pending, state => {
            state.loading = true
        })
        builder.addCase(authenticate.fulfilled, (state, { payload }: Pick<AuthData, any>) => {
            state.user = payload
            // if payload provides a user set the user and change logged in state to true
            state.loading = false
        })
        builder.addCase(authenticate.rejected, state => {
            state.loading = false
        })





        builder.addCase(logoutUser.pending, state => {
            state.loading = true
        })
        builder.addCase(logoutUser.fulfilled, (state, action) => {
            console.log('logoutUser.fulfilled', action.payload)
            state.isLoggedIn = false
            state.loading = false
        })
        builder.addCase(logoutUser.rejected, state => {
            state.loading = false
        })
    }
})

export default authSlice.reducer
