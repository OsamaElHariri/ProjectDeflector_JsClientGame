import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    View,
} from 'react-native';
import { PawnVariant } from '../types/types';

const baseImage = require('./assets/pawn_base.png');

const durabilityImages = [
    require('./assets/pawn_1.png'),
    require('./assets/pawn_2.png'),
    require('./assets/pawn_3.png'),
    require('./assets/pawn_4.png'),
    require('./assets/pawn_5.png'),
];

// The durability is an animated value so that it can be changed exactly when the ball hits it (in the animation chain of in the GameGrid).
// Otherwise, the visual update of the pawn and the time when the ball hits it will not be in sync
interface Props {
    variant: PawnVariant
    durability: Animated.Value
    color: string
}

const PawnVisual = ({ variant, durability, color }: Props) => {
    const theme = useTheme();
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(
            rotateAnim,
            {
                toValue: variant === 'SLASH' ? 1 : 0,
                duration: 500,
                easing: Easing.in(Easing.elastic(3)),
                useNativeDriver: true
            }
        ).start();
    }, [rotateAnim, variant]);

    const images = durabilityImages.map((img, i) => {
        const animatedDurability = durability.interpolate({
            inputRange: [i + 0.99, i + 1, i + 1.01],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp'
        })

        return <Animated.Image key={`img_${i}`} source={img} style={{
            ...styles.imageBasics,
            opacity: animatedDurability,
            tintColor: color
        }} />
    })

    if (variant === '') {
        return <View></View>;
    }

    return (
        <Animated.View style={{
            width: '100%',
            height: '100%',
            transform: [{
                rotateZ: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-45deg', '45deg']
                })
            }]
        }}>
            <Animated.Image source={baseImage} style={{
                ...styles.imageBasics,
                tintColor: theme.colors.text,
                opacity: durability.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                    extrapolate: 'clamp'
                })
            }} />
            {images}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    imageBasics: {
        position: 'absolute',
        resizeMode: 'contain',
        width: '100%',
        height: '100%',
    },
});

export default PawnVisual;