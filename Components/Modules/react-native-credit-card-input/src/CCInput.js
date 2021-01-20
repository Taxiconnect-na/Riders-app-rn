import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewPropTypes,
  Image,
} from 'react-native';
import Icons from './Icons';

const s = StyleSheet.create({
  baseInputStyle: {
    color: 'black',
    flex: 1,
  },
  icon: {
    width: 48,
    height: 40,
    resizeMode: 'contain',
    top: 3,
    left: 15,
  },
});

export default class CCInput extends Component {
  static propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    keyboardType: PropTypes.string,

    status: PropTypes.oneOf(['valid', 'invalid', 'incomplete']),

    containerStyle: ViewPropTypes.style,
    inputStyle: Text.propTypes.style,
    labelStyle: Text.propTypes.style,
    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    onFocus: PropTypes.func,
    onChange: PropTypes.func,
    onBecomeEmpty: PropTypes.func,
    onBecomeValid: PropTypes.func,
  };

  static defaultProps = {
    label: '',
    value: '',
    status: 'incomplete',
    keyboardType: 'numeric',
    containerStyle: {},
    inputStyle: {},
    labelStyle: {},
    onFocus: () => {},
    onChange: () => {},
    onBecomeEmpty: () => {},
    onBecomeValid: () => {},
  };

  UNSAFE_componentWillReceiveProps = (newProps) => {
    const {status, value, onBecomeEmpty, onBecomeValid, field} = this.props;
    const {status: newStatus, value: newValue} = newProps;

    if (value !== '' && newValue === '') onBecomeEmpty(field);
    if (status !== 'valid' && newStatus === 'valid') onBecomeValid(field);
  };

  focus = () => this.refs.input.focus();

  _onFocus = () => this.props.onFocus(this.props.field);
  _onChange = (value) => this.props.onChange(this.props.field, value);

  render() {
    const {
      label,
      value,
      placeholder,
      status,
      keyboardType,
      containerStyle,
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
    } = this.props;
    return (
      <TouchableOpacity onPress={this.focus} activeOpacity={0.99}>
        <View style={[containerStyle]}>
          {/number/i.test(placeholder) ? (
            <View>
              <Image
                style={s.icon}
                source={{uri: Icons[this.props._iconToShow()]}}
              />
            </View>
          ) : null}
          {!!label && <Text style={[labelStyle]}>{label}</Text>}
          <TextInput
            ref="input"
            keyboardType={keyboardType}
            autoCapitalise="words"
            autoCorrect={false}
            maxLength={
              /number/i.test(placeholder)
                ? 19
                : /MM\/YY/i.test(placeholder)
                ? 5
                : /CVV/i.test(placeholder)
                ? 3
                : 20
            }
            style={[
              s.baseInputStyle,
              inputStyle,
              validColor && status === 'valid'
                ? {color: validColor}
                : invalidColor && status === 'invalid'
                ? {color: invalidColor}
                : {},
            ]}
            underlineColorAndroid={'transparent'}
            placeholderColor={placeholderColor}
            placeholder={placeholder}
            value={value}
            onFocus={this._onFocus}
            onChangeText={this._onChange}
          />
        </View>
      </TouchableOpacity>
    );
  }
}
