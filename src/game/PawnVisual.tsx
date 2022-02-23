import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    ImageSourcePropType,
    StyleSheet,
    View,
} from 'react-native';
import { PawnVariant } from '../types/types';

const baseImage = require('./assets/pawn_base.png');
const durabilityImageMap: { [key: number]: ImageSourcePropType } = {
    1: require('./assets/pawn_1.png'),
    2: require('./assets/pawn_2.png'),
    3: require('./assets/pawn_3.png'),
    4: require('./assets/pawn_4.png'),
    5: require('./assets/pawn_5.png'),
};

interface Props {
    variant: PawnVariant
    durability: number
}

const PawnVisual = ({ variant, durability }: Props) => {
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
    const displayedDurability = Math.min(5, Math.max(1, durability));

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
            <Image source={baseImage} style={{
                ...styles.imageBasics,
                tintColor: theme.colors.text,
            }} />
            <Image source={durabilityImageMap[displayedDurability]} style={{
                ...styles.imageBasics,
                tintColor: '#73956F'
            }} />
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