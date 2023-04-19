import {KeyboardTypeOptions, StyleSheet, Text, TextInput, View, Dimensions, TouchableOpacity} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from "react-native-reanimated";
import {Controller, FieldError} from "react-hook-form";
import {useFonts,Poppins_500Medium, Poppins_300Light} from "@expo-google-fonts/poppins";
import {useFonts as useRale, Raleway_600SemiBold, Raleway_500Medium} from "@expo-google-fonts/raleway";
import React, {useEffect, useRef, useState} from "react";
import {Control, UseFormWatch} from "react-hook-form/dist/types/form";
import GenericModal from "./GenericModal";
import {Ionicons} from "@expo/vector-icons";
const { width } = Dimensions.get("window");
interface FProps<T> {
    label: string;
    field: any;
    val: (field: string) => string | undefined;
    setVal?: (field: string, data: any) => void;
    watch: UseFormWatch<any>;
    control: Control<any>;
    required?: boolean;
    rules?: Record<any, any>;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
    error: FieldError | undefined;
    options?: {name: string, value: string, selected: boolean}[] | null;
    cb?: (e: any) => void;
}
const TextField = <T extends object>(
    {
        label,
        field,
        val,
        setVal,
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
        secureTextEntry = false,
        options = null,
        cb
    }: FProps<T>
) => {
    const moveText = useSharedValue(0);

    const [localOptions, setLocalOptions] = useState(options)

    const animStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(moveText.value, [0, 1], [1, 0.8])
                },
                {
                    translateY: interpolate(moveText.value, [0, 1], [4, -10])
                }
            ],
        };
    });

    const moveTextTop = () => {
        moveText.value = withDelay(
            0,
            withRepeat(
                withTiming(1, {
                    duration: 200,
                }),
                1,
                false
            )
        );
    }

    const moveTextBottom = () => {
        moveText.value = withDelay(
            0,
            withRepeat(
                withTiming(0, {
                    duration: 200,
                }),
                1,
                false
            )
        );
    }

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

    useFonts({
        Poppins_500Medium,
        Poppins_300Light
    })

    useRale({
        Raleway_600SemiBold,
        Raleway_500Medium
    })

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditable, setIsEditable] = useState(true);

    const onFocusHandler = () => {
        if (field === 'disbursement_mode') {
            setModalVisible(true);
            setIsEditable(false);
            return;
        }
        if (field === 'repayment_mode') {
            setModalVisible(true);
            setIsEditable(false);
            return;
        }

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

    const input = useRef<TextInput | null>(null)

    return (
        <>
            <>
                <Controller
                    control={control}
                    rules={rules}
                    render={( {field: {onChange, onBlur, value}}) => (
                        <View style={[styles.inputContainer, styles.shadowProp, {marginTop: field === "searchTerm" ? 0 : 16,borderColor: error ? "#d53b39" : "#E7EAEB", borderBottomWidth: error ? 1 : 0 }]}>
                            <Animated.View style={[styles.animatedView, animStyle]}>
                                <TouchableOpacity style={styles.touchable} onPress={() => {
                                    if (localOptions) {
                                        setModalVisible(true);
                                        setIsEditable(false);
                                        return;
                                    }
                                    if (input.current) {
                                        input.current.focus()
                                    }
                                }}>
                                    <Text allowFontScaling={false} style={styles.label}>{label}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <TextInput
                                ref={input}
                                style={styles.input}
                                autoCapitalize={"none"}
                                allowFontScaling={false}
                                onFocus={onFocusHandler}
                                onBlur={onBlurHandler}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry={secureTextEntry}
                                keyboardType={keyboardType ? keyboardType : undefined}
                                editable={isEditable}
                                onSubmitEditing={(e) => {
                                    if (cb) {
                                        cb(e)
                                    }
                                }}
                            />
                            {
                                (localOptions) ? <TouchableOpacity style={{position: "absolute", right: 12}} onPress={() => {
                                    setModalVisible(true);
                                    setIsEditable(false);
                                }}>
                                    <Ionicons name="ios-caret-down-circle-outline" size={24} color="#0082A0"/>
                                </TouchableOpacity> : null
                            }
                        </View>
                    )}
                    name={field}
                />

                {error && error.message && field !== "searchTerm" ? <Text allowFontScaling={false} style={styles.error}>{`${error.message}`}</Text> : null}
            </>

            { (localOptions) ?

                <GenericModal modalVisible={modalVisible} setModalVisible={setModalVisible} title={`Set ${label}`} description={"Select option below"} cb={(option) => {
                    console.log("Callback running", option);

                    if (option && setVal && option?.context === 'option' && option?.option) {
                        setVal(field, option?.option.value);
                        const index = localOptions?.findIndex(op => op.value.toLowerCase() === option?.option?.value.toLowerCase())
                        setLocalOptions(localOptions?.map((op, i) => {
                            if (index === i) {
                                return {
                                    ...op,
                                    selected: true
                                }
                            } else {
                                return {
                                    ...op,
                                    selected: false
                                }
                            }
                        }))
                    }
                    setIsEditable(true);
                }} options={localOptions}/> : null
            }
        </>
    )
}

const styles = StyleSheet.create({
    label: {
        position: 'absolute',
        left: width * 0.03,
        fontSize: 14,
        color: '#0082A0',
        fontFamily: 'Raleway_600SemiBold',
        lineHeight: 16
    },

    touchable: {
      position: "absolute"
    },

    animatedView: {
        position: "absolute",
        top: 15,
        paddingHorizontal: 14,
        zIndex: 1
    },
    input: {
        letterSpacing: 0.4,
        fontSize: 14,
        color: '#393a34',
        lineHeight: 18,
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
        shadowOpacity: 0.008,
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