import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import BottomSheet from '@gorhom/bottom-sheet';
import { FlatList, StyleSheet, Dimensions, View } from 'react-native';
import { DateTime } from 'luxon';
import * as Notifications from 'expo-notifications';
import Carousel from 'react-native-reanimated-carousel';
import { Skeleton, Text, Button, Icon } from '@rneui/themed';

import ReminderConfig from '../../components/ReminderConfig/ReminderConfig';
import TimeSlotCard from '../../components/TimeSlotCard/TimeSlotCard';

import { saveNotificationConfig, getNotificationConfig } from '../../../storage/notification';
import {
    getTodaysHydration,
    addHydrationStat,
    removeHydrationStat,
    todaysHydrationSig,
} from '../../../storage/dailyHydration';

interface Props {
    appStateVisible: boolean;
}

interface notificationConfigType {
    interval: number;
    times: string[];
}

export default function App({ appStateVisible }: Props) {
    const { theme } = useTheme();
    const width = Dimensions.get('window').width;

    const [timesLoading, setTimesLoading] = useState<boolean>(true);
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
                const configObject: notificationConfigType = await getNotificationConfig();

                if (configObject) {
                    const startTime = configObject.times[0];
                    const endTime = configObject.times[configObject.times.length - 1];

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
            } catch (err) {
                console.error(err);
            }
        };

        getNotificationConfigFromStorage();
        getDailyHydrationFromStorage();
    }, [appStateVisible]);

    const calculateNotficationTimes = (
        startTime: DateTime,
        endTime: DateTime,
        incrementHour: number
    ): string[] => {
        const notificationTimes = [];
        let lastSetTime = startTime;
        while (lastSetTime <= endTime) {
            notificationTimes.push(lastSetTime.toLocaleString(DateTime.TIME_24_SIMPLE));
            lastSetTime = lastSetTime.plus({ hours: incrementHour });
        }
        return notificationTimes;
    };

    const scheduleNotifications = async (weekday: number, time: string) => {
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
        selectedHourRepeatq: number,
        selectedActiveStartTimeq: DateTime,
        selectedActiveEndTimeq: DateTime
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
                    buttonTitle: "I've Hydrated!",
                    identifier: 'hydrated',
                },
                {
                    buttonTitle: 'Snooze',
                    identifier: 'snooze',
                },
            ]);

            const scheduleNotificationPromises: Promise<string[]> = [];
            console.log('here');

            const days = [1, 2, 3, 4, 5, 6, 7];

            days.forEach((day) => {
                notificationTimes.forEach((time) => {
                    scheduleNotificationPromises.push(scheduleNotifications(day, time));
                });
            });

            const resp = await Promise.all(scheduleNotificationPromises);
            saveNotificationConfig(notificationTimes, selectedHourRepeatq);
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
        <TimeSlotCard
            time={item}
            key={item}
            completed={todaysHydrationSig.value[item] || false}
            addHydrationStat={(time) => addHydrationStat(time)}
            removeHydrationStat={(time) => removeHydrationStat(time)}
        />
    );

    const reminderConfigComp = (
        <ReminderConfig
            loading={timesLoading}
            handleNotificationCreation={handleNotificationCreation}
            initialIntervalIndex={selectedHourRepeat}
            initialStartTime={selectedActiveStartTime}
            initialEndTime={selectedActiveEndTime}
        />
    );

    const devComp = (
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
                flexGrow: 3,
                flex: 3,
                padding: 10,
                // backgroundColor: 'red',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text h4 h4Style={{ fontWeight: 'bold' }}>
                No reminders set
            </Text>
            <Text>Please set your reminders below</Text>
            <Icon name="arrow-down-outline" type="ionicon" />
        </View>
    );

    const carouselPages = [reminderConfigComp];

    return (
        <View style={styles.container}>
            <Text h1 h1Style={{ fontWeight: 'bold' }} style={{ padding: 10 }}>
                {DateTime.local().toLocaleString({ weekday: 'long' })}
            </Text>
            <View style={{ flex: 2 }}>
                {timesLoading ? (
                    <View style={{ marginHorizontal: 15 }}>
                        {[...Array(2)].map((_, i) => (
                            <Skeleton
                                key={`timeSlotSkeleton-${i}`}
                                style={{ padding: 20, marginVertical: 5 }}
                            />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        numColumns={2}
                        contentContainerStyle={{ flexGrow: 1 }}
                        data={timeSLots}
                        renderItem={({ item }) => timeSlotComp(item)}
                        keyExtractor={(item) => `timeSlot${item}`}
                        ListEmptyComponent={emptyListComp}
                    />
                )}
            </View>
            <View
                style={{
                    // flex: 1,
                    backgroundColor: theme.colors.white,
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                }}
            >
                <Carousel
                    loop={false}
                    height={width / 2}
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
        // flexDirection: 'column',
    },
});
