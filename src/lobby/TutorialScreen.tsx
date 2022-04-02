import { useTheme } from '@react-navigation/native';
import React, { ReactNode } from 'react';

import {
    Animated,
    Text,
    View,
} from 'react-native';
import { BALL_DIAMETER } from '../constants';
import { PreviewLine } from '../game/BallPathPreview';
import PawnVisual from '../game/PawnVisual';
import { usePlayer } from '../main_providers/player_provider';

const visualWidth = 140;
const visualMargin = 40;


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
            <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.colors.text }}>
                {title}
            </Text>
        </View>

        <View style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>

            <View style={{ width: visualWidth, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
                {children}
            </View>

            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, display: 'flex', marginLeft: visualMargin }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                            {text1}
                        </Text>
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
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

    return <TutorialScreenSkeleton title='New here? These are the basics!' text1='Fill all you score boxes.' text2={`When filled, the boxes will flip.\nScore 1 more to win!`}>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, borderColor: player?.color, borderWidth: 8, marginBottom: 6 }} />
            <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6 }} />
            <View style={{ width: 32, height: 32, backgroundColor: player?.color }} />
        </View>
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
            <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
            <View style={{ width: 32, height: 32, backgroundColor: player?.color, transform: [{ rotateZ: '45deg' }] }} />
        </View>
    </TutorialScreenSkeleton>
}

const PlacePawnsTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;

    return <TutorialScreenSkeleton title='Put Pieces' text1='Every piece costs 1 score box.' text2='You get +1 every turn.'>
        <View style={{ height: 100, width: 100 }}>
            <View style={{ borderWidth: 4, borderColor: theme.colors.text }}>
                <PawnVisual durability={new Animated.Value(5)} variant={'SLASH'} color={player?.color}></PawnVisual>
            </View>
        </View>

        <View style={{ height: 100, width: 100 }}>
            <View style={{ borderWidth: 4, borderColor: theme.colors.text }}>
                <PawnVisual durability={new Animated.Value(5)} variant={'BACKSLASH'} color={player?.color}></PawnVisual>
            </View>
        </View>
    </TutorialScreenSkeleton>
}

const DeflectBallTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;


    return <TutorialScreenSkeleton title='Collect points' text1='Place peices on the board.' text2={`Bounce the ball to your side\nto collect points.`}>
        <View style={{ width: visualWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{
                width: BALL_DIAMETER,
                height: BALL_DIAMETER,
                borderRadius: 100,
                backgroundColor: theme.colors.text,
            }} />
            <View style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <View style={{ marginTop: visualWidth - 45, height: 100, width: 100 }}>
                    <View style={{ borderWidth: 4, borderColor: theme.colors.text }}>
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
        } else {
            return <></>
        }
    }

    return <View style={{ flex: 1, display: 'flex' }}>
        <Screen />
    </View>
}

export default TutorialScreen;
