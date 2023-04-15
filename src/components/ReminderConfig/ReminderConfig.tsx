import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { DateTime } from 'luxon';
import { Picker, Stepper } from 'react-native-ui-lib';
import { Text, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
    handleNotificationCreation: (a: number[], b: number, c: DateTime, d: DateTime) => {};
    initialDayIndexes: number[];
    initialIntervalIndex: number;
    initialStartTime: DateTime;
    initialEndTime: DateTime;
}

export default function ReminderConfig({
    handleNotificationCreation,
    initialDayIndexes,
    initialIntervalIndex,
    initialStartTime,
    initialEndTime,
}: Props) {
    const [selectedDayIndexes, setSelectedDayIndexes] = useState<number[]>(initialDayIndexes);
    const [selectedIntervalIndex, setSelectedIntervalIndex] =
        useState<number>(initialIntervalIndex);
    const [selectedStartTime, setSelectedStartTime] = useState<DateTime>(initialStartTime);
    const [selectedEndTime, setSelectedEndTime] = useState<DateTime>(initialEndTime);

    const options = [
        { label: 'Mon', fullLabel: 'Monday', value: 2 },
        { label: 'Tue', fullLabel: 'Tuesday', value: 3 },
        { label: 'Wed', fullLabel: 'Wednesday', value: 4 },
        { label: 'Thu', fullLabel: 'Thursday', value: 5 },
        { label: 'Fri', fullLabel: 'Friday', value: 6 },
        { label: 'Sat', fullLabel: 'Saturday', value: 7 },
        { label: 'Sun', fullLabel: 'Sunday', value: 1 },
    ];

    useEffect(() => {
        setSelectedDayIndexes(initialDayIndexes);
        setSelectedIntervalIndex(initialIntervalIndex);
        setSelectedStartTime(initialStartTime);
        setSelectedEndTime(initialEndTime);
    }, [initialDayIndexes, initialIntervalIndex, initialStartTime, initialEndTime]);

    return (
        <View style={styles.container}>
            <View style={{ marginVertical: 10, flexDirection: 'row' }}>
                <Text style={{ marginRight: 5, alignSelf: 'center' }}>Remind me on</Text>
                <View
                    style={{
                        backgroundColor: 'lightgrey',
                        paddingHorizontal: 5,
                        borderRadius: 5,
                        justifyContent: 'center',
                    }}
                >
                    <Picker
                        value={selectedDayIndexes}
                        floatingPlaceholder
                        onChange={(days: number[]) => setSelectedDayIndexes(days)}
                        mode={'MULTI'}
                        useSafeArea
                    >
                        {options.map((option) => (
                            <Picker.Item
                                key={option.value}
                                value={option.value}
                                label={option.label}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
            <View style={{ marginVertical: 10, flexDirection: 'row' }}>
                <Text style={{ marginRight: 5, alignSelf: 'center' }}>Every</Text>
                <Stepper
                    value={selectedIntervalIndex}
                    minValue={1}
                    maxValue={4}
                    onValueChange={(value: number) => setSelectedIntervalIndex(value)}
                />
                <Text style={{ marginLeft: 10, alignSelf: 'center' }}>Hours</Text>
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
                    onPress={() =>
                        handleNotificationCreation(
                            selectedDayIndexes,
                            selectedIntervalIndex,
                            selectedStartTime,
                            selectedEndTime
                        )
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
