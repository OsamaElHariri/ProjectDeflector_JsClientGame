import { Animated, Easing } from "react-native";
import { Deflection } from "./types";


interface deflectionAnimParams {
    deflections: Deflection[]
    ballScaleAnim: Animated.ValueXY
    ballPosAnim: Animated.ValueXY
    animatedDurabilities: { [key: string]: Animated.Value }
    pawnScaleAnim: { [key: string]: Animated.Value }
}

export function getDeflectionAnimations({
    deflections,
    ballScaleAnim,
    ballPosAnim,
    animatedDurabilities,
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

        const key = `cell_${previousDeflection.position.y}_${previousDeflection.position.x}`;
        const setDurability = previousDeflection.events.find(evt => evt.name === 'SET_DURABILITY');
        if (animatedDurabilities[key] && setDurability) {
            const durabilityAnim = Animated.timing(
                animatedDurabilities[key],
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
                    toValue: xDistance > yDistance ? { x: 1.15, y: 0.55 } : { x: 0.55, y: 1.15 },
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

        if (pawnScaleAnim[key]) {
            const pawnHitAnim = Animated.sequence([
                Animated.timing(
                    pawnScaleAnim[key],
                    {
                        toValue: 1.2,
                        duration: timePerCell / 2,
                        easing: Easing.elastic(2),
                        useNativeDriver: true
                    }
                ),
                Animated.timing(
                    pawnScaleAnim[key],
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

        return Animated.parallel(anims, { stopTogether: false });
    });

    return Animated.sequence(anims);
}