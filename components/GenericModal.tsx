import React, {Dispatch, useState} from 'react';
import {Modal, StyleSheet, Text, Pressable, View, useWindowDimensions, TouchableOpacity} from 'react-native';
import {Raleway_600SemiBold, Raleway_400Regular, useFonts as useRale} from "@expo-google-fonts/raleway";
import {ErrorsType} from "../screens/Loans/LoanConfirmation";
interface ComponentProps {
    modalVisible: boolean;
    setModalVisible: Dispatch<any>
    title: string;
    description: string;
    lrErrors?: ErrorsType;
    cb: (option?: {context: string; option?: {name: string, value: string}}) => void;
    options?: {name: string, value: string}[] | null;
}
const GenericModal = ({modalVisible, setModalVisible, title, description, lrErrors, cb, options = null}: ComponentProps) => {
    const {width, height} = useWindowDimensions()
    useRale({
        Raleway_600SemiBold,
        Raleway_400Regular
    })
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalText, {fontFamily: "Raleway_600SemiBold", textTransform: "uppercase" }]}>{title}</Text>
                        {description !== "" ? <Text style={styles.modalText}>{description}</Text> : null}
                        {
                            lrErrors && lrErrors.map((err) => (
                                <Text style={styles.modalText}>{err.code}: {err.message}</Text>
                            ))
                        }
                        <View style={{display: "flex", flexDirection: "column", width: width * 0.5, marginBottom: 20}}>
                            {
                                options && options.map((option, index) => (
                                    <TouchableOpacity key={index} style={styles.options} onPress={() => {
                                        cb({context: 'option', option});
                                        setModalVisible(!modalVisible);
                                    }}>
                                        <Text style={{fontFamily: 'Raleway_600SemiBold', fontSize: 14}}>{option.name}</Text>
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                        <View style={{display: "flex", flexDirection: "row"}}>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    cb({context: 'dismiss'})
                                    setModalVisible(!modalVisible)
                                }}>
                                <Text style={styles.textStyle}>Dismiss</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonProceed]}
                                onPress={() => {
                                    cb({context: 'proceed'})
                                    setModalVisible(!modalVisible)
                                }}>
                                <Text style={styles.textStyle}>Proceed</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    options: {width: "100%", borderRadius: 12, borderColor: 'rgba(204,204,204,0.54)', borderWidth: 1, padding: 10, marginBottom: 10},
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        paddingVertical: 10,
        elevation: 2,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        fontFamily: "Raleway_600SemiBold"
    },
    buttonClose: {
        backgroundColor: '#ff4a4a',
    },
    buttonProceed: {
        backgroundColor: '#0082A0',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: "Raleway_400Regular"
    },
});

export default GenericModal;