import { StyleSheet, View, FlatList, Animated } from 'react-native'
import { useState, useRef } from 'react'

import OnboardingItem from './OnboardingItem'
import slides from '../onboardingslides'
import Paginator from './Paginator'


const Onboarding = () => {

    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null)


    const viewableItemsChanged = useRef(({ viewableItems }: {viewableItems: any}) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    return (
        <View style={styles.container}>
            <View style={{ flex:0.8 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item}/>}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: {contentOffset: { x: scrollX}}}], {
                        useNativeDriver: false
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    ref={slidesRef}
                />
            </View>

            <Paginator data={slides} scrollX={scrollX}/>

        </View>

    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11
    }
})


export default Onboarding
