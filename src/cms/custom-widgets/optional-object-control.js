/* eslint-disable */
import { ClassNames, css } from '@emotion/core';
import styled from '@emotion/styled';
import { fromJS, List as iList, Map as iMap } from 'immutable';
import { isEmpty, partial } from 'lodash';
import { colors, lengths, ListItemTopBar, ObjectWidgetTopBar } from 'netlify-cms-ui-default';
import NetlifyCmsWidgetObject from 'netlify-cms-widget-object';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import {
    getErrorMessageForTypedFieldAndValue,
    getTypedFieldForValue,
    resolveFieldKeyType,
    TYPES_KEY,
} from './typed-list-helpers';

function valueToString(value) {
    return value ? value.join(',').replace(/,([^\s]|$)/g, ', $1') : '';
}

const ObjectControl = NetlifyCmsWidgetObject.controlComponent;

const ListItem = styled.div();

const SortableListItem = SortableElement(ListItem);

const StyledListItemTopBar = styled(ListItemTopBar)`
    background-color: ${colors.textFieldBorder};
`;

const NestedObjectLabel = styled.div`
    display: ${props => (props.collapsed ? 'block' : 'none')};
    border-top: 0;
    color: ${props => (props.error ? colors.errorText : 'inherit')};
    background-color: ${colors.textFieldBorder};
    padding: 13px;
    border-radius: 0 0 ${lengths.borderRadius} ${lengths.borderRadius};
`;

const styleStrings = {
    collapsedObjectControl: `
    display: none;
  `,
    objectWidgetTopBarContainer: `
    padding: ${lengths.objectWidgetTopBarContainerPadding};
  `,
};

const styles = {
    listControlItem: css`
        margin-top: 18px;
        &:first-of-type {
            margin-top: 26px;
        }
    `,
    listControlItemCollapsed: css`
        padding-bottom: 0;
    `,
};

const SortableList = SortableContainer(({ items, renderItem }) => {
    return <div>{items.map(renderItem)}</div>;
});

const valueTypes = {
    SINGLE: 'SINGLE',
    MULTIPLE: 'MULTIPLE',
    MIXED: 'MIXED',
};

export default class OptionalObjectControl extends React.Component {
    static propTypes = {
        metadata: ImmutablePropTypes.map,
        onChange: PropTypes.func.isRequired,
        onChangeObject: PropTypes.func.isRequired,
        onValidateObject: PropTypes.func.isRequired,
        value: ImmutablePropTypes.list,
        field: PropTypes.object,
        forID: PropTypes.string,
        controlRef: PropTypes.func,
        mediaPaths: ImmutablePropTypes.map.isRequired,
        getAsset: PropTypes.func.isRequired,
        onOpenMediaLibrary: PropTypes.func.isRequired,
        onAddAsset: PropTypes.func.isRequired,
        onRemoveInsertedMedia: PropTypes.func.isRequired,
        classNameWrapper: PropTypes.string.isRequired,
        setActiveStyle: PropTypes.func.isRequired,
        setInactiveStyle: PropTypes.func.isRequired,
        editorControl: PropTypes.func.isRequired,
        resolveWidget: PropTypes.func.isRequired,
        clearFieldErrors: PropTypes.func.isRequired,
        fieldsErrors: ImmutablePropTypes.map.isRequired,
    };
    static defaultProps = {
        value: iList(),
    };
    validations = [];
    getValueType = () => {
        const { field } = this.props;
        if (field.get('fields')) {
            return valueTypes.MULTIPLE;
        }
        if (field.get('field')) {
            return valueTypes.SINGLE;
        }
        if (field.get(TYPES_KEY)) {
            return valueTypes.MIXED;
        }
        return null;
    };
    handleChange = e => {
        const { onChange } = this.props;
        const oldValue = this.state.value;
        const newValue = e.target.value;
        const listValue = e.target.value.split(',');
        if (newValue.match(/,$/) && oldValue.match(/, $/)) {
            listValue.pop();
        }

        const parsedValue = valueToString(listValue);
        this.setState({ value: parsedValue });
        onChange(iList(listValue.map(val => val.trim())));
    };
    handleFocus = () => {
        this.props.setActiveStyle();
    };
    handleBlur = e => {
        const listValue = e.target.value
            .split(',')
            .map(el => el.trim())
            .filter(el => el);
        this.setState({ value: valueToString(listValue) });
        this.props.setInactiveStyle();
    };
    handleAdd = e => {
        e.preventDefault();
        const { value, onChange, field } = this.props;
        const parsedValue =
            this.getValueType() === valueTypes.SINGLE
                ? this.singleDefault()
                : fromJS(this.multipleDefault(field.get('fields')));
        this.setState({ itemsCollapsed: this.state.itemsCollapsed.push(false) });
        onChange((value || iList()).push(parsedValue));
    };
    singleDefault = () => {
        return this.props.field.getIn(['field', 'default'], null);
    };
    multipleDefault = fields => {
        return this.getFieldsDefault(fields);
    };
    handleAddType = (type, typeKey) => {
        const { value, onChange } = this.props;
        const parsedValue = fromJS(this.mixedDefault(typeKey, type));
        this.setState({ itemsCollapsed: this.state.itemsCollapsed.push(false) });
        onChange((value || iList()).push(parsedValue));
    };
    mixedDefault = (typeKey, type) => {
        const selectedType = this.props.field.get(TYPES_KEY).find(f => f.get('name') === type);
        const fields = selectedType.get('fields') || [selectedType.get('field')];

        return this.getFieldsDefault(fields, { [typeKey]: type });
    };
    getFieldsDefault = (fields, initialValue = {}) => {
        return fields.reduce((acc, item) => {
            const subfields = item.get('field') || item.get('fields');
            const object = item.get('widget') === 'object';
            const name = item.get('name');
            const defaultValue = item.get('default', null);

            if (iList.isList(subfields) && object) {
                const subDefaultValue = this.getFieldsDefault(subfields);
                if (!isEmpty(subDefaultValue)) {
                    acc[name] = subDefaultValue;
                }
                return acc;
            }

            if (iMap.isMap(subfields) && object) {
                const subDefaultValue = this.getFieldsDefault([subfields]);
                if (!isEmpty(subDefaultValue)) {
                    acc[name] = subDefaultValue;
                }
                return acc;
            }

            if (defaultValue !== null) {
                acc[name] = defaultValue;
            }

            return acc;
        }, initialValue);
    };
    processControlRef = ref => {
        if (!ref) {
            return;
        }
        this.validations.push(ref.validate);
    };
    validate = () => {
        this.validations.forEach(validateListItem => {
            validateListItem();
        });
    };
    /**
     * In case the `onChangeObject` function is frozen by a child widget implementation,
     * e.g. when debounced, always get the latest object value instead of using
     * `this.props.value` directly.
     */
    getObjectValue = idx => this.props.value.get(idx) || iMap();
    handleRemove = (index, event) => {
        event.preventDefault();
        const { itemsCollapsed } = this.state;
        const { value, metadata, onChange, field, clearFieldErrors } = this.props;
        const collectionName = field.get('name');
        const isSingleField = this.getValueType() === valueTypes.SINGLE;

        const metadataRemovePath = isSingleField ? value.get(index) : value.get(index).valueSeq();
        const parsedMetadata = metadata && {
            [collectionName]: metadata.removeIn(metadataRemovePath),
        };

        // Removed item object index is the last item in the list
        const removedItemIndex = value.count() - 1;

        this.setState({ itemsCollapsed: itemsCollapsed.delete(index) });

        onChange(value.remove(index), parsedMetadata);
        clearFieldErrors();

        // Remove deleted item object validation
        if (this.validations) {
            this.validations.splice(removedItemIndex, 1);
        }
    };
    handleItemCollapseToggle = (index, event) => {
        event.preventDefault();
        const { itemsCollapsed } = this.state;
        const collapsed = itemsCollapsed.get(index);
        this.setState({ itemsCollapsed: itemsCollapsed.set(index, !collapsed) });
    };
    handleCollapseAllToggle = e => {
        e.preventDefault();
        const { value } = this.props;
        const { itemsCollapsed } = this.state;
        const allItemsCollapsed = itemsCollapsed.every(val => val === true);
        this.setState({
            itemsCollapsed: iList(Array(value.size).fill(!allItemsCollapsed)),
        });
    };
    onSortEnd = ({ oldIndex, newIndex }) => {
        const { value } = this.props;
        const { itemsCollapsed } = this.state;

        // Update value
        const item = value.get(oldIndex);
        const newValue = value.delete(oldIndex).insert(newIndex, item);
        this.props.onChange(newValue);

        // Update collapsing
        const collapsed = itemsCollapsed.get(oldIndex);
        const updatedItemsCollapsed = itemsCollapsed.delete(oldIndex).insert(newIndex, collapsed);
        this.setState({ itemsCollapsed: updatedItemsCollapsed });
    };
    // eslint-disable-next-line react/display-name
    renderItem = (item, index) => {
        const {
            classNameWrapper,
            editorControl,
            onValidateObject,
            metadata,
            clearFieldErrors,
            fieldsErrors,
            controlRef,
            resolveWidget,
        } = this.props;

        const { itemsCollapsed } = this.state;
        const collapsed = itemsCollapsed.get(index);
        let { field } = this.props;

        if (this.getValueType() === valueTypes.MIXED) {
            field = getTypedFieldForValue(field, item);
            if (!field) {
                return this.renderErroneousTypedItem(index, item);
            }
        }

        return (
            <SortableListItem
                css={[styles.listControlItem, collapsed && styles.listControlItemCollapsed]}
                index={index}
                key={`item-${index}`}
            >
                <StyledListItemTopBar
                    collapsed={collapsed}
                    onCollapseToggle={partial(this.handleItemCollapseToggle, index)}
                    onRemove={partial(this.handleRemove, index)}
                    dragHandleHOC={SortableHandle}
                />
                <NestedObjectLabel collapsed={collapsed}>{this.objectLabel(item)}</NestedObjectLabel>
                <ClassNames>
                    {({ css, cx }) => (
                        <ObjectControl
                            classNameWrapper={cx(classNameWrapper, {
                                [css`
                                    ${styleStrings.collapsedObjectControl};
                                `]: collapsed,
                            })}
                            value={item}
                            field={field}
                            onChangeObject={this.handleChangeFor(index)}
                            editorControl={editorControl}
                            resolveWidget={resolveWidget}
                            metadata={metadata}
                            forList
                            onValidateObject={onValidateObject}
                            clearFieldErrors={clearFieldErrors}
                            fieldsErrors={fieldsErrors}
                            ref={this.processControlRef}
                            controlRef={controlRef}
                        />
                    )}
                </ClassNames>
            </SortableListItem>
        );
    };

    constructor(props) {
        super(props);
        const { field, value } = props;
        const allItemsCollapsed = field.get('collapsed', true);
        const itemsCollapsed = value && Array(value.size).fill(allItemsCollapsed);

        this.state = {
            itemsCollapsed: iList(itemsCollapsed),
            value: valueToString(value),
        };
    }

    /**
     * Always update so that each nested widget has the option to update. This is
     * required because ControlHOC provides a default `shouldComponentUpdate`
     * which only updates if the value changes, but every widget must be allowed
     * to override this.
     */
    shouldComponentUpdate() {
        return true;
    }

    handleChangeFor(index) {
        return (fieldName, newValue, newMetadata) => {
            const { value, metadata, onChange, field } = this.props;
            const collectionName = field.get('name');
            const listFieldObjectWidget = field.getIn(['field', 'widget']) === 'object';
            const withNameKey =
                this.getValueType() !== valueTypes.SINGLE ||
                (this.getValueType() === valueTypes.SINGLE && listFieldObjectWidget);
            const newObjectValue = withNameKey ? this.getObjectValue(index).set(fieldName, newValue) : newValue;
            const parsedMetadata = {
                [collectionName]: Object.assign(metadata ? metadata.toJS() : {}, newMetadata || {}),
            };
            onChange(value.set(index, newObjectValue), parsedMetadata);
        };
    }

    objectLabel(item) {
        const { field } = this.props;
        if (this.getValueType() === valueTypes.MIXED) {
            return getTypedFieldForValue(field, item).get('label', field.get('name'));
        }
        const multiFields = field.get('fields');
        const singleField = field.get('field');
        const labelField = (multiFields && multiFields.first()) || singleField;

        if (!item) {
            return `No ${labelField.get('name')}`;
        }

        const value = multiFields ? item.get(multiFields.first().get('name')) : singleField.get('label');
        return (value || `No ${labelField.get('name')}`).toString();
    }

    renderErroneousTypedItem(index, item) {
        const { field } = this.props;
        const errorMessage = getErrorMessageForTypedFieldAndValue(field, item);
        return (
            <SortableListItem
                css={[styles.listControlItem, styles.listControlItemCollapsed]}
                index={index}
                key={`item-${index}`}
            >
                <StyledListItemTopBar
                    onCollapseToggle={null}
                    onRemove={partial(this.handleRemove, index)}
                    dragHandleHOC={SortableHandle}
                />
                <NestedObjectLabel collapsed error>
                    {errorMessage}
                </NestedObjectLabel>
            </SortableListItem>
        );
    }

    renderListControl() {
        const { value, forID, field, classNameWrapper } = this.props;
        const { itemsCollapsed } = this.state;
        const items = value || iList();
        const label = field.get('label', field.get('name'));
        const labelSingular = field.get('label_singular') || field.get('label', field.get('name'));
        const listLabel = items.size === 1 ? labelSingular.toLowerCase() : label.toLowerCase();

        const allowAdd = !items || !items.size;

        return (
            <ClassNames>
                {({ cx, css }) => (
                    <div
                        id={forID}
                        className={cx(
                            classNameWrapper,
                            css`
                                ${styleStrings.objectWidgetTopBarContainer}
                            `
                        )}
                    >
                        <ObjectWidgetTopBar
                            allowAdd={allowAdd}
                            onAdd={this.handleAdd}
                            types={field.get(TYPES_KEY, null)}
                            onAddType={type => this.handleAddType(type, resolveFieldKeyType(field))}
                            heading={`${items.size} ${listLabel}`}
                            label={labelSingular.toLowerCase()}
                            onCollapseToggle={this.handleCollapseAllToggle}
                            collapsed={itemsCollapsed.every(val => val === true)}
                        />
                        <SortableList
                            items={items}
                            renderItem={this.renderItem}
                            onSortEnd={this.onSortEnd}
                            useDragHandle
                            lockAxis="y"
                        />
                    </div>
                )}
            </ClassNames>
        );
    }

    renderInput() {
        const { forID, classNameWrapper } = this.props;
        const { value } = this.state;

        return (
            <input
                type="text"
                id={forID}
                value={value}
                onChange={this.handleChange}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                className={classNameWrapper}
            />
        );
    }

    render() {
        if (this.getValueType() !== null) {
            return this.renderListControl();
        }
        return this.renderInput();
    }
}
