import React, { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Button, Text, useTheme } from '@rneui/themed';
import { Formik } from 'formik';
import { StyleSheet, View } from 'react-native';
import SelectBottomSheet from '../SelectBottomSheet/SelectBottomSheet';

interface Props {
  loading: boolean;
  handleNotificationCreation: (a: number, b: string, c: string) => Record<string, any>;
  initialIntervalIndex: number;
  initialStartTime: string;
  initialEndTime: string;
}

interface HourOptions {
  label: string;
  fullLabel: string;
  value: string;
}

interface IntervalOptions {
  label: string;
  fullLabel: string;
  value: number;
}

export default function ReminderConfig({
  loading,
  handleNotificationCreation,
  initialIntervalIndex,
  initialStartTime,
  initialEndTime,
}: Props): React.ReactElement {
  const { theme } = useTheme();

  const [timeStartOptions, setStartTimeOptions] = useState<HourOptions[]>();

  const [timeEndOptions, setEndTimeOptions] = useState<HourOptions[]>();

  const hourOptions: IntervalOptions[] = [
    { label: 'Every hour', fullLabel: 'Every hour', value: 1 },
    { label: 'Every 2 hours', fullLabel: 'Every 2 hours', value: 2 },
    { label: 'Every 3 hours', fullLabel: 'Every 3 hours', value: 3 },
    { label: 'Every 4 hours', fullLabel: 'Every 4 hours', value: 4 },
  ];

  const getEndTimeOptions = (startTime: string, timeInterval: number): undefined => {
    const startHour = parseInt(startTime.split(':')[0]);
    let lastTime = startHour;

    const timeOptions = [];

    while (lastTime >= startHour) {
      lastTime = (lastTime + timeInterval) % 24;
      if (lastTime < startHour) break;
      timeOptions.push({
        label: `${String(lastTime).padStart(2, '0')}:00`,
        fullLabel: `${String(lastTime).padStart(2, '0')}:00`,
        value: `${String(lastTime).padStart(2, '0')}:00`,
      });
    }

    setEndTimeOptions(timeOptions);
  };

  useEffect(() => {
    const getStartTimeOptions = (): undefined => {
      const timeOptions = [];
      for (let i = 0; i < 24; i++) {
        timeOptions.push({
          label: `${String(i).padStart(2, '0')}:00`,
          fullLabel: `${String(i).padStart(2, '0')}:00`,
          value: `${String(i).padStart(2, '0')}:00`,
        });
      }
      setStartTimeOptions(timeOptions);
    };

    getStartTimeOptions();
    getEndTimeOptions(initialStartTime, initialIntervalIndex);
  }, [initialIntervalIndex, initialStartTime, initialEndTime]);

  return (
    <View style={{ flex: 1 }}>
      <Formik
        enableReinitialize
        initialValues={{
          intervalValue: initialIntervalIndex,
          startTime: initialStartTime,
          endTime: initialEndTime,
        }}
        onSubmit={(values) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleNotificationCreation(values.intervalValue, values.startTime, values.endTime);
        }}
        validate={(values) => {
          const errors: Record<string, any> = {};
          const endHour = parseInt(values.endTime.split(':')[0]);
          const startHour = parseInt(values.startTime.split(':')[0]);
          if ((endHour - startHour) % values.intervalValue !== 0) {
            errors.endTime = true;
          }
          return errors;
        }}
      >
        {({ setFieldValue, handleSubmit, values, errors }) => (
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
                error={errors.intervalValue}
                initialSelected={[values.intervalValue]}
                onSave={(selectedOptions: number[]) => {
                  void setFieldValue('intervalValue', selectedOptions[0]);
                  getEndTimeOptions(values.startTime, selectedOptions[0]);
                }}
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
                  error={errors.startTime}
                  initialSelected={[values.startTime]}
                  onSave={(selectedOptions: string[] | string[]) => {
                    void setFieldValue('startTime', selectedOptions[0]);
                    getEndTimeOptions(selectedOptions[0], values.intervalValue);
                  }}
                  options={timeStartOptions}
                />
                <SelectBottomSheet
                  title={'Last reminder'}
                  multiple={false}
                  loading={loading}
                  error={errors.endTime}
                  options={timeEndOptions}
                  initialSelected={[values.endTime]}
                  onSave={(selectedOptions: number[]) => {
                    void setFieldValue('endTime', selectedOptions[0]);
                  }}
                />
              </View>
            </View>
            <View style={{ marginVertical: 10, width: '100%' }}>
              <Button
                title="Save"
                loading={loading}
                disabled={Object.keys(errors).length > 0}
                color={theme.colors.primary}
                onPress={() => {
                  handleSubmit();
                }}
              />
            </View>
          </View>
        )}
      </Formik>
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
