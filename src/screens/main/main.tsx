import React, { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Button } from '@rneui/base';
import { Icon, Text, useTheme } from '@rneui/themed';
import { DateTime } from 'luxon';
import { ActivityIndicator, Dimensions, FlatList, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import Carousel from 'react-native-reanimated-carousel';
import {
  addHydrationStat,
  clearTodaysHydrationStats,
  getTodaysHydration,
  removeHydrationStat,
  todaysHydrationSig,
} from '../../../storage/dailyHydration';
import { getNotificationConfig, saveNotificationConfig } from '../../../storage/notification';
import { hydrationFacts } from '../..//utils/hydrationsFacts';
import ReminderConfig from '../../components/ReminderConfig/ReminderConfig';
import TimeSlotCard from '../../components/TimeSlotCard/TimeSlotCard';
import type { notificationConfigType } from '../../types';

interface Props {
  appStateVisible: boolean;
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
    const getNotificationConfigFromStorage = async (): Promise<undefined> => {
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
          setUpNextTime(upNext);
        }
        setTimesLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    const getDailyHydrationFromStorage = async (): Promise<undefined> => {
      try {
        await getTodaysHydration();
      } catch (err) {
        console.error(err);
      }
    };

    void getNotificationConfigFromStorage();
    void getDailyHydrationFromStorage();
  }, [appStateVisible]);

  const calculateNotificationTimes = (
    startTime: string,
    endTime: string,
    incrementHour: number
  ): string[] => {
    const notificationTimes: string[] = [];
    let lastSetTime = DateTime.fromFormat(startTime, 'hh:mm');
    while (lastSetTime <= DateTime.fromFormat(endTime, 'hh:mm')) {
      notificationTimes.push(lastSetTime.toLocaleString(DateTime.TIME_24_SIMPLE));
      lastSetTime = lastSetTime.plus({ hours: incrementHour });
    }
    return notificationTimes;
  };

  const getHydrationFact = (): string => {
    const factsLength = hydrationFacts.length;
    const factNum = Math.floor(Math.random() * factsLength);
    return hydrationFacts[factNum];
  };

  const scheduleNotifications = async (weekday: number, time: string): Promise<string> => {
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to hydrate!',
        body: getHydrationFact(),
        sound: 'defaultCritical',
        categoryIdentifier: 'WaterReminder',
        data: { weekday, time },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  };

  const handleNotificationCreation = async (
    selectedHourRepeatq: number,
    selectedActiveStartTimeq: string,
    selectedActiveEndTimeq: string
  ): Promise<undefined> => {
    try {
      setTimesLoading(true);
      await Promise.all([
        Notifications.cancelAllScheduledNotificationsAsync(),
        Notifications.setNotificationCategoryAsync('WaterReminder', []),
        clearTodaysHydrationStats(),
      ]);

      const notificationTimes = calculateNotificationTimes(
        selectedActiveStartTimeq,
        selectedActiveEndTimeq,
        selectedHourRepeatq
      );

      const scheduleNotificationPromises: Array<Promise<string>> = [];

      notificationTimes.forEach((time) => {
        scheduleNotificationPromises.push(scheduleNotifications(1, time));
      });

      await Promise.all(scheduleNotificationPromises);
      await saveNotificationConfig(notificationTimes, selectedHourRepeatq);
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

  const timeSlotComp = (item: string): React.ReactElement => (
    <TimeSlotCard
      time={item}
      key={item}
      completed={Boolean((todaysHydrationSig.value as Record<string, any>)[item]) || false}
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

  const emptyListComp = (): React.ReactElement => (
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

  const devComp = (
    <View>
      <Button
        onPress={() => {
          const time = DateTime.now().plus({ minutes: 1 }).toLocaleString(DateTime.TIME_24_SIMPLE);
          void scheduleNotifications(1, time);
        }}
      >
        Test notifications
      </Button>
    </View>
  );

  const carouselPages = [reminderConfigComp, devComp];

  const getPercentComplete = (): number => {
    const percValue = Math.round(
      (Object.keys(todaysHydrationSig.value).length / timeSLots.length) * 100
    );
    if (isNaN(percValue)) return 0;
    else return percValue;
  };

  const handleDayComplete = async (): Promise<undefined> => {
    if (getPercentComplete() >= 100) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
          {/* <CircularProgress
            value={getPercentComplete()}
            radius={25}
            progressValueColor={theme.colors.black}
            activeStrokeColor={theme.colors.black}
            maxValue={100}
            valueSuffix={'%'}
            inActiveStrokeOpacity={0.3}
            inActiveStrokeWidth={5}
            activeStrokeWidth={5}
            onAnimationComplete={() => {
              void handleDayComplete();
            }}
          /> */}
        </View>
      </View>
      <View style={{ flex: 2 }}>
        {timesLoading ? (
          <View style={{ marginHorizontal: 15 }}>
            <ActivityIndicator size="large" />
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
