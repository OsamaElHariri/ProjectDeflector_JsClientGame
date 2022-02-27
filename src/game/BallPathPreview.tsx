import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    View,
} from 'react-native';
import { useGameState } from './game_state_provider';
import { Direction } from './types';

interface LineProps {
    width: number
}

const Line = ({ width }: LineProps) => {
    const offseteAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(
                offseteAnim,
                {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.linear,
                    useNativeDriver: true
                }
            )
        ).start();
    }, [offseteAnim]);

    const dashWidth = 15;
    const dashSpace = 14;
    const dashHeight = 8;

    const dashCount = Math.ceil(width / (dashWidth + dashSpace));
    const dashes = Array(dashCount + 1).fill(undefined).map((_, i) => {
        return <View
            key={`dash_${i}`}
            style={{
                width: dashWidth,
                height: dashHeight,
                marginRight: dashSpace,
                backgroundColor: 'red',
                borderRadius: dashHeight
            }}>
        </View>
    });

    return <View style={{
        width: width,
        height: dashHeight,
        overflow: 'hidden',
        borderRadius: dashHeight,
        top: -dashHeight / 2,
        left: -width / 2,
        transform: [
            { translateX: width / 2 },
            { translateY: dashHeight / 2 }
        ]
    }}>
        <Animated.View style={{
            display: 'flex',
            flexDirection: 'row',
            transform: [{
                translateX: Animated.multiply(
                    Animated.subtract(1, offseteAnim),
                    -dashSpace - dashWidth
                )
            }]
        }}>
            {dashes}
        </Animated.View>
    </View>
}

interface Props {
    cellSize: number
}

const BallPathPreview = ({ cellSize }: Props) => {
    const { state: { deflectionPreview } } = useGameState();

    if (!deflectionPreview) {
        return <></>;
    }

    const getRotationDegrees = (direction: Direction) => {
        if (direction === 'UP') return '90deg';
        if (direction === 'DOWN') return '-90deg';
        if (direction === 'LEFT') return '180deg';
        if (direction === 'RIGHT') return '0deg';
        return '0deg';
    }

    const lines = deflectionPreview.map((deflection, i) => {
        if (i === deflectionPreview.length - 1) return undefined;

        const currentPos = deflection.position;
        const nextPos = deflectionPreview[i + 1].position;
        const width = Math.abs(nextPos.x - currentPos.x + nextPos.y - currentPos.y) * cellSize;

        return <View
            key={`line_${currentPos.x}_${currentPos.y}_${i}`}
            style={{
                width: 0,
                height: 0,
                left: cellSize / 2 + deflection.position.x * cellSize,
                top: cellSize / 2 + deflection.position.y * cellSize,
                transform: [
                    { rotateZ: getRotationDegrees(deflection.toDirection) },
                ],
            }}>
            <Line width={width} />
        </View>
    });

    return (
        <>
            {lines}
        </>
    );
};

export default BallPathPreview;