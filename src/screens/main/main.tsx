import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Dimensions, View } from 'react-native';
import { DateTime } from 'luxon';
import * as Notifications from 'expo-notifications';
import Carousel from 'react-native-reanimated-carousel';
import { Skeleton, Text } from '@rneui/themed';

import ReminderConfig from '../../components/ReminderConfig/ReminderConfig';
import TimeSlotCard from '../../components/TimeSlotCard/TimeSlotCard';

import { saveNotificationConfig, getNotificationConfig } from '../../../storage/notification';

export default function App() {
    const width = Dimensions.get('window').width;
    const [timesLoading, setTimesLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3]);
    const [selectedHourRepeat, setSelectedHourRepeat] = useState<number>(1);
    const [selectedActiveStartTime, setSelectedActiveStartTime] = useState<DateTime>(
        DateTime.now().startOf('day').plus({ hours: 8 })
    );
    const [selectedActiveEndTime, setSelectedActiveEndTime] = useState<DateTime>(
        DateTime.now().startOf('day').plus({ hours: 22 })
    );
    const [timeSLots, setTimeSlots] = useState<string[]>([]);

    useEffect(() => {
        const getNotificationConfigFromStorage = async () => {
            try {
                const configObject = await getNotificationConfig();
                if (configObject) {
                    const startTime = configObject.times[0];
                    const endTime = configObject.times[configObject.times.length - 1];

                    setSelectedDays(configObject.days);
                    setTimeSlots(configObject.times);
                    setSelectedHourRepeat(configObject.interval);
                    setSelectedActiveStartTime(DateTime.fromFormat(startTime, 'hh:mm'));
                    setSelectedActiveEndTime(DateTime.fromFormat(endTime, 'hh:mm'));
                }
                setTimesLoading(false);
            } catch (err) {
                console.error(err);
            }
        };

        getNotificationConfigFromStorage();
    }, []);

    const calculateNotficationTimes = (
        startTime: DateTime,
        endTime: DateTime,
        incrementHour: number
    ) => {
        const notificationTimes = [];
        let lastSetTime = startTime;
        while (lastSetTime <= endTime) {
            notificationTimes.push(lastSetTime.toLocaleString(DateTime.TIME_24_SIMPLE));
            lastSetTime = lastSetTime.plus({ hours: incrementHour });
        }
        return notificationTimes;
    };

    const scheduleNotifications = async (weekday: number, time: string) => {
        console.log(weekday, time.split(':')[0], time.split(':')[1]);
        const hour = parseInt(time.split(':')[0]);
        const minute = parseInt(time.split(':')[1]);

        return Notifications.scheduleNotificationAsync({
            content: {
                title: 'HydRemind',
                body: 'Time to drink!',
                sound: 'defaultCritical',
                categoryIdentifier: 'WaterReminder',
            },
            trigger: {
                weekday,
                repeats: true,
                hour,
                minute,
            },
        });
    };

    const handleNotificationCreation = async (
        selectedDaysq,
        selectedHourRepeatq,
        selectedActiveStartTimeq,
        selectedActiveEndTimeq
    ) => {
        try {
            setTimesLoading(true);
            await Notifications.cancelAllScheduledNotificationsAsync();

            const notificationTimes = calculateNotficationTimes(
                selectedActiveStartTimeq,
                selectedActiveEndTimeq,
                selectedHourRepeatq
            );

            await Notifications.setNotificationCategoryAsync('WaterReminder', [
                {
                    buttonTitle: 'Snooze',
                    identifier: 'snooze',
                },
            ]);

            const scheduleNotificationPromises: Promise<string[]> = [];

            selectedDaysq.forEach((day) => {
                notificationTimes.forEach((time) => {
                    scheduleNotificationPromises.push(scheduleNotifications(day, time));
                });
            });

            const resp = await Promise.all(scheduleNotificationPromises);
            saveNotificationConfig(selectedDaysq, notificationTimes, selectedHourRepeatq);
            setSelectedDays(selectedDaysq);
            setSelectedHourRepeat(selectedHourRepeatq);
            setSelectedActiveStartTime(selectedActiveStartTimeq);
            setSelectedActiveEndTime(selectedActiveEndTimeq);
            setTimeSlots(notificationTimes);
            console.log(resp);
            setTimesLoading(false);
        } catch (err) {
            setTimesLoading(false);
            console.error(err);
        }
    };

    const timeSlotComp = (item) => <TimeSlotCard time={item} />;

    const reminderConfigComp = (
        <ReminderConfig
            loading={timesLoading}
            handleNotificationCreation={handleNotificationCreation}
            initialDayIndexes={selectedDays}
            initialIntervalIndex={selectedHourRepeat}
            initialStartTime={selectedActiveStartTime}
            initialEndTime={selectedActiveEndTime}
        />
    );

    const settingsComp = <Text>Hello</Text>;

    const carouselPages = [reminderConfigComp, settingsComp];

    return (
        <View style={styles.container}>
            <View style={{ flex: 2 }}>
                {timesLoading ? (
                    <View style={{ marginHorizontal: 15 }}>
                        {[...Array(3)].map(() => (
                            <Skeleton
                                height={80}
                                animation="wave"
                                style={{ padding: 20, marginVertical: 5 }}
                            />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={timeSLots}
                        renderItem={({ item }) => timeSlotComp(item)}
                        keyExtractor={(item) => item}
                        refreshing={true}
                    />
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Carousel
                    loop={false}
                    autoPlay={false}
                    pagingEnabled={true}
                    width={width}
                    data={carouselPages}
                    renderItem={({ index }) => carouselPages[index]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    heading: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
});
