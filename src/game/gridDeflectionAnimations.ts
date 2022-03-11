import { Animated, Easing } from "react-native";
import { BALL_DIAMETER } from "../constants";
import { Deflection } from "./types";


interface deflectionAnimParams {
    deflections: Deflection[]
    ballScaleAnim: Animated.ValueXY
    ballPosAnim: Animated.ValueXY
    durabilityAnims: { [key: string]: Animated.Value }
    pawnPosAnims: { [key: string]: Animated.ValueXY }
    pawnScaleAnim: { [key: string]: Animated.Value }
}

export function getDeflectionAnimations({
    deflections,
    ballScaleAnim,
    ballPosAnim,
    durabilityAnims,
    pawnPosAnims,
    pawnScaleAnim,
}: deflectionAnimParams): Animated.CompositeAnimation {
    const fixedTimePerCell = 150;

    const anims = deflections.map((deflection, i) => {
        if (i === 0) {
            return Animated.timing(
                ballScaleAnim,
                {
                    toValue: 1,
                    easing: Easing.elastic(1),
                    duration: 50,
                    useNativeDriver: true,
                }
            );
        }

        const previousDeflection = deflections[i - 1];

        const xDistance = Math.abs(previousDeflection.position.x - deflection.position.x);
        const yDistance = Math.abs(previousDeflection.position.y - deflection.position.y);
        const distance = xDistance + yDistance;

        const timePerCell = fixedTimePerCell - (5 * i)
        const time = distance * Math.max(timePerCell, 50);

        const anims = [
            Animated.timing(
                ballPosAnim,
                {
                    toValue: deflection.position,
                    duration: time,
                    easing: Easing.in(Easing.linear),
                    useNativeDriver: true
                }
            )
        ];

        const previousKey = `cell_${previousDeflection.position.y}_${previousDeflection.position.x}`;
        const setDurability = previousDeflection.events.find(evt => evt.name === 'SET_DURABILITY');
        if (durabilityAnims[previousKey] && setDurability) {
            const durabilityAnim = Animated.timing(
                durabilityAnims[previousKey],
                {
                    toValue: setDurability.durability,
                    duration: 5,
                    useNativeDriver: true
                }
            );
            anims.push(durabilityAnim);
        }

        const ballSquash = Animated.sequence([
            Animated.timing(
                ballScaleAnim,
                {
                    toValue: xDistance > yDistance ? { x: 1.2, y: 0.5 } : { x: 0.5, y: 1.2 },
                    duration: time * 0.8,
                    easing: Easing.bounce,
                    useNativeDriver: true,
                }
            ),
            Animated.timing(
                ballScaleAnim,
                {
                    toValue: 0.8,
                    duration: time * 0.2,
                    easing: Easing.bounce,
                    useNativeDriver: true,
                }
            ),
        ]);

        if (i < deflections.length - 1) {
            anims.push(ballSquash);
        } else {
            anims.push(Animated.timing(
                ballScaleAnim,
                {
                    toValue: 0,
                    delay: time - fixedTimePerCell,
                    easing: Easing.linear,
                    duration: fixedTimePerCell,
                    useNativeDriver: true,
                }
            ));
        }

        if (pawnScaleAnim[previousKey]) {
            const pawnHitAnim = Animated.sequence([
                Animated.timing(
                    pawnScaleAnim[previousKey],
                    {
                        toValue: 1.2,
                        duration: timePerCell / 2,
                        easing: Easing.elastic(2),
                        useNativeDriver: true
                    }
                ),
                Animated.timing(
                    pawnScaleAnim[previousKey],
                    {
                        toValue: 1,
                        duration: timePerCell / 2,
                        easing: Easing.out(Easing.linear),
                        useNativeDriver: true
                    }
                )
            ]);
            anims.push(pawnHitAnim);
        }

        const key = `cell_${deflection.position.y}_${deflection.position.x}`;
        const toPosition = { x: 0, y: 0 };

        const visualOffset = BALL_DIAMETER * 0.6;
        if (previousDeflection.toDirection === 'UP') {
            toPosition.y += visualOffset;
        } else if (previousDeflection.toDirection === 'DOWN') {
            toPosition.y -= visualOffset;
        } else if (previousDeflection.toDirection === 'LEFT') {
            toPosition.x -= visualOffset;
        } else if (previousDeflection.toDirection === 'RIGHT') {
            toPosition.x += visualOffset;
        }

        if (pawnPosAnims[key]) {
            const pawnOffsetAnim = Animated.timing(
                pawnPosAnims[key],
                {
                    toValue: toPosition,
                    duration: timePerCell * 0.25,
                    delay: time - timePerCell * 0.25,
                    easing: Easing.out(Easing.linear),
                    useNativeDriver: true
                }
            );
            anims.push(pawnOffsetAnim);
        }

        if (pawnPosAnims[previousKey]) {
            const pawnToOriginalAnim = Animated.timing(
                pawnPosAnims[previousKey],
                {
                    toValue: 0,
                    duration: timePerCell,
                    easing: Easing.elastic(1),
                    useNativeDriver: true
                }
            );
            anims.push(pawnToOriginalAnim);
        }


        return Animated.parallel(anims, { stopTogether: false });
    });

    return Animated.sequence(anims);
}