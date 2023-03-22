import React, { useState, useRef } from 'react';
import Animated, {
    Layout,
    SlideInDown,
    SlideOutDown,
    SlideOutUp,
} from 'react-native-reanimated';
import { Text, StyleSheet, TextInput, Pressable } from 'react-native';

const formatter = new Intl.NumberFormat('pt-BR');

const getKey = (formattedIndex: number, original: number) => {
    const formatted = formatter.format(original);
    console.log(formatted)
    // if a dot, do nothing
    if (formatted[formattedIndex] === '.') return `.-${formattedIndex}`;

    // find the index of the digit in the original number
    console.log('fi', formattedIndex)
    let index = 0;
    for (let i = 0; i < formattedIndex; i++) {
        if (formatted[i] === '.') continue;
        index++;
    }
    console.log('idx', index)
    return index;
};

export default function AnimatedInput() {
    const [amount, setAmount] = useState('');
    const inputRef = useRef<TextInput>(null);

    const formatted = formatter.format(+amount);
    const splitted = formatted.split('');

    const focus = () => {
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <Pressable style={styles.container} onPress={focus}>
            <Animated.View layout={Layout.springify()} style={styles.animatedLine}>
                <Text style={styles.symbol}>R$</Text>
                {splitted.map((char, idx) => (
                    <Animated.View
                        key={char + getKey(idx, +amount)}
                        layout={Layout.springify()}
                        entering={SlideInDown.damping(35).stiffness(400).springify()}
                        exiting={
                            idx === 0
                                ? SlideOutUp.duration(400).damping(35).stiffness(400)
                                : SlideOutDown.duration(400).damping(35).stiffness(400)
                        }>
                        <Text style={styles.text}>{char}</Text>
                    </Animated.View>
                ))}
            </Animated.View>
            <TextInput
                ref={inputRef}
                returnKeyType="done"
                selectionColor="black"
                keyboardType="number-pad"
                style={styles.input}
                onChangeText={setAmount}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    animatedLine: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        overflow: 'hidden',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbol: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 52,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        height: 0,
        width: '100%',
        borderRadius: 20,
        backgroundColor: 'black',
    },
});
