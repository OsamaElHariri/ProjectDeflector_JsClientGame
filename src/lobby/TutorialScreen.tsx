import { useTheme } from '@react-navigation/native';
import React from 'react';

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

const ScoreBarTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    return <>
        <View>
            <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.colors.text }}>
                New here? These are the basics
            </Text>
        </View>

        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', marginLeft: 80 }}>
            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: visualWidth + visualMargin, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <View style={{ width: 32, height: 32, borderColor: player?.color, borderWidth: 8, marginBottom: 6 }} />
                    <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6 }} />
                    <View style={{ width: 32, height: 32, backgroundColor: player?.color }} />
                </View>
                <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                    Fill all you score boxes.
                </Text>
            </View>

            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: visualWidth + visualMargin, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
                    <View style={{ width: 32, height: 32, backgroundColor: player?.color, marginBottom: 6, transform: [{ rotateZ: '45deg' }] }} />
                    <View style={{ width: 32, height: 32, backgroundColor: player?.color, transform: [{ rotateZ: '45deg' }] }} />
                </View>
                <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                    {`When filled, the boxes will flip.\nScore 1 more to win!`}
                </Text>
            </View>

        </View>
    </>
}

const PlacePawnsTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;

    return <>
        <View>
            <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.colors.text }}>
                Put Pieces
            </Text>
        </View>

        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', marginLeft: 80 }}>
            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <View style={{ width: visualWidth + visualMargin, alignItems: 'center' }}>
                        <View style={{ height: 100, width: 100 }}>
                            <View style={{ borderWidth: 4, borderColor: theme.colors.text }}>
                                <PawnVisual durability={new Animated.Value(5)} variant={'SLASH'} color={player?.color}></PawnVisual>
                            </View>
                        </View>
                    </View>
                </View>
                <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                    Every piece costs 1 score box.
                </Text>
            </View>

            <View style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <View style={{ width: visualWidth + visualMargin, alignItems: 'center' }}>
                        <View style={{ height: 100, width: 100 }}>
                            <View style={{ borderWidth: 4, borderColor: theme.colors.text }}>
                                <PawnVisual durability={new Animated.Value(5)} variant={'BACKSLASH'} color={player?.color}></PawnVisual>
                            </View>
                        </View>
                    </View>
                </View>
                <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                    You get +1 every turn.
                </Text>
            </View>
        </View>
    </>
}

const DeflectBallTutorial = () => {
    const theme = useTheme();
    const { player } = usePlayer();
    if (!player) return <></>;

    return <>
        <View>
            <Text style={{ fontWeight: 'bold', fontSize: 28, color: theme.colors.text }}>
                Collect points
            </Text>
        </View>

        <View style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>

            <View style={{ width: visualWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 80 }}>
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

            <View style={{ flex: 1 }}>

                <View style={{ flex: 1, display: 'flex', marginLeft: visualMargin }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                            Place peices on the board.
                        </Text>
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ marginLeft: 16, fontWeight: 'bold', fontSize: 18, color: theme.colors.text }}>
                            {`Bounce the ball to your side\nto collect points.`}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    </>
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
