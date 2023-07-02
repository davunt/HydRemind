import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { DateTime } from 'luxon';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';

import SelectBottomSheet from '../SelectBottomSheet/SelectBottomSheet';

interface Props {
    loading: boolean;
    handleNotificationCreation: (a: number, b: DateTime, c: DateTime) => {};
    initialIntervalIndex: number;
    initialStartTime: DateTime;
    initialEndTime: DateTime;
}

export default function ReminderConfig({
    loading,
    handleNotificationCreation,
    initialIntervalIndex,
    initialStartTime,
    initialEndTime,
}: Props) {
    const [selectedIntervalIndex, setSelectedIntervalIndex] =
        useState<number>(initialIntervalIndex);
    const [selectedStartTime, setSelectedStartTime] = useState<DateTime>(initialStartTime);
    const [selectedEndTime, setSelectedEndTime] = useState<DateTime>(initialEndTime);

    const hourOptions = [
        { label: 'Every hour', fullLabel: 'Every hour', value: 1 },
        { label: 'Every 2 hours', fullLabel: 'Every 2 hours', value: 2 },
        { label: 'Every 3 hours', fullLabel: 'Every 3 hours', value: 3 },
        { label: 'Every 4 hours', fullLabel: 'Every 4 hours', value: 4 },
    ];

    useEffect(() => {
        setSelectedIntervalIndex(initialIntervalIndex);
        setSelectedStartTime(initialStartTime);
        setSelectedEndTime(initialEndTime);
    }, [initialIntervalIndex, initialStartTime, initialEndTime]);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <View
                    style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Text style={{ marginRight: 5, alignSelf: 'center' }}>Remind me</Text>

                    <SelectBottomSheet
                        title={'How often do you want to be reminded?'}
                        multiple
                        loading={loading}
                        initialSelected={[selectedIntervalIndex]}
                        onSave={(selectedOptions: number[]) =>
                            setSelectedIntervalIndex(selectedOptions[0])
                        }
                        options={hourOptions}
                    />
                </View>
                <View style={{ marginVertical: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ alignSelf: 'center' }}>Between</Text>
                        <DateTimePicker
                            id="startDate"
                            value={selectedStartTime.toJSDate()}
                            mode="time"
                            minuteInterval={30}
                            onChange={(e, timestamp) =>
                                setSelectedStartTime(DateTime.fromJSDate(timestamp!))
                            }
                        />
                        <Text style={{ marginLeft: 10, alignSelf: 'center' }}>and</Text>
                        <DateTimePicker
                            value={selectedEndTime.toJSDate()}
                            onChange={(e, timestamp) =>
                                setSelectedEndTime(DateTime.fromJSDate(timestamp!))
                            }
                            mode="time"
                            minuteInterval={30}
                        />
                    </View>
                </View>
                <View style={{ marginVertical: 10, width: '100%' }}>
                    <Button
                        title="Save"
                        loading={loading}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            handleNotificationCreation(
                                selectedIntervalIndex,
                                selectedStartTime,
                                selectedEndTime
                            );
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
});
