import {Dimensions, StyleSheet, View, StatusBar, TouchableOpacity, Text} from 'react-native';
import React, {useCallback, useImperativeHandle} from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get("window");
import Animated, {
    Extrapolate,
    interpolate, runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const SCREEN_HEIGHT = height + (StatusBar.currentHeight ? StatusBar.currentHeight : 0);

export const MAX_TRANSLATE_Y = -SCREEN_HEIGHT/1.38;

type BottomSheetProps = {
    children?: React.ReactNode;
    setRequest?: (x: any) => any;
    setPressed?: (x: any) => any;
    pressed?: boolean;
};

export type BottomSheetRefProps = {
    scrollTo: (destination: number) => void;
    isActive: () => boolean;
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
    ({ children, setRequest, setPressed, pressed }, ref) => {
        const translateY = useSharedValue(0);
        const active = useSharedValue(false);

        const scrollTo = useCallback((destination: number) => {
            'worklet';
            active.value = destination !== 0;
            translateY.value = withSpring(destination, { damping: 50 });
        }, []);

        const isActive = useCallback(() => {
            return active.value;
        }, []);

        useImperativeHandle(ref, () => ({ scrollTo, isActive }), [
            scrollTo,
            isActive,
        ]);

        const context = useSharedValue({ y: 0 });

        const fadeAnim = useSharedValue(1);

        const gesture = Gesture.Pan()
            .onStart(() => {
                context.value = { y: translateY.value };
            })
            .onUpdate((event) => {
                translateY.value = event.translationY + context.value.y;
                translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
            })
            .onEnd(() => {
                if (translateY.value > -SCREEN_HEIGHT / 2) {
                    scrollTo(0);
                } else if (translateY.value < -SCREEN_HEIGHT/ 2) {
                    scrollTo(MAX_TRANSLATE_Y);
                }
            });

        const rBottomSheetStyle = useAnimatedStyle(() => {
            const borderRadius = interpolate(
                translateY.value,
                [MAX_TRANSLATE_Y + 50, MAX_TRANSLATE_Y],
                [25, 20],
                Extrapolate.CLAMP
            );

            return {
                borderRadius,
                transform: [{ translateY: translateY.value }],
            };
        });

        /*const fadeAnimStyle = useAnimatedStyle(() => {
            return {
                opacity: fadeAnim.value
            }
        })*/

        return (
            <GestureDetector gesture={gesture}>
                <>
                    {/*{
                        pressed &&
                        <Animated.View style={[{ position: 'absolute', height, width, backgroundColor: 'rgba(0,0,0,0.35)' }, fadeAnimStyle]}>
                            <TouchableOpacity onPress={() => {
                                if (setPressed) setPressed(false);
                                if (setRequest) setRequest(null);
                            }} style={{width: '100%',height: '100%'}}>
                                <Text></Text>
                            </TouchableOpacity>
                        </Animated.View>
                    }*/}
                    <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
                        <View style={styles.line} />
                        {children}
                    </Animated.View>
                </>
            </GestureDetector>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        borderRadius: 25,
        zIndex: 123,
        shadowColor: 'rgba(0,0,0,0.7)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, // IOS
        elevation: 5, // Android
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'rgba(141,141,141,0.24)',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
});

export default BottomSheet;
