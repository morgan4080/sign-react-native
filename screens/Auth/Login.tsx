import * as React from 'react';
import { Text, View, StyleSheet, TouchableHighlight } from 'react-native';
import AppLoading from 'expo-app-loading';
import t from 'tcomb-form-native';
import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';
import { useRef } from "react";
import useColorScheme from "../../hooks/useColorScheme";

const Form = t.form.Form;

const LoginForm = t.struct({
    email: t.String,
    password: t.String
})

const options = {
    fields: {
        email: {
            error: 'Use your organisations email address to login'
        },
        password: {
            error: 'Provide a password to proceed',
            password: true,
            secureTextEntry: true
        }
    }
}

export default function Login() {
    const colorScheme = useColorScheme();
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const theForm: any = useRef(null);

    const handleSubmit = (): void => {
        const value = theForm.current.getValue();
        if (value) {
            console.log(value);
        }
    };

    if (fontsLoaded) {
        return (
            <View style={styles.container}>
                <Form
                    ref={theForm}
                    type={LoginForm}
                    options={options}
                />

                <TouchableHighlight style={styles.button} onPress={() => handleSubmit()} underlayColor='#99d9f4'>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableHighlight>
            </View>
        )
    }  else {
        return (
            <AppLoading/>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    button: {
        height: 36,
        backgroundColor: '#48BBEC',
        borderColor: '#48BBEC',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'stretch',
        justifyContent: 'center'
    }
});
