import React, { useState } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';

interface Props {
    score: number
    maxScore: number
}


const ScoreBar = ({ score, maxScore }: Props) => {
    const [currentLayout, setCurrentLayout] = useState<{ width: number, height: number }>();

    const onLayout = (evt: any) => {
        setCurrentLayout(evt.nativeEvent.layout)
    }

    let nodes: JSX.Element[] = [];
    if (currentLayout) {
        let width = currentLayout.width * 0.7;
        const ratioMargin = 0.25;
        const preferredHeight = maxScore * width * (1 + ratioMargin) + width * ratioMargin;

        if (preferredHeight > currentLayout.height) {
            width = (currentLayout.height - width * ratioMargin) / (maxScore * (1 + ratioMargin));
        }

        nodes = Array(maxScore).fill(null).map((_, idx) => {
            return <View key={`score_${idx}`} style={{ marginBottom: width * ratioMargin, marginTop: idx === 0 ? width * ratioMargin : 0 }}>
                <View style={{ overflow: 'hidden', width: width, height: width, transform: [{ rotateZ: '0deg' }] }}>
                    <View style={{ ...styles.expanded, position: 'absolute', top: -width * 0.5, left: -width * 0.5, transform: [{ translateX: width * 0.5 }, { translateY: width * 0.5 }] }}>
                        <View style={{ ...styles.expanded, backgroundColor: 'green', borderRadius: 100, transform: [{ scale: 0 }] }}></View>
                    </View>
                    <View style={{ ...styles.expanded, borderColor: 'green', borderWidth: width * 0.25 }}></View>
                </View>
            </View>
        });
    }

    return (
        <View onLayout={onLayout} style={styles.scoreBar}>
            {nodes}
        </View>
    );
};

const styles = StyleSheet.create({
    scoreBar: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: '100%',
    },
    expanded: {
        width: '100%',
        height: '100%',
    },
});

export default ScoreBar;
