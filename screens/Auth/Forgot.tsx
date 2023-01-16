import {Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, TextInput} from 'react-native';

import { useFonts, Poppins_900Black, Poppins_800ExtraBold, Poppins_600SemiBold, Poppins_500Medium, Poppins_400Regular, Poppins_300Light} from '@expo-google-fonts/poppins';

import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Controller, useForm} from "react-hook-form";

type NavigationProps = NativeStackScreenProps<any>

type FormData = {
    phoneNumber: string | undefined;
}

export default function Forgot({ navigation }: NavigationProps) {
    let [fontsLoaded] = useFonts({
        Poppins_900Black,
        Poppins_500Medium,
        Poppins_800ExtraBold,
        Poppins_600SemiBold,
        Poppins_400Regular,
        Poppins_300Light
    });

    const onSubmit = (value: any): void => {
        if (value) {
            // make redux action to reset pin
            // once reset navigate to login page
            console.log(value)
        } else {
            console.log("no data")
        }
    };
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            phoneNumber: '',
        }
    })

    return (
        <View style={styles.container}>
            <Text allowFontScaling={false} style={styles.titleText}>Reset your pin</Text>
            <Controller
                control={control}
                rules={{
                    required: true,
                    maxLength: 12,
                }}
                render={( { field: { onChange, onBlur, value } }) => (
                    <TextInput
                        allowFontScaling={false}
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
                name="phoneNumber"
            />
            {errors.phoneNumber && <Text  allowFontScaling={false} >This field is required</Text>}
            <TouchableHighlight style={styles.button} onPress={handleSubmit(onSubmit)} underlayColor='#99d9f4'>
                <Text allowFontScaling={false} style={styles.buttonText}>Reset Pin</Text>
            </TouchableHighlight>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text allowFontScaling={false} style={styles.linkText}>Back to login</Text></TouchableOpacity>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        marginTop: 50,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    buttonText: {
        fontSize: 15,
        color: 'white',
        alignSelf: 'center',
        fontFamily: 'Poppins_500Medium',
    },
    button: {
        backgroundColor: '#3D889A',
        borderColor: 'rgba(48,92,103,0.75)',
        elevation: 3,
        borderWidth: 1,
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 25,
        marginBottom: 10,
        marginTop: 20,
        alignSelf: 'stretch',
        justifyContent: 'center'
    },
    titleText: {
        fontSize: 20,
        color: '#3c3c3c',
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 30,
    },
    linkText: {
        fontSize: 14,
        color: '#3D889A',
        alignSelf: 'flex-start',
        fontFamily: 'Poppins_400Regular',
        marginBottom: 10,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 20,
        height: 60,
        marginBottom: 30,
        paddingHorizontal: 20,
        fontSize: 14
    }
});
