import { useTheme } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import {
    Text,
    View,
} from 'react-native';
import { usePlayer } from '../main_providers/player_provider';
import UserService from './userService';

const WinStreakDisplay = () => {
    const theme = useTheme();
    const { player, updatePlayer } = usePlayer();
    const [timeDisplay, setTimeDisplay] = useState('00h 00m');

    useEffect(() => {
        const getTimeDisplay = (timeDiff: number) => {
            const rawHours = Math.max(0, timeDiff / (1000 * 60 * 60));
            const hours = Math.floor(rawHours);
            const minutes = Math.floor((rawHours - hours) * 60);

            const hoursDisplay = `${hours}`.padStart(2, '0');
            const minsDisplay = `${minutes}`.padStart(2, '0');
            return `${hoursDisplay}h ${minsDisplay}m`;
        }
        if (player && updatePlayer) {
            const timeDiff = player.gameStats.nextDay - Date.now();
            setTimeDisplay(getTimeDisplay(timeDiff));
        }

        const interval = setInterval(async () => {
            if (!player || !updatePlayer) return;

            const timeDiff = player.gameStats.nextDay - Date.now();
            if (timeDiff <= 0) {
                const stats = await UserService.getStats();
                updatePlayer({
                    ...player,
                    gameStats: stats
                });
            } else {
                setTimeDisplay(getTimeDisplay(timeDiff));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player]);

    if (!player || player.gameStats.winStreak === 0) {
        return <></>;
    }

    if (player.gameStats.hasWonToday) {
        return <View style={{ alignItems: 'center' }} >
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold' }}>You won today</Text>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 24, marginBottom: 8 }}>Day Streak</Text>
            <View style={{ borderBottomWidth: 4, borderColor: player.color, paddingHorizontal: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 36 }}>{player.gameStats.winStreak}</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginTop: 12 }}>{timeDisplay}</Text>
        </View>
    } else {
        return <View style={{ alignItems: 'center' }} >
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold' }}>Win a game</Text>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}>Keep your streak</Text>
            <View style={{ borderBottomWidth: 4, borderColor: player.color, paddingHorizontal: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 24 }}>{timeDisplay}</Text>
            </View>
            <Text style={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 14, marginTop: 8 }}>Currently at {player.gameStats.winStreak}</Text>
        </View>
    }
}

export default WinStreakDisplay;
