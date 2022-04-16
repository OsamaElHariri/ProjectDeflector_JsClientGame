import { useTheme } from '@react-navigation/native';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

import {
    Animated,
    Text,
    View,
} from 'react-native';
import { BehaviorSubject } from 'rxjs';
import { BALL_DIAMETER } from '../constants';
import { PreviewLine } from '../game/BallPathPreview';
import PawnVisual from '../game/PawnVisual';
import PlayerNameTag from '../game/PlayerNameTag';
import { usePlayer } from '../main_providers/player_provider';

const visualWidth = 140;


interface TutorialScreenSkeletonProps {
    title: string
    text1: string
    text2: string
    children: ReactNode
}
const TutorialScreenSkeleton = ({ title, text1, text2, children }: TutorialScreenSkeletonProps) => {
    const theme = useTheme();
    return <>
        <View>
            <Text style={{ fontSize: 28, color: theme.colors.text }}>
                {title}
            </Text>
        </View>

        <View style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>

            <View style={{ width: visualWidth, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                {children}
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, display: 'flex', marginLeft: 20 }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontSize: 18, color: theme.colors.text }}>
                            {text1}
                        </Text>
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontSize: 18, color: theme.colors.text }}>
                            {text2}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    </>
}

const ScoreBarTutorial = () => {
    const { player } = usePlayer();

    return <TutorialScreenSkeleton title='New here? These are the basics!' text1='These boxes are your score.' text2={`When filled, the boxes will flip.\nScore 1 more to win!`}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, borderRadius: 5, borderColor: player?.color, borderWidth: 4, marginBottom: 6 }} />
            <View style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: player?.color, marginBottom: 6 }} />
            <View style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: player?.color }} />
        </View>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
            <View style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
            <View style={{ width: 32, height: 32, borderRadius: 5, backgroundColor: player?.color, transform: [{ rotateZ: '45deg' }] }} />
        </View>
    </TutorialScreenSkeleton>
}

const PlacePawnsTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;

    return <TutorialScreenSkeleton title='Put Pieces' text1='You get -1 for each piece you put.' text2='You get +1 every turn.'>
        <View style={{ height: 100, width: 100 }}>
            <View style={{ borderWidth: 4, borderRadius: 10, borderColor: theme.colors.text }}>
                <PawnVisual durability={new Animated.Value(5)} variant={'SLASH'} color={player?.color}></PawnVisual>
            </View>
        </View>

        <View style={{ height: 100, width: 100 }}>
            <View style={{ borderWidth: 4, borderRadius: 10, borderColor: theme.colors.text }}>
                <PawnVisual durability={new Animated.Value(5)} variant={'BACKSLASH'} color={player?.color}></PawnVisual>
            </View>
        </View>
    </TutorialScreenSkeleton>
}

const DeflectBallTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;


    return <TutorialScreenSkeleton title='Score points' text1='Put pieces on the board.' text2={`Send the ball to your side\nto score points.`}>
        <View style={{ width: visualWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: BALL_DIAMETER,
                height: BALL_DIAMETER,
                borderRadius: 100,
                backgroundColor: theme.colors.text,
            }} />
            <View style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <View style={{ marginTop: visualWidth - 45, height: 100, width: 100 }}>
                    <View style={{ borderWidth: 4, borderRadius: 10, borderColor: theme.colors.text }}>
                        <PawnVisual durability={new Animated.Value(5)} variant={'SLASH'} color={player?.color}></PawnVisual>
                    </View>
                </View>

                <View style={{ position: 'absolute', transform: [{ rotateZ: '90deg' }, { translateX: visualWidth / 2 }, { translateY: 4 }] }}>
                    <PreviewLine color={player.color} width={visualWidth} isAnimated={false} />
                </View>

                <View style={{ position: 'absolute', transform: [{ translateX: visualWidth / 4 + 5 }, { translateY: visualWidth }] }}>
                    <PreviewLine color={player.color} width={visualWidth / 2} isAnimated={false} />
                </View>
            </View>
        </View>
    </TutorialScreenSkeleton>
}

const InGameHintsTutorial = () => {
    const { player } = usePlayer();
    const [counter, setCounter] = useState(0);
    const dummySubject = useRef(new BehaviorSubject<boolean>(false)).current;
    const hintLines = [
        'Tap the info icon for in-game hints.',
        'Nope! Don\'t tap it now, tap it in-game.',
        'Look out, we\'ve got a pro tapper over here.',
        'The actual game is pretty fun you know.',
        'Maybe tap the Play button instead?',
        'I\'m running out of short and cute sentences.',
        'Once I run out of sentences, I\'ll need to loop one...',
        'But I can\'t do that, I wouldn\'t want to dissapoint you.',
    ];

    useEffect(() => {
        let current = dummySubject.value;
        const sub = dummySubject.subscribe(dummyValue => {
            if (dummyValue !== current) {
                const increment = counter === hintLines.length - 1 ? -1 : 1;
                setCounter(counter + increment);
            }
        });
        return () => sub.unsubscribe();
    }, [counter]);

    if (!player) return <></>;



    return <TutorialScreenSkeleton title='In-game hints' text1={hintLines[counter]} text2='Now tap Play and have fun!'>
        <View style={{ width: 100 }}>
            <PlayerNameTag playerId={player.id} tutorialDisplay={dummySubject} />
        </View>
        <View style={{ width: 100, opacity: 0 }}>
            <PlayerNameTag playerId={player.id} />
        </View>
    </TutorialScreenSkeleton>
}


interface Props {
    tutorialScreen: number
}

const TutorialScreen = ({ tutorialScreen }: Props) => {

    const Screen = () => {
        if (tutorialScreen === 0) {
            return <ScoreBarTutorial />
        } else if (tutorialScreen === 1) {
            return <PlacePawnsTutorial />
        } else if (tutorialScreen === 2) {
            return <DeflectBallTutorial />
        } else if (tutorialScreen === 3) {
            return <InGameHintsTutorial />
        } else {
            return <></>
        }
    }

    return <View style={{ flex: 1, display: 'flex' }}>
        <Screen />
    </View>
}

export default TutorialScreen;
