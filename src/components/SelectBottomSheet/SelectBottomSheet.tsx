import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useTheme, Button, ListItem } from '@rneui/themed';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

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

    const bottomSheetSnapPoints = useMemo(() => ['75%', '90%'], []);

    const [selected, setSelected] = useState<number[]>(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const handleSheetChanges = (index: number) => {
        if (index < 0) handleSave(); // if sheet hidden
    };

    const selectItem = (selectedIndex: number) => {
        console.log(selectedIndex);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (selected.indexOf(selectedIndex) > -1) {
            const updatedSelectedList = selected.filter((o) => selectedIndex != o);
            setSelected(updatedSelectedList);
        } else {
            setSelected((prevState) => [...prevState, selectedIndex]);
        }
    };

    const handleSave = () => {
        onSave(selected);
    };

    const getSelectedLabels = () => {
        const selectedLabels = options
            .filter((option: Option) => selected.indexOf(option.value) > -1)
            .map((option: Option) => option.label);
        return selectedLabels.join(', ');
    };

    return (
        <>
            <Button
                type="outline"
                onPress={() => bottomSheetModalRef.current?.present()}
                loading={loading}
                containerStyle={{ flex: 1 }}
            >
                {getSelectedLabels()}
            </Button>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                enablePanDownToClose={true}
                index={0}
                snapPoints={bottomSheetSnapPoints}
                onChange={handleSheetChanges}
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
                {options.map((option: Option, i) => (
                    <ListItem
                        key={i}
                        onPress={() => selectItem(option.value)}
                        bottomDivider
                        containerStyle={{ backgroundColor: theme.colors.white }}
                    >
                        {multiple && (
                            <ListItem.CheckBox
                                checked={selected.indexOf(option.value) > -1}
                                disabled={false}
                            />
                        )}
                        <ListItem.Content>
                            <ListItem.Subtitle>{option.fullLabel}</ListItem.Subtitle>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </BottomSheetModal>
        </>
    );
}
