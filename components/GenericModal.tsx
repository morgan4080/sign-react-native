import React, {Dispatch, useState} from 'react';
import {Modal, StyleSheet, Text, Pressable, View} from 'react-native';
import {Raleway_600SemiBold, Raleway_400Regular, useFonts as useRale} from "@expo-google-fonts/raleway";
interface ComponentProps {
    modalVisible: boolean;
    setModalVisible: Dispatch<any>
    title: string;
    description: string;
    cb: () => void
}
const GenericModal = ({modalVisible, setModalVisible, title, description, cb}: ComponentProps) => {
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
                        <Text style={[styles.modalText, {fontFamily: "Raleway_600SemiBold"}]}>{title}</Text>
                        <Text style={styles.modalText}>{description}</Text>
                        <View style={{display: "flex", flexDirection: "row"}}>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}>
                                <Text style={styles.textStyle}>Dismiss</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.button, styles.buttonProceed]}
                                onPress={() => {
                                    cb()
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