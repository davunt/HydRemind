import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { StyleSheet } from 'react-native';
import { Card, Text } from '@rneui/themed';

interface Props {
    time: string;
}

export default function TimeSlotCard({ time }: Props) {
    const getTimeUntil = () => {
        const now = DateTime.now();
        const notificationTime = DateTime.fromFormat(time, 'hh:mm');
        const diff = notificationTime.diff(now);
        const minutesFrom = diff.as('minutes');
        const hoursFrom = diff.as('hours');

        if (minutesFrom < 0) {
            return '';
        } else if (minutesFrom < 60) {
            return `In ${Math.round(minutesFrom)} minutes`;
        } else {
            return `In ${Math.round(hoursFrom)} hour(s)`;
        }
    };

    return (
        <Card containerStyle={{ padding: 20, marginVertical: 5, marginHorizontal: 15 }}>
            <Text>{time}</Text>
            <Text>{getTimeUntil()}</Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
