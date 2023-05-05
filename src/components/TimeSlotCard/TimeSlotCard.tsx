import React, { useState } from 'react';
import { useTheme } from '@rneui/themed';
import { DateTime } from 'luxon';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';

interface Props {
    time: string;
    completed: boolean;
}

export default function TimeSlotCard({ time, completed }: Props) {
    const { theme } = useTheme();

    const getTimeUntil = () => {
        const now = DateTime.now();
        const notificationTime = DateTime.fromFormat(time, 'hh:mm');
        const diff = notificationTime.diff(now);
        const minutesFrom = diff.as('minutes');
        const hoursFrom = diff.as('hours');

        if (minutesFrom < 0) {
            return 'Past Due';
        } else if (minutesFrom < 60) {
            return `In ${Math.round(minutesFrom)} minutes`;
        } else {
            return `In ~${Math.round(hoursFrom)} hour(s)`;
        }
    };

    const getIcon = () => {
        const currentTime = DateTime.now();
        const timeCardTime = DateTime.fromFormat(time, 'hh:mm');

        if (completed) {
            return <Icon name="water" color={theme.colors.primary} type="ionicon" />;
        } else if (timeCardTime < currentTime) {
            return <Icon name="water-outline" type="ionicon" />;
        }

        return <></>;
    };

    return (
        <Card
            containerStyle={{
                padding: 20,
                marginVertical: 5,
                marginHorizontal: 15,
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
                        flex: 1,
                        justifyContent: 'flex-start',
                    }}
                >
                    <Text h3>{time}</Text>
                    <Text>{getTimeUntil()}</Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    }}
                >
                    {getIcon()}
                </View>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
