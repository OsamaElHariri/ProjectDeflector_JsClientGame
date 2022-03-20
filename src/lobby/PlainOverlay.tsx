import React, { ReactNode } from 'react';

import {
    StyleSheet,
    View,
} from 'react-native';
import { GameTheme } from '../AppEntry';

interface Props {
    children: ReactNode
}

const PlainOverlay = ({ children }: Props) => {
    return <View style={{ ...styles.overlay, backgroundColor: GameTheme.colors.background }}>
        {children}
    </View>
}

const styles = StyleSheet.create({
    overlay: {
        paddingTop: '10%',
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        textAlign: 'center',
    }
});

export default PlainOverlay;
