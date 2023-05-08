import React, { useEffect, useState } from 'react';
import { BottomSheet, Button, ListItem, Icon } from '@rneui/themed';

interface Props {
    initialSelected: number[];
    multiple: boolean;
    onSave: (days: number[]) => void;
}

interface Option {
    label: string;
    fullLabel: string;
    value: number;
}

export default function TimeSlotCard({ initialSelected = [], multiple, onSave }: Props) {
    const [isVisible, setIsVisible] = useState(false);
    const [selected, setSelected] = useState<number[]>(initialSelected);

    useEffect(() => {
        setSelected(initialSelected);
    }, [initialSelected]);

    const options = [
        { label: 'Mon', fullLabel: 'Monday', value: 2 },
        { label: 'Tue', fullLabel: 'Tuesday', value: 3 },
        { label: 'Wed', fullLabel: 'Wednesday', value: 4 },
        { label: 'Thu', fullLabel: 'Thursday', value: 5 },
        { label: 'Fri', fullLabel: 'Friday', value: 6 },
        { label: 'Sat', fullLabel: 'Saturday', value: 7 },
        { label: 'Sun', fullLabel: 'Sunday', value: 1 },
    ];

    const selectItem = (selectedIndex: number) => {
        if (selected.indexOf(selectedIndex) > -1) {
            const updatedSelectedList = selected.filter((o) => selectedIndex != o);
            setSelected(updatedSelectedList);
        } else {
            setSelected((prevState) => [...prevState, selectedIndex]);
        }
    };

    const handleSave = () => {
        onSave(selected);
        setIsVisible(false);
    };

    const getSelectedLabels = () => {
        const selectedLabels = options
            .filter((option: Option) => selected.indexOf(option.value) > -1)
            .map((option: Option) => option.label);
        return selectedLabels.join(', ');
    };

    return (
        <>
            <Button type="outline" onPress={() => setIsVisible(true)}>
                {getSelectedLabels()}
            </Button>
            <BottomSheet isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
                {options.map((option, i) => (
                    <ListItem key={i} onPress={() => selectItem(option.value)} bottomDivider>
                        {multiple && (
                            <ListItem.CheckBox
                                checked={selected.indexOf(option.value) > -1}
                                disabled={false}
                            />
                        )}
                        <ListItem.Content>
                            <ListItem.Title>{option.fullLabel}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
                <ListItem key={'cancel'} onPress={() => setIsVisible(false)} bottomDivider>
                    <Icon name="close" type="ionicons" />
                    <ListItem.Content>
                        <ListItem.Title>{'Cancel'}</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
                <ListItem key={'save'} onPress={handleSave}>
                    <Icon name="save" type="ionicons" />
                    <ListItem.Content>
                        <ListItem.Title>{'Save'}</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            </BottomSheet>
        </>
    );
}
