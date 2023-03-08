import {Animated, KeyboardTypeOptions, StyleSheet, Text, TextInput, View} from "react-native";
import {Controller, FieldError} from "react-hook-form";
import {useFonts,Poppins_500Medium, Poppins_300Light} from "@expo-google-fonts/poppins";
import {useFonts as useRale, Raleway_600SemiBold} from "@expo-google-fonts/raleway";
import {useEffect, useRef} from "react";
import {Control, UseFormWatch} from "react-hook-form/dist/types/form";

interface FProps<T> {
    label: string;
    field: any;
    val: (field: string) => string | undefined;
    watch: UseFormWatch<Record<string, any>>;
    control: Control<any>;
    required?: boolean;
    rules?: Record<any, any>;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
    error: FieldError | undefined
}
const TextField = <T extends object>(
    {
        label,
        field,
        val,
        watch,
        control,
        error,
        required = false,
        rules = {
            required: {
                value: required,
                message: label + " is required"
            }
        },
        keyboardType = "default",
        secureTextEntry = false
    }: FProps<T>
) => {
    const moveText = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            switch (name) {
                case field:
                    if (value.field !== "") {
                        moveTextTop();
                    } else if (value.field === "" || value.field === undefined) {
                        moveTextBottom();
                    }
                    break;
            }
        });
        return () => subscription.unsubscribe();
    }, [watch])

    const moveTextTop = () => {
        Animated.timing(moveText, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const moveTextBottom = () => {
        Animated.timing(moveText, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const yVal = moveText.interpolate({
        inputRange: [0, 1],
        outputRange: [4, -10],
    });

    const xVal = moveText.interpolate({
        inputRange: [0, 3],
        outputRange: [0, -10],
    });

    const scaleValX = moveText.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.9],
    });

    const scaleValY = moveText.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
    });

    const animStyle = {
        transform: [
            {
                translateY: yVal
            },
            {
                translateX: xVal
            },
            {
                scaleX: scaleValX
            },
            {
                scaleY: scaleValY
            },
        ],
    };

    useFonts({
        Poppins_500Medium,
        Poppins_300Light
    })

    useRale({
        Raleway_600SemiBold
    })

    const onFocusHandler = () => {
        if (val(field) !== "") {
            moveTextTop();
        }
    };

    const onBlurHandler = () => {
        if (val(field) === "" || val(field) === undefined) {
            moveTextBottom();
        }
    };

    if (val(field) !== "" && val(field) !== undefined) {
        moveTextTop();
    } else {
        moveTextBottom();
    }

    console.log("text input error:", error)

    return (
        <>
            <Controller
                control={control}
                rules={rules}
                render={( {field: {onChange, onBlur, value}}) => (
                    <View style={[styles.inputContainer, styles.shadowProp, {borderColor: error ? "#d53b39" : "#E7EAEB", borderBottomWidth: error ? 1 : 0 }]}>
                        <Animated.View style={[styles.animatedView, animStyle]}>
                            <Text allowFontScaling={false} style={styles.label}>
                                {label}
                            </Text>
                        </Animated.View>
                        <TextInput
                            style={styles.input}
                            autoCapitalize={"none"}
                            allowFontScaling={false}
                            onFocus={onFocusHandler}
                            onBlur={onBlurHandler}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry={secureTextEntry}
                            keyboardType={keyboardType ? keyboardType : undefined}
                        />
                    </View>
                )}
                name={field}
            />

            {error && error.message ? <Text allowFontScaling={false} style={styles.error}>{`${error.message}`}</Text> : null}
        </>
    )
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: '#0082A0',
        fontFamily: 'Raleway_600SemiBold',
        lineHeight: 16,
        // textTransform: "capitalize"
    },
    animatedView: {
        position: "absolute",
        top: 18,
        paddingHorizontal: 14,
        zIndex: 1
    },
    input: {
        letterSpacing: 0.4,
        fontSize: 14,
        color: '#000000',
        lineHeight: 16,
        paddingTop: 14,
        fontFamily: 'Poppins_500Medium'
    },
    inputContainer: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        backgroundColor: '#EFF3F4',
        borderRadius: 12,
        width: "100%",
        marginTop: 16,
        height: 56,
        paddingHorizontal: 14
    },
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    error: {
        fontSize: 10,
        color: '#d53b39',
        fontFamily: 'Poppins_300Light',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        marginTop: 5
    }
})

export default TextField