import {Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableWithoutFeedback} from "react-native";
import React, {useEffect, useRef} from "react";
export interface ComponentProps extends React.ComponentPropsWithoutRef<any> {}
const Container = ({...children}: ComponentProps) => {
    return (
        <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollView} {...children} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        paddingHorizontal: 16
    }
})

export default Container