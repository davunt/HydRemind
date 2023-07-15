import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useTheme, Button, ListItem } from '@rneui/themed';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Icon } from '@rneui/base';
import { ScrollView } from 'react-native';

interface Props {
    title: string;
    initialSelected: number[];
    multiple: boolean;
    loading: boolean;
    onSave: (selectedOptions: number[]) => void;
    options: {
        label: string;
        fullLabel: string;
        value: number;
    }[];
}

interface Option {
    label: string;
    fullLabel: string;
    value: number;
}

export default function TimeSlotCard({
    title,
    initialSelected = [],
    multiple,
    loading,
    onSave,
    options,
}: Props) {
    const { theme } = useTheme();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const refScrollView = useRef<ScrollView>(null);

    const bottomSheetSnapPoints = useMemo(() => ['60%'], []);

    const [listOptions, setListOptions] = useState<Option[]>(options);
    const [selected, setSelected] = useState<number[]>(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const handleSheetChanges = (index: number) => {
        if (index < 0) handleSave(); // if sheet hidden
        else {
            const values = listOptions.map(({ value }) => value);
            const scrollYPosition = 66 * (values.indexOf(selected[0]) - 2);
            refScrollView.current?.scrollTo({
                x: 0,
                y: scrollYPosition,
                animated: true,
            });
        }
    };

    useEffect(() => {
        setListOptions(options);
    }, [options]);

    const selectItem = (selectedIndex: number) => {
        console.log(selectedIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (multiple) {
            if (selected.indexOf(selectedIndex) > -1) {
                const updatedSelectedList = selected.filter((o) => selectedIndex != o);
                setSelected(updatedSelectedList);
            } else {
                setSelected((prevState) => [...prevState, selectedIndex]);
            }
        } else {
            setSelected([selectedIndex]);
        }
    };

    const handleSave = () => {
        console.log('=+>', selected);
        onSave(selected);
    };

    const getSelectedLabels = () => {
        if (listOptions) {
            const selectedLabels = listOptions
                .filter((option: Option) => selected.indexOf(option.value) > -1)
                .map((option: Option) => option.label);
            console.log('lab', selectedLabels);
            if (selectedLabels.length > 0) return selectedLabels.join(', ');
            else {
                return '...';
            }
        }
    };

    return (
        <>
            <Button
                type="outline"
                onPress={() => {
                    bottomSheetModalRef.current?.present();
                }}
                loading={loading}
                containerStyle={{ flex: 1, marginHorizontal: 5 }}
            >
                {getSelectedLabels()}
            </Button>
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
                <BottomSheetScrollView ref={refScrollView}>
                    {listOptions &&
                        listOptions.map((option: Option, i) => (
                            <ListItem
                                key={i}
                                onPress={() => selectItem(option.value)}
                                bottomDivider
                                containerStyle={{ backgroundColor: theme.colors.white }}
                            >
                                {selected.indexOf(option.value) > -1 ? (
                                    <Icon
                                        name="checkmark-circle-outline"
                                        type="ionicon"
                                        color={theme.colors.primary}
                                    />
                                ) : (
                                    <Icon
                                        name="ellipse-outline"
                                        type="ionicon"
                                        color={theme.colors.black}
                                    />
                                )}
                                <ListItem.Content>
                                    <ListItem.Subtitle>{option.fullLabel}</ListItem.Subtitle>
                                </ListItem.Content>
                            </ListItem>
                        ))}
                </BottomSheetScrollView>
            </BottomSheetModal>
        </>
    );
}
