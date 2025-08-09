import React, { useMemo, useEffect, useRef } from 'react';

export default function FormSelect({
    modelValue = '',
    choices = [],
    placeholder = '',
    multiple = false,
    locked = false,
    inputSize = '',
    inputStyle = '',
    onChange = () => {},
}) {
    const selectRef = useRef(null);

    // Compute localChoices
    const localChoices = useMemo(() => {
        const items = [];

        // Placeholder option
        if (placeholder !== '') {
            items.push({
                label: placeholder,
                key: 'placeholder',
                inputAttributes: {
                    value: '',
                    selected: true,
                },
            });
        }

        choices.forEach(choice => {
            // Ensure choice is an object and has required properties
            if (typeof choice !== 'object' || choice === null) {
                return;
            }

            const { label, value, id, ...attributes } = choice;

            let selected;
            if (Array.isArray(modelValue)) {
                selected = modelValue.includes(value) && placeholder === '';
            } else {
                selected = modelValue === value && placeholder === '';
            }

            // Only set selected if it wasn't explicitly provided in attributes
            if (typeof attributes.selected !== 'undefined') {
                attributes.selected = selected;
            }

            items.push({
                label,
                key: id ?? value,
                inputAttributes: {
                    value,
                    selected,
                    ...attributes,
                },
            });
        });

        return items;
    }, [choices, modelValue, placeholder]);

    // domValue (for single or multiple)
    const domValue = useMemo(() => {
        if (multiple) {
            return Array.isArray(modelValue) ? modelValue : [];
        }
        return modelValue;
    }, [modelValue, multiple]);

    // Watch localChoices for auto-select logic
    useEffect(() => {
        // For single
        if (modelValue === '' && localChoices.length !== 0) {
            const choice = localChoices.find(({ inputAttributes: { selected } }) => selected);
            const selectValue =
                choice?.inputAttributes.value ?? localChoices[0].inputAttributes.value;
            onChange(selectValue);
        }
        // For multiple
        if (
            multiple &&
            Array.isArray(modelValue) &&
            modelValue.length === 0 &&
            localChoices.length !== 0
        ) {
            const selectValue = localChoices
                .filter(({ inputAttributes: { selected } }) => selected)
                .map(({ inputAttributes }) => inputAttributes.value);
            onChange(selectValue);
        }
    }, [localChoices, modelValue, multiple, onChange]);

    // Handle change event
    function handleUpdate(e) {
        if (multiple) {
            // Get selected options for multi-select
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            onChange(selected);
        } else {
            onChange(e.target.value);
        }
    }

    // Input size/style to classes
    const selectClasses = [
        'form-field-textual form-field-select',
        inputSize === 'extraSmall' && 'form-field-textual--xs',
        inputSize === 'small' && 'form-field-textual--s',
        inputSize === 'medium' && 'form-field-textual--m',
        inputStyle === 'bare' && 'form-field-textual--bare',
        locked && 'icon_background--s icon--lock',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <select
            ref={selectRef}
            className={selectClasses}
            disabled={locked} 
            value={multiple ? undefined : domValue}
            multiple={multiple}
            onChange={handleUpdate}
        >
            {localChoices.map(({ key, label, inputAttributes }) => (
                <option key={key} value={inputAttributes.value} {...inputAttributes}>
                    {label}
                </option>
            ))}
        </select>
    );
}
