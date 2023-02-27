import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import React, {useEffect, useRef} from "react";
interface ComponentProps extends React.ComponentPropsWithoutRef<any>{
    segmentedButtons?: React.ReactNode | null
}
const Container = ({segmentedButtons, ...children}: ComponentProps) => {
    return (
        <SafeAreaView style={styles.container}>
            {segmentedButtons ? <View style={{width: "100%"}}>
                {segmentedButtons}
            </View> : null}
            <ScrollView contentContainerStyle={styles.scrollView} {...children} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative"
    },
    scrollView: {
        paddingHorizontal: 16
    }
})

export default Container