/* eslint-disable prettier/prettier */
import React from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';
import flagsIco from './Assets/FlagImagesRessources';
import {systemWeights} from 'react-native-typography';

class ItemFlag extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func handleSelectedCountryCode()
   * Responsible for updating the state when a country is selected and all the animations in between.
   */
  handleSelectedCountryCode(parentScreen, selectedCountryData) {
    parentScreen.dismissCountrySearcher();
    parentScreen.state.countryCodeSelected = selectedCountryData.code
      .trim()
      .toUpperCase();
    parentScreen.state.countryPhoneCode = selectedCountryData.dial_code.trim();
    parentScreen.state.defaultButtonFlag =
      flagsIco[selectedCountryData.code.trim().toUpperCase()];
    //Close the country searcher
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.parentScreen.dismissCountrySearcher(
            this.props.country.code.trim().toUpperCase(),
            this.props.country.dial_code.trim(),
          )
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingBottom: this.props.country.name === 'Zimbabwe' ? '30%' : 10,
          marginBottom: 5,
        }}>
        <View
          style={{
            width: 50,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 10,
          }}>
          <Image
            source={flagsIco[this.props.country.code.toUpperCase()]}
            style={{transform: [{scale: 0.5}]}}
          />
        </View>
        <View style={[{paddingLeft: 5}]}>
          <Text
            style={[
              systemWeights.regular,
              {fontFamily: 'Allrounder-Grotesk-Regular', fontSize: 14.5},
            ]}>
            {this.props.country.name} ({this.props.country.dial_code})
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default ItemFlag;
