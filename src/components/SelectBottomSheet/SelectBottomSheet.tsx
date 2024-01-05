import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useTheme, Button, ListItem } from '@rneui/themed';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Icon } from '@rneui/base';
import { View, FlatList } from 'react-native';

interface Option {
  label: string;
  fullLabel: string;
  value: string | number;
}

interface Props {
  title: string;
  initialSelected: any[];
  multiple: boolean;
  loading: boolean;
  error: string | undefined;
  onSave: (selectedOptions: any[]) => void;
  options: Option[] | undefined;
}

export default function TimeSlotCard({
  title,
  initialSelected = [],
  multiple,
  loading,
  onSave,
  options,
  error,
}: Props): React.ReactElement {
  const { theme } = useTheme();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const bottomSheetSnapPoints = useMemo(() => ['60%'], []);

  const [listOptions, setListOptions] = useState<Option[] | undefined>(options);
  const [selected, setSelected] = useState<any[]>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    setListOptions(options);
  }, [options]);

  const handleSave = (): undefined => {
    onSave(selected);
  };

  const handleSheetChanges = (index: number): undefined => {
    if (index < 0) handleSave(); // if sheet hidden
  };

  const selectItem = (selectedIndex: string | number): undefined => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (multiple) {
      if (selected.includes(selectedIndex)) {
        const updatedSelectedList = selected.filter((o) => selectedIndex !== o);
        setSelected(updatedSelectedList);
      } else {
        setSelected((prevState) => [...prevState, selectedIndex]);
      }
    } else {
      setSelected([selectedIndex]);
    }
  };

  const getSelectedLabels = (): string => {
    if (Array.isArray(listOptions)) {
      const selectedLabels = listOptions
        .filter((option: Option) => selected.includes(option.value))
        .map((option: Option) => option.label);
      if (selectedLabels.length > 0) return selectedLabels.join(', ');
      else return '...';
    } else return '...';
  };

  const getItemLayout = (
    data: Option[] | null | undefined,
    index: number
  ): { length: number; offset: number; index: number } => {
    return { length: 60, offset: 60 * index, index };
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexGrow: 1 }}>
        <Button
          type="outline"
          onPress={() => {
            bottomSheetModalRef.current?.present();
          }}
          loading={loading}
          buttonStyle={{
            borderColor: error != null ? theme.colors.error : theme.colors.primary,
          }}
          titleStyle={{ color: error != null ? theme.colors.error : theme.colors.primary }}
          containerStyle={{
            flexGrow: 1,
            marginHorizontal: 5,
          }}
        >
          {getSelectedLabels()}
        </Button>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enablePanDownToClose={true}
        index={0}
        snapPoints={bottomSheetSnapPoints}
        onChange={handleSheetChanges}
        handleStyle={{ backgroundColor: theme.colors.white }}
        backgroundStyle={{ backgroundColor: theme.colors.white }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.black }}
      >
        <FlatList
          data={listOptions}
          initialScrollIndex={
            Array.isArray(listOptions) && listOptions.length > 10
              ? listOptions.findIndex((option) => option.value === selected[0])
              : 0
          }
          // @ts-expect-error getItemLayout is an available override function 
          getItemLayout={getItemLayout}
          stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <ListItem
              key={'title'}
              bottomDivider
              containerStyle={{
                backgroundColor: theme.colors.white,
              }}
            >
              <ListItem.Content>
                <ListItem.Title style={{ fontWeight: 'bold' }}>{title}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          }
          renderItem={({ item, index }) => (
            <ListItem
              key={index}
              onPress={() => {
                selectItem(item.value);
              }}
              bottomDivider
              containerStyle={{ backgroundColor: theme.colors.white }}
            >
              {selected.includes(item.value) ? (
                <Icon name="checkmark-circle-outline" type="ionicon" color={theme.colors.primary} />
              ) : (
                <Icon name="ellipse-outline" type="ionicon" color={theme.colors.black} />
              )}
              <ListItem.Content>
                <ListItem.Subtitle>{item.fullLabel}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          )}
          keyExtractor={(item, index) => `${title}${index}`}
        />
      </BottomSheetModal>
    </View>
  );
}
