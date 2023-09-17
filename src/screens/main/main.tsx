import React, { useEffect, useState } from 'react';
import { useTheme, Skeleton, Text, Button, Icon } from '@rneui/themed';
import { FlatList, Dimensions, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { DateTime } from 'luxon';
import * as Notifications from 'expo-notifications';
import Carousel from 'react-native-reanimated-carousel';

import ReminderConfig from '../../components/ReminderConfig/ReminderConfig';
import TimeSlotCard from '../../components/TimeSlotCard/TimeSlotCard';

import { saveNotificationConfig, getNotificationConfig } from '../../../storage/notification';
import {
  getTodaysHydration,
  addHydrationStat,
  removeHydrationStat,
  clearTodaysHydrationStats,
  todaysHydrationSig,
} from '../../../storage/dailyHydration';

interface Props {
  appStateVisible: boolean;
}

interface notificationConfigType {
  interval: number;
  times: string[];
}

export default function App({ appStateVisible }: Props): React.ReactElement {
  const { theme } = useTheme();
  const width = Dimensions.get('window').width;

  const [timesLoading, setTimesLoading] = useState<boolean>(true);
  const [selectedHourRepeat, setSelectedHourRepeat] = useState<number>(1);
  const [selectedActiveStartTime, setSelectedActiveStartTime] = useState<string>('08:00');
  const [selectedActiveEndTime, setSelectedActiveEndTime] = useState<string>('22:00');
  const [timeSLots, setTimeSlots] = useState<string[]>([]);
  const [upNextTime, setUpNextTime] = useState<string>();

  useEffect(() => {
    const getNotificationConfigFromStorage = async () => {
      try {
        setTimesLoading(true);
        const configObject: notificationConfigType = await getNotificationConfig();

        if (configObject.times.length > 0) {
          const startTime = configObject.times[0];
          const endTime = configObject.times[configObject.times.length - 1];

          setTimeSlots(configObject.times);
          setSelectedHourRepeat(configObject.interval);
          setSelectedActiveStartTime(startTime);
          setSelectedActiveEndTime(endTime);

          const upNext = configObject.times.find((time) => {
            const now = DateTime.now();
            const notificationTime = DateTime.fromFormat(time, 'hh:mm');
            const diff = notificationTime.diff(now);
            if (diff.as('milliseconds') > 0) {
              return true;
            }
            return false;
          });
          console.log(upNext);
          setUpNextTime(upNext);
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
    startTime: string,
    endTime: string,
    incrementHour: number
  ): string[] => {
    const notificationTimes = [];
    let lastSetTime = DateTime.fromFormat(startTime, 'hh:mm');
    while (lastSetTime <= DateTime.fromFormat(endTime, 'hh:mm')) {
      notificationTimes.push(lastSetTime.toLocaleString(DateTime.TIME_24_SIMPLE));
      lastSetTime = lastSetTime.plus({ hours: incrementHour });
    }
    return notificationTimes;
  };

  const scheduleNotifications = async (weekday: number, time: string) => {
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);

    return await Notifications.scheduleNotificationAsync({
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
    selectedActiveStartTimeq: string,
    selectedActiveEndTimeq: string
  ) => {
    try {
      setTimesLoading(true);
      await Promise.all([
        Notifications.cancelAllScheduledNotificationsAsync(),
        Notifications.setNotificationCategoryAsync('WaterReminder', []),
        clearTodaysHydrationStats(),
      ]);

      const notificationTimes = calculateNotficationTimes(
        selectedActiveStartTimeq,
        selectedActiveEndTimeq,
        selectedHourRepeatq
      );

      const scheduleNotificationPromises: Promise<string[]> = [];

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
      setTimesLoading(false);
    } catch (err) {
      setTimesLoading(false);
      console.error(err);
    }
  };

  const timeSlotComp = (item: string) => (
    <TimeSlotCard
      time={item}
      key={item}
      completed={todaysHydrationSig.value[item] || false}
      upNext={upNextTime === item}
      addHydrationStat={async (time) => {
        await addHydrationStat(time);
      }}
      removeHydrationStat={async (time) => {
        await removeHydrationStat(time);
      }}
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
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Time's up!",
              body: 'Change sides!',
            },
            trigger: {
              seconds: 10,
            },
          });
        }}
      ></Button>
    </View>
  );

  const emptyListComp = () => (
    <View
      style={{
        flexGrow: 3,
        flex: 3,
        padding: 10,
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

  const getPercentComplete = (): number => {
    const percValue = Math.round(
      (Object.keys(todaysHydrationSig.value).length / timeSLots.length) * 100
    );
    console.log(isNaN(percValue));
    if (isNaN(percValue)) return 0;
    else return percValue;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text h1 h1Style={{ fontWeight: 'bold' }} style={{ padding: 10, paddingBottom: 0 }}>
            {DateTime.local().toLocaleString({
              weekday: 'long',
            })}
          </Text>
        </View>
        <View style={{ padding: 10, paddingBottom: 0 }}>
          <CircularProgress
            value={getPercentComplete()}
            radius={25}
            progressValueColor={theme.colors.primary}
            activeStrokeColor={theme.colors.primary}
            maxValue={100}
          />
        </View>
      </View>
      <View style={{ flex: 2 }}>
        {timesLoading ? (
          <View style={{ marginHorizontal: 15 }}>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={`timeSlotSkeleton-${i}`} style={{ padding: 20, marginVertical: 5 }} />
            ))}
          </View>
        ) : (
          <FlatList
            numColumns={timeSLots.length < 5 ? 1 : 2}
            contentContainerStyle={{ flexGrow: 1, marginHorizontal: 10 }}
            data={timeSLots}
            renderItem={({ item }) => timeSlotComp(item)}
            keyExtractor={(item) => `timeSlot${item}`}
            ListEmptyComponent={emptyListComp}
          />
        )}
      </View>
      <View
        style={{
          backgroundColor: theme.colors.white,
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
