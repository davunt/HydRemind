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
    const [timeStartOptions, setStartTimeOptions] = useState<string[]>();
    const [timeEndOptions, setEndTimeOptions] = useState<string[]>();

    const hourOptions = [
        { label: 'Every hour', fullLabel: 'Every hour', value: 1 },
        { label: 'Every 2 hours', fullLabel: 'Every 2 hours', value: 2 },
        { label: 'Every 3 hours', fullLabel: 'Every 3 hours', value: 3 },
        { label: 'Every 4 hours', fullLabel: 'Every 4 hours', value: 4 },
    ];

    const getEndTimeOptions = (startTimeOptions) => {
        if (startTimeOptions) {
            const timeOptions = startTimeOptions.filter((option) => {
                if (option.value > selectedStartTime) {
                    const diff =
                        parseInt(option.value.split(':')[0]) -
                        parseInt(selectedStartTime.split(':')[0]);
                    return diff % 2 === 0;
                }
            });
            setEndTimeOptions(timeOptions);
        }
    };

    useEffect(() => {
        const getStartTimeOptions = () => {
            const timeOptions = [];
            for (let i = 0; i < 24; i++) {
                timeOptions.push({
                    label: `${String(i).padStart(2, '0')}:00`,
                    fullLabel: `${String(i).padStart(2, '0')}:00`,
                    value: `${String(i).padStart(2, '0')}:00`,
                });
            }
            setStartTimeOptions(timeOptions);
            getEndTimeOptions(timeOptions);
        };

        getStartTimeOptions();
        setSelectedIntervalIndex(initialIntervalIndex);
        setSelectedStartTime(initialStartTime);
        setSelectedEndTime(initialEndTime);
    }, [initialIntervalIndex, initialStartTime, initialEndTime]);

    useEffect(() => {
        if (timeStartOptions) getEndTimeOptions(timeStartOptions);
    }, [selectedStartTime]);

    return (
        <View style={{ flex: 1, maxHeight: 800 }}>
            <View style={styles.container}>
                <View
                    style={{
                        marginVertical: 10,
                        flexDirection: 'row',
                    }}
                >
                    <Text style={{ marginRight: 5, alignSelf: 'center' }}>Remind me</Text>

                    <SelectBottomSheet
                        title={'How often do you want to be reminded?'}
                        multiple={false}
                        loading={loading}
                        initialSelected={[selectedIntervalIndex]}
                        onSave={(selectedOptions: number[]) =>
                            setSelectedIntervalIndex(selectedOptions[0])
                        }
                        options={hourOptions}
                    />
                </View>
                <View style={{ marginVertical: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ alignSelf: 'center' }}>Between</Text>
                        <SelectBottomSheet
                            title={'First reminder'}
                            multiple={false}
                            loading={loading}
                            initialSelected={[selectedStartTime]}
                            onSave={(selectedOptions: number[]) =>
                                setSelectedStartTime(selectedOptions[0])
                            }
                            options={timeStartOptions}
                        />
                        <SelectBottomSheet
                            title={'Last reminder'}
                            multiple={false}
                            loading={loading}
                            initialSelected={[selectedEndTime]}
                            onSave={(selectedOptions: number[]) => {
                                console.log('++++', selectedOptions);
                                setSelectedEndTime(selectedOptions[0]);
                            }}
                            options={timeEndOptions}
                        />
                    </View>
                </View>
                <View style={{ marginVertical: 10, width: '100%' }}>
                    <Button
                        title="Save"
                        loading={loading}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            console.log(selectedIntervalIndex, selectedStartTime, selectedEndTime);
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
