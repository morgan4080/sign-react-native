import {RefreshControl, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
interface ComponentProps extends React.ComponentPropsWithoutRef<any>{
    segmentedButtons?: React.ReactNode | null;
    customStyles?: {};
    cb?: () => void;
}
const Container = ({segmentedButtons, customStyles = {}, cb = () => console.log("callback"), ...children}: ComponentProps) => {
    const [refreshing, setRefreshing] = useState(false);
    return (
        <SafeAreaView style={[styles.container, customStyles]}>
            {segmentedButtons ? <View style={{width: "100%"}}>
                {segmentedButtons}
            </View> : null}
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={cb} />
                }
                contentContainerStyle={styles.scrollView}
                {...children}
            />
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