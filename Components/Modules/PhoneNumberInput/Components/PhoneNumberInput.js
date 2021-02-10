/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SectionList,
  View,
  Text,
  TextInput,
  Image,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  Keyboard,
  BackHandler,
} from 'react-native';
import examples from 'libphonenumber-js/examples.mobile.json';
import {getExampleNumber, AsYouType} from 'libphonenumber-js';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import flagsIco from './Assets/FlagImagesRessources';
import countriesDialData from './Assets/countryEmojis';
import ItemFlag from './ItemFlag';
import {
  ShowCountryFilterHeader,
  RenderCountryPhoneCodeSearcher,
  UpdateCountryCodeFormatAfterSelect,
  UpdateDialDataORQueryTyped,
  UpdateErrorMessagesStateInputRecDelivery,
} from '../../../Redux/HomeActionsCreators';
import {RFValue} from 'react-native-responsive-fontsize';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

class PhoneNumberInput extends React.PureComponent {
  constructor(props) {
    super(props);

    //Initialize emojis data
    this.props.App.countriesDialDataState = countriesDialData;

    this.state = {
      selection: {
        start: 0,
        end: 0,
      },
    };
  }

  /**
   * @func updateCountryFormat()
   * Responsible for automatically filling the correct format based on the  current selected country after or before selecting
   * a sepcific country.
   * And also update the flag at the entrance button.
   * Also get and update the country's phone code.
   * (Phone number example format)
   */
  updateCountryFormat() {
    //Update flag to format
    if (
      this.props.App.countryCodeSelected !== undefined &&
      this.props.App.countryCodeSelected !== null
    ) {
      let placeholder = getExampleNumber(
        this.props.App.countryCodeSelected.toUpperCase(),
        examples,
      );
      let callingCode = '+' + placeholder.countryCallingCode;
      placeholder = placeholder.formatNational();
      this.props.UpdateCountryCodeFormatAfterSelect({
        phoneNumberPlaceholder: placeholder,
        countryPhoneCode: callingCode,
        dynamicMaxLength: placeholder.length,
      });
    } //Invliad country code - default placeholder: Phone number
    else {
      this.props.UpdateCountryCodeFormatAfterSelect({
        phoneNumberPlaceholder: 'Phone number',
        countryPhoneCode: '+264',
        dynamicMaxLength: 10,
      });
    }
  }

  /**
   * @func updateSearchedQueryCountry()
   * Responsible to filter the list of countries and update the state, only if a word is entered.
   */
  updateSearchedQueryCountry(query) {
    this.props.UpdateDialDataORQueryTyped({
      action: 'updateQueryTyped',
      typedCountrySearchQuery: query,
    }); //Update textinput value

    if (query.trim().length > 0) {
      query = query.trim();
      let bestResultsArray = [];
      countriesDialData.map((country) => {
        //Search in the data as well if the title match
        let tmpCountry = {title: country.title, data: []};
        country.data.map((item) => {
          if (item.name.trim().toLowerCase().includes(query.toLowerCase())) {
            //Match
            tmpCountry.data.push(item);
          }
        });
        if (tmpCountry.data.length > 0) {
          //Save best result found so far
          bestResultsArray.push(tmpCountry);
        }
      });
      //Update state
      this.props.UpdateDialDataORQueryTyped({
        action: 'updateDialData',
        countriesDialDataState: bestResultsArray,
      });
    } //Reset to default list if changed
    else {
      if (
        this.props.App.countriesDialDataState.length !==
        countriesDialData.length
      ) {
        this.props.UpdateDialDataORQueryTyped({
          action: 'resetAll',
          countriesDialDataStateInvariant: countriesDialData,
        });
      }
    }
  }

  /**
   * @func renderHeaderCountryCodeSearcher()
   * Responsible for rendering the header of the country searcher (nromal or filter mode)
   */
  renderHeaderCountryCodeSearcher() {
    if (this.props.App.isFilterCountryShown) {
      //Show filter
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => this.showFilterHeader(false)}
            style={{
              width: 38,
              height: 50,
              justifyContent: 'center',
            }}>
            <IconAnt name="arrowleft" color={'#fff'} size={23} />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <TextInput
              placeholderTextColor="#AFAFAF"
              placeholder="Search your country"
              placeholderTextColor="#a2a2a2"
              autoCorrect={false}
              autoFocus={true}
              onChangeText={(text) => this.updateSearchedQueryCountry(text)}
              value={this.props.App.typedCountrySearchQuery}
              maxLength={25}
              style={[
                {
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(18),
                  color: '#fff',
                },
              ]}
            />
          </View>
          {this.props.App.typedCountrySearchQuery.length > 0 ? (
            <TouchableOpacity
              onPressIn={() =>
                this.props.UpdateDialDataORQueryTyped({
                  action: 'resetAll',
                  countriesDialDataStateInvariant: countriesDialData,
                })
              }
              style={{
                alignItems: 'center',
                borderWidth: 1,
                justifyContent: 'center',
                padding: 10,
              }}>
              <IconAnt name="close" size={23} color={'#fff'} />
            </TouchableOpacity>
          ) : null}
        </View>
      );
    } //SHow normal header
    else {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() =>
              this.dismissCountrySearcher(
                this.props.App.countryCodeSelected,
                this.props.App.countryPhoneCode,
              )
            }
            style={{
              width: 38,
              height: 50,
              justifyContent: 'center',
            }}>
            <IconAnt name="arrowleft" color={'#fff'} size={23} />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <Text
              style={[
                {
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(20),
                  color: '#fff',
                },
              ]}>
              Select your country
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.showFilterHeader(true)}
            style={{
              alignItems: 'center',
              borderWidth: 1,
              justifyContent: 'center',
              padding: 10,
            }}>
            <IconAnt name="search1" size={23} color={'#fff'} />
          </TouchableOpacity>
        </View>
      );
    }
  }

  /**
   * @func showOrHideFilterHeader()
   * @param stateScreen: to determing if to show (true) or to hide (false)
   * Responsible for showing or hiding the country search bar of the country search screen.
   */
  showFilterHeader(stateScreen) {
    if (stateScreen) {
      //Show
      this.props.ShowCountryFilterHeader(true);
    } //Hide
    else {
      this.props.ShowCountryFilterHeader(false);
    }
  }

  /**
   * @func renderCountryCodeSeacher()
   * Responsible for rendering the country code searcher screen if needed by the user, and handle all the animations in between
   */
  renderCountryCodeSeacher() {
    if (this.props.App.renderCountryCodeSeacher) {
      return (
        <Animated.View
          style={{
            zIndex: 900000000,
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: windowWidth,
            height: windowHeight,
            flex: 1,
            opacity: this.props.App.searchCountryScreenOpacity,
            transform: [
              {translateY: this.props.App.searchCountryScreenPosition},
            ],
            backgroundColor: '#fff',
          }}>
          <View
            style={{
              backgroundColor: '#000',
              paddingTop: Platform.OS === 'android' ? '7%' : '21%',
              minHeight: 75,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 10,
              justifyContent: 'center',
            }}>
            {this.renderHeaderCountryCodeSearcher()}
          </View>
          <View>
            <SectionList
              sections={
                this.props.App.countriesDialDataState !== undefined &&
                this.props.App.countriesDialDataState !== null
                  ? this.props.App.countriesDialDataState
                  : countriesDialData
              }
              initialNumToRender={15}
              keyboardShouldPersistTaps={'always'}
              maxToRenderPerBatch={35}
              windowSize={61}
              updateCellsBatchingPeriod={10}
              keyExtractor={(item, index) => item + index}
              renderItem={({item}) => (
                <ItemFlag country={item} parentScreen={this} />
              )}
              renderSectionHeader={({section: {title}}) => (
                <View
                  style={{
                    padding: 20,
                    backgroundColor: '#f6f6f6',
                    marginBottom: 5,
                  }}>
                  <Text
                    style={[
                      {
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                        fontSize: RFValue(16),
                        color: '#797979',
                      },
                    ]}>
                    {title}
                  </Text>
                </View>
              )}
            />
          </View>
        </Animated.View>
      );
    } else {
      return null;
    }
  }

  componentDidMount() {
    let globalObject = this;
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.dismissCountrySearcher();
      },
    );
  }

  UNSAFE_componentWillMount() {
    this.updateCountryFormat();
  }

  /**
   * @func dismissCountrySearcher()
   * Responsible for closing the country searcher and resetting global variables.
   * Native driver as much as possible!
   */
  dismissCountrySearcher(countryCode, countryDial) {
    let globalObject = this;
    Animated.parallel([
      Animated.timing(this.props.App.searchCountryScreenOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      Animated.timing(this.props.App.searchCountryScreenPosition, {
        toValue: 200,
        duration: 250,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
    ]).start(() => {
      //Reset search values
      /*globalObject.setState({
        renderCountryCodeSeacher: false,
        countriesDialDataState: countriesDialData,
        typedCountrySearchQuery: '',
        countryCodeSelected: countryCode,
        countryPhoneCode: countryDial,
        isFilterCountryShown: false,
      });*/
      globalObject.props.App.renderCountryCodeSeacher = false;
      globalObject.props.App.countriesDialDataState = countriesDialData;
      globalObject.props.App.typedCountrySearchQuery = '';
      globalObject.props.App.countryCodeSelected = countryCode;
      globalObject.props.App.countryPhoneCode = countryDial;
      globalObject.props.App.isFilterCountryShown = false;
      //Update formats and placeholders
      globalObject.updateCountryFormat();
    });
  }

  /**
   * @func openCountrySearcherScreen()
   * Responsible for opening up the country code searcher and all the animations in between.
   */
  openCountrySearcherScreen() {
    //? Dismiss the keyboard initially
    Keyboard.dismiss();
    //? ---
    let globalObject = this;
    this.props.RenderCountryPhoneCodeSearcher(true);
    Animated.parallel([
      Animated.timing(this.props.App.searchCountryScreenOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
      Animated.timing(this.props.App.searchCountryScreenPosition, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }),
    ]).start();
  }

  /**
   * @func handleSelectionChange
   * Responsible for
   * selection is an object: { start:number, end:number }
   */
  handleSelectionChange = ({nativeEvent: {selection}}) =>
    this.setState({selection});

  render() {
    return (
      <>
        <View style={{flexDirection: 'row', width: '100%'}}>
          <TouchableOpacity
            onPress={() => this.openCountrySearcherScreen()}
            style={{
              borderWidth: 1,
              borderColor: '#fff',
              borderRadius: 2,
              backgroundColor: '#fff',
              width: 125,
              paddingLeft: 0,
              flexDirection: 'row',
            }}>
            <View
              style={{
                width: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={flagsIco[this.props.App.countryCodeSelected]}
                style={{borderRadius: 5, transform: [{scale: 0.5}]}}
              />
            </View>
            <View
              style={{
                flex: 1,
                width: 60,
                right: 7,
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <IconMaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color={'#a2a2a2'}
              />
              <Text
                style={[
                  {
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(21),
                    left: 2,
                  },
                ]}>
                {this.props.App.countryPhoneCode}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{flex: 1}}>
            <TextInput
              placeholderTextColor="#AFAFAF"
              placeholder={this.props.App.phoneNumberPlaceholder}
              /*selection={this.state.selection}
              onSelectionChange={this.handleSelectionChange}*/
              clearTextOnFocus
              selectTextOnFocus
              onFocus={() =>
                this.props.UpdateErrorMessagesStateInputRecDelivery({
                  kidName: 'number',
                  state: false,
                })
              }
              keyboardType={'number-pad'}
              onChangeText={(text) =>
                this.props.UpdateDialDataORQueryTyped({
                  action: 'updateTypedNumber',
                  phoneNumberEntered: new AsYouType(
                    this.props.App.countryCodeSelected.toUpperCase(),
                  ).input(text),
                })
              }
              value={this.props.App.phoneNumberEntered}
              maxLength={this.props.App.dynamicMaxLength}
              style={[
                {
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(21),
                  borderBottomWidth: 1.5,
                  flex: 1,
                  marginLeft: 5,
                  paddingLeft: 0,
                  top: 1,
                },
              ]}
              autoFocus={
                this.props.autoFocus !== undefined &&
                this.props.autoFocus !== null
                  ? this.props.autoFocus
                  : false
              }
            />
            {this.props.App.errorReceiverPhoneNumberShow ? (
              <Text
                style={[
                  {
                    color: '#b22222',
                    fontSize: RFValue(14),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    bottom: -25,
                    position: 'absolute',
                    left: 5,
                  },
                ]}>
                {this.props.App.errorReceiverPhoneNumberText}
              </Text>
            ) : null}
          </View>
        </View>
        {this.renderCountryCodeSeacher()}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ShowCountryFilterHeader,
      RenderCountryPhoneCodeSearcher,
      UpdateCountryCodeFormatAfterSelect,
      UpdateDialDataORQueryTyped,
      UpdateErrorMessagesStateInputRecDelivery,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(PhoneNumberInput),
);
