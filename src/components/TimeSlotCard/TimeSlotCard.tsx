import React, { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Card, Icon, Text, useTheme } from '@rneui/themed';
import { DateTime } from 'luxon';
import { Pressable, View } from 'react-native';

interface Props {
  time: string;
  completed: boolean;
  upNext: boolean;
  addHydrationStat: (time: string) => Promise<void>;
  removeHydrationStat: (time: string) => Promise<void>;
}

export default function TimeSlotCard({
  time,
  upNext,
  completed,
  addHydrationStat,
  removeHydrationStat,
}: Props): React.ReactElement {
  const { theme } = useTheme();

  const [tempCompleted, setTempCompleted] = useState(completed);
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    setTempCompleted(completed);
  }, [completed]);

  useEffect(() => {
    setRelativeTime(getTimeUntil);
    const interval = setInterval(() => {
      setRelativeTime(getTimeUntil);
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [tempCompleted]);

  const getTimeUntil = (): string => {
    const now = DateTime.now();
    const notificationTime = DateTime.fromFormat(time, 'hh:mm');
    const diff = notificationTime.diff(now);
    const minutesFrom = diff.as('minutes');
    const hoursFrom = diff.as('hours');

    if (tempCompleted) {
      return 'Completed';
    } else if (minutesFrom < 1 && minutesFrom >= 0) {
      return 'Less than a minute ago';
    } else if (minutesFrom < 0 && minutesFrom > -60) {
      return `${Math.abs(Math.round(minutesFrom))} minutes ago`;
    } else if (minutesFrom < -60) {
      return `${Math.abs(Math.round(hoursFrom))} hours ago`;
    } else if (minutesFrom < 60) {
      return `In ${Math.round(minutesFrom)} minutes`;
    } else {
      return `In ${Math.round(hoursFrom)} hours`;
    }
  };

  const getIcon = (): React.ReactElement => {
    const currentTime = DateTime.now();
    const timeCardTime = DateTime.fromFormat(time, 'hh:mm');

    if (tempCompleted) {
      return (
        <Icon
          name="checkmark-circle-outline"
          type="ionicon"
          color={theme.colors.primary}
          size={30}
        />
      );
    } else if (timeCardTime < currentTime) {
      return <Icon name="ellipse-outline" type="ionicon" color={theme.colors.primary} size={30} />;
    } else if (upNext) {
      return <Icon name="alarm-outline" type="ionicon" size={30} />;
    }

    return <></>;
  };

  return (
    <Pressable
      style={{ flex: 1 }}
      disabled={DateTime.fromFormat(time, 'hh:mm') > DateTime.now()}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTempCompleted((prevState) => {
          const newState = !prevState;
          if (newState) void addHydrationStat(time);
          else void removeHydrationStat(time);
          return !prevState;
        });
      }}
    >
      <Card
        containerStyle={{
          flex: 1,
          minHeight: 100,
          margin: 5,
          marginBottom: 5,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 2,
              justifyContent: 'flex-start',
            }}
          >
            <Text h4 h4Style={{ fontWeight: 'bold' }}>
              {time}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'flex-end',
            }}
          >
            {getIcon()}
          </View>
        </View>
        <>
          <Text style={{ fontWeight: '200' }}>{relativeTime}</Text>
        </>
      </Card>
    </Pressable>
  );
}
