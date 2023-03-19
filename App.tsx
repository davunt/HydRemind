import React, {useEffect, useState, useRef} from 'react'
import { FlatList, Platform, StyleSheet, SafeAreaView, View } from 'react-native';
import { DateTime } from 'luxon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from "expo-notifications";
import { ButtonGroup } from '@rneui/themed';
import { Text, Button, Carousel, Card } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const [selectedDays, setSelectedDays] = useState<number[]>([0, 2, 3,]);
  const [selectedHourRepeat, setSelectedHourRepeat] = useState<number>(0);
  const [selectedActiveStartTime, setSelectedActiveStartTime] = useState<DateTime>(DateTime.now().startOf('day').plus({ hours: 8 }))
  const [selectedActiveEndTime, setSelectedActiveEndTime] = useState<DateTime>(DateTime.now().startOf('day').plus({ hours: 22 }))
  const [timeSLots, setTimeSlots] = useState<string[]>([])

  const notificationListener = useRef();
  const responseListener = useRef();

  async function registerForNotificationsAsync() {
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  }

  useEffect(() => {

    registerForNotificationsAsync().then(() => {
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('notification');
      });
  
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });
    })

    const getNotificationConfig = async () => {
      try {
        const daysArrayString = await AsyncStorage.getItem('@daysKey');
        const timesArrayString = await AsyncStorage.getItem('@timesKey');
        const interval = await AsyncStorage.getItem('@timeIntervalKey');
        const days = JSON.parse(daysArrayString);
        const times = JSON.parse(timesArrayString);
        const startTime = times[0];
        const endTime = times[timeSLots.length - 1];

        setSelectedDays(days);
        setTimeSlots(JSON.parse(timesArrayString));
        setSelectedHourRepeat(parseInt(interval));
        setSelectedActiveStartTime(DateTime.fromFormat(startTime, 'hh:mm'));
        setSelectedActiveEndTime(DateTime.fromFormat(endTime, 'hh:mm'));
      } catch(err) {
        console.error(err);
      }
    }

    getNotificationConfig();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const calculateNotficationTimes = (startTime: DateTime, endTime: DateTime, incrementHour: number) => {
    const notificationTimes = [];
    let lastSetTime = startTime;
    while(lastSetTime <= endTime) {
      notificationTimes.push(lastSetTime.toLocaleString(DateTime.TIME_24_SIMPLE));
      lastSetTime = lastSetTime.plus({ hours: incrementHour });
    }
    return notificationTimes;
  }

  const scheduleNotifications = async (weekday: number, time: string) => {
    console.log(weekday, time.split(':')[0], time.split(':')[1]);
    const hour = parseInt(time.split(':')[0]);
    const minute = parseInt(time.split(':')[1]);

    return Notifications.scheduleNotificationAsync({
      content: {
        title: "HydRemind",
        body: 'Drink some water!',
        data: { data: 'goes here' },
        categoryIdentifier: 'rem'
      },
      trigger: {
        weekday,
        repeats: true,
        hour,
        minute,
      },
    });
  }

  const storeNotificationConfig = async (days: [], times: [], interval: number) => {
    try {
      const daysArrayString = JSON.stringify(days);
      const timesArrayString = JSON.stringify(times);
      await Promise.all([
        AsyncStorage.setItem('@daysKey', daysArrayString),
        AsyncStorage.setItem('@timesKey', timesArrayString),
        AsyncStorage.setItem('@timeIntervalKey', interval.toString())
      ])
    } catch (err) {
      console.error(err);
    }
  }

  const handleNotificationCreation = async () => {
    try {
      console.log('interval', selectedHourRepeat);
      console.log('startTime', selectedActiveStartTime);
      console.log('endTime', selectedActiveEndTime);
      console.log('days', selectedDays);

      await Notifications.cancelAllScheduledNotificationsAsync();
  
      const notificationTimes = calculateNotficationTimes(selectedActiveStartTime, selectedActiveEndTime, selectedHourRepeat + 1);
  
      await Notifications.setNotificationCategoryAsync('rem', [
        {
          buttonTitle: 'I drank',
          identifier: 'i_drank',
  
        },
        {
          buttonTitle: 'Snooze',
          identifier: 'snooze',
  
        }
      ]);
  
      const scheduleNotificationPromises: Promise<string[]> = [];
  
      selectedDays.forEach((day) => {
        notificationTimes.forEach((time) => {
          scheduleNotificationPromises.push(scheduleNotifications(day +1, time))
        })
      });
  
      const resp = await Promise.all(scheduleNotificationPromises);
      storeNotificationConfig(selectedDays, notificationTimes, selectedHourRepeat);
      console.log(resp)
    } catch (err) {
      console.error(err);
    }
  }

  const reminderConfigComp = () => {
    return (
      <Card flex center style={{ padding: 10 }}>
        <ButtonGroup
          buttons={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
          selectMultiple
          selectedIndexes={selectedDays}
          onPress={(value) => {
            setSelectedDays(value);
          }}
          containerStyle={{ marginBottom: 20 }}
        />
        <ButtonGroup
          buttons={['1', '2', '3']}
          selectedIndex={selectedHourRepeat}
          onPress={(value) => {
            console.log(value);
            setSelectedHourRepeat(value);
          }}
          containerStyle={{ marginBottom: 20 }}
        />
        <View style={{ flexDirection: 'row'}}>
          <DateTimePicker
            id='startDate'
            value={selectedActiveStartTime.toJSDate()}
            mode='time'
            minuteInterval={30}
            onChange={(e, timestamp) => setSelectedActiveStartTime(DateTime.fromJSDate(timestamp))}
          />
          <DateTimePicker
            value={selectedActiveEndTime?.toJSDate()}
            onChange={(e, timestamp) => setSelectedActiveEndTime(DateTime.fromJSDate(timestamp))}
            mode='time'
            minuteInterval={30}
          />
        </View>
        <Button
          style={{ width: '100%' }}
          label={'Save'}
          onPress={handleNotificationCreation}
        />
      </Card>
    )
  }

  const timeSlotComp = (item) => (
    <Card containerStyle={{ padding: 20, marginVertical: 5, marginHorizontal: 15 }}>
      <Text>
        {item}
      </Text>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container}>
        <FlatList
          data={timeSLots}
          renderItem={({item}) => timeSlotComp(item)}
          keyExtractor={item => item}
        />
        <Carousel
          style={{ height: 260 }}
        >
            {reminderConfigComp()}
        </Carousel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'blue',
  },
});
