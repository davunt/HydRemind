import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, Card, Text, Icon, Button } from '@rneui/themed';

interface Props {
    time: string;
    completed: boolean;
    addHydrationStat: (time: string) => null;
    removeHydrationStat: (time: string) => null;
}

export default function TimeSlotCard({
    time,
    completed,
    addHydrationStat,
    removeHydrationStat,
}: Props) {
    const { theme } = useTheme();

    const [tempCompleted, setTempCompleted] = useState(completed);
    const [relativeTime, setRelativeTime] = useState('');

    console.log(time, completed);

    useEffect(() => {
        setTempCompleted(completed);
    }, [completed]);

    useEffect(() => {
        setRelativeTime(getTimeUntil);
        const interval = setInterval(() => setRelativeTime(getTimeUntil), 60000);
        return () => {
            clearInterval(interval);
        };
    }, [tempCompleted]);

    const getTimeUntil = () => {
        const now = DateTime.now();
        const notificationTime = DateTime.fromFormat(time, 'hh:mm');
        const diff = notificationTime.diff(now);
        const minutesFrom = diff.as('minutes');
        const hoursFrom = diff.as('hours');

        if (tempCompleted) {
            return `Completed`;
        } else if (minutesFrom < 0 && minutesFrom > -60) {
            return `${Math.round(minutesFrom)} minutes ago`;
        } else if (minutesFrom < -60) {
            return `${Math.round(hoursFrom)} hour(s) ago`;
        } else if (minutesFrom < 60) {
            return `In ${Math.round(minutesFrom)} minutes`;
        } else {
            return `In ~${Math.round(hoursFrom)} hour(s)`;
        }
    };

    const getIcon = () => {
        const currentTime = DateTime.now();
        const timeCardTime = DateTime.fromFormat(time, 'hh:mm');

        if (tempCompleted) {
            return <Icon name="checkmark-circle-outline" type="ionicon" />;
        } else if (timeCardTime < currentTime) {
            return <Icon name="ellipse-outline" type="ionicon" />;
        }

        return <></>;
    };

    return (
        <Pressable
            style={{ flex: 1 }}
            disabled={DateTime.fromFormat(time, 'hh:mm') > DateTime.now()}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTempCompleted((prevState) => {
                    const newState = !prevState;
                    if (newState) addHydrationStat(time);
                    else removeHydrationStat(time);
                    return !prevState;
                });
            }}
        >
            <Card
                containerStyle={{
                    flex: 1,
                    minHeight: 100,
                    backgroundColor: tempCompleted ? theme.colors.primary : theme.colors.white,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            flex: 2,
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Text h4 h4Style={{ fontWeight: 'bold' }}>
                            {time}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-end',
                        }}
                    >
                        {getIcon()}
                    </View>
                </View>
                <>
                    <Text>{relativeTime}</Text>
                </>
            </Card>
        </Pressable>
    );
}
