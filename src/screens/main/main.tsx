import React, { useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { FlatList, StyleSheet, Dimensions, View } from 'react-native';
import { DateTime } from 'luxon';
import * as Notifications from 'expo-notifications';
import Carousel from 'react-native-reanimated-carousel';
import { Skeleton, Text, Button, Icon } from '@rneui/themed';

import ReminderConfig from '../../components/ReminderConfig/ReminderConfig';
import TimeSlotCard from '../../components/TimeSlotCard/TimeSlotCard';

import { saveNotificationConfig, getNotificationConfig } from '../../../storage/notification';
import { getTodaysHydration, todaysHydrationSig } from '../../../storage/dailyHydration';

export default function App() {
    const { theme } = useTheme();

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

        const getDailyHydrationFromStorage = async () => {
            try {
                await getTodaysHydration();
            } catch (err) {}
        };

        getNotificationConfigFromStorage();
        getDailyHydrationFromStorage();
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
                body: 'Time to hydrate!',
                sound: 'defaultCritical',
                categoryIdentifier: 'WaterReminder',
                data: { weekday, time },
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
            console.log('Setting notifications');
            console.log('=>', selectedDaysq);
            setTimesLoading(true);
            await Notifications.cancelAllScheduledNotificationsAsync();

            const notificationTimes = calculateNotficationTimes(
                selectedActiveStartTimeq,
                selectedActiveEndTimeq,
                selectedHourRepeatq
            );

            await Notifications.setNotificationCategoryAsync('WaterReminder', [
                {
                    buttonTitle: "I've Hydrated!",
                    identifier: 'hydrated',
                },
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

    const timeSlotComp = (item) => (
        <TimeSlotCard time={item} key={item} completed={todaysHydrationSig.value[item] || false} />
    );

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

    const settingsComp = (
        <View>
            <Text>Hello</Text>
            <Button
                title="Set Notication Test"
                onPress={async () =>
                    await scheduleNotifications(
                        5,
                        DateTime.now().plus({ minute: 1 }).toLocaleString(DateTime.TIME_24_SIMPLE)
                    )
                }
            ></Button>
        </View>
    );

    const emptyListComp = () => (
        <View
            style={{
                flexGrow: 1,
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text h3>No reminders set</Text>
            <Text>Please set your reminders below</Text>
            <Icon name="arrow-down-outline" type="ionicon" />
        </View>
    );

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
                        contentContainerStyle={{ flexGrow: 1 }}
                        data={timeSLots}
                        renderItem={({ item }) => timeSlotComp(item)}
                        keyExtractor={(item) => item}
                        refreshing={true}
                        ListEmptyComponent={emptyListComp}
                    />
                )}
            </View>
            <View
                style={{
                    flex: 1,
                    backgroundColor: theme.colors.white,
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                }}
            >
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
});
