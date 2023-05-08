import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { DateTime } from 'luxon';
import { Stepper } from 'react-native-ui-lib';
import { Text, Button } from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';

import SelectBottomSheet from '../SelectBottomSheet/SelectBottomSheet';

interface Props {
    loading: boolean;
    handleNotificationCreation: (a: number[], b: number, c: DateTime, d: DateTime) => {};
    initialDayIndexes: number[];
    initialIntervalIndex: number;
    initialStartTime: DateTime;
    initialEndTime: DateTime;
}

export default function ReminderConfig({
    loading,
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

    useEffect(() => {
        setSelectedDayIndexes(initialDayIndexes);
        setSelectedIntervalIndex(initialIntervalIndex);
        setSelectedStartTime(initialStartTime);
        setSelectedEndTime(initialEndTime);
    }, [initialDayIndexes, initialIntervalIndex, initialStartTime, initialEndTime]);

    return (
        <View style={styles.container}>
            <View
                style={{
                    marginVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
                <Text style={{ marginRight: 5, alignSelf: 'center' }}>On</Text>
                <SelectBottomSheet
                    multiple
                    initialSelected={selectedDayIndexes}
                    onSave={(days: number[]) => setSelectedDayIndexes(days)}
                />
            </View>
            <View
                style={{
                    marginVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}
            >
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
                    loading={loading}
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
        marginLeft: 20,
        marginRight: 20,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
});
