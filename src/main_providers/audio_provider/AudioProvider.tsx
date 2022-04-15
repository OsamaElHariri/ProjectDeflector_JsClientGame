import React, { ReactNode, useEffect, useMemo } from "react"
import Sound from "react-native-sound"
import { AudioContext, SoundEffect } from "./context"

interface Props {
    children: ReactNode
}

export function AudioProvider({ children }: Props) {

    useEffect(() => {
        Sound.setCategory('Playback');
    }, []);

    const sounds: { [a in SoundEffect]: Sound } = useMemo(() => ({
        cancel: new Sound('cancel.mp3', Sound.MAIN_BUNDLE),
        confirm_pawn: new Sound('confirm_pawn.mp3', Sound.MAIN_BUNDLE),
        end_turn: new Sound('end_turn.mp3', Sound.MAIN_BUNDLE),
        lose_game: new Sound('lose_game.mp3', Sound.MAIN_BUNDLE),
        multi_bounce_1: new Sound('multi_bounce_1.mp3', Sound.MAIN_BUNDLE),
        multi_bounce_2: new Sound('multi_bounce_2.mp3', Sound.MAIN_BUNDLE),
        multi_bounce_3: new Sound('multi_bounce_3.mp3', Sound.MAIN_BUNDLE),
        preview_pawn: new Sound('preview_pawn.mp3', Sound.MAIN_BUNDLE),
        shuffle: new Sound('shuffle.mp3', Sound.MAIN_BUNDLE),
        turn_start: new Sound('turn_start.mp3', Sound.MAIN_BUNDLE),
        win_game: new Sound('win_game.mp3', Sound.MAIN_BUNDLE),
    }), []);

    const audioPlayer = {
        play: (soundEffect: SoundEffect) => {
            Object.values(sounds).forEach(sound => sound.stop());
            sounds[soundEffect].play();
        },
    }

    return <AudioContext.Provider value={audioPlayer} children={children} />
}