import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  ValidateGenericPhoneNumber,
  UpdateErrorModalLog,
  ResetGenericPhoneNumberInput,
} from '../Redux/HomeActionsCreators';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';

class SendFundsFriendInputNumber extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true;
    this._navigatorEvent = null;

    this.state = {
      networkStateChecker: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
    let globalObject = this;
    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        globalObject.props.ResetGenericPhoneNumberInput();
      },
    );
    //Auto reset phone number validity to false
    this.props.App.isPhoneNumberValid = false;
  }
  /**
   * @func automoveForward
   * Responsible for auto move forward if the phone number is true
   */
  automoveForward() {
    this.props.ValidateGenericPhoneNumber();
    if (this.props.App.isPhoneNumberValid) {
      this.props.navigation.navigate('CheckPhoneOrTaxiNumber');
      return null;
    } else {
      return null;
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <DismissKeyboard>
            <SafeAreaView style={styles.mainWindow}>
              <StatusBar backgroundColor="#000" />
              <View style={styles.presentationWindow}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.goBack()}
                  style={{width: '30%'}}>
                  <IconAnt name="arrowleft" size={29} />
                </TouchableOpacity>
                <Text
                  style={[
                    {
                      fontSize: RFValue(21),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text',
                      marginBottom: 35,
                      marginTop: 15,
                    },
                  ]}>
                  Who's receiving?
                </Text>
                <PhoneNumberInput />

                <View
                  style={{
                    flexDirection: 'row',
                    position: 'absolute',
                    bottom: '10%',
                    left: 20,
                    right: 20,
                    width: '100%',
                  }}>
                  <View style={{flexDirection: 'row', flex: 1}}>
                    <Text
                      style={[
                        {
                          fontSize: RFValue(14),
                          marginLeft: 6,
                          lineHeight: 18,
                          color: '#141414',
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                        },
                      ]}>
                      You can only send funds to active{' '}
                      <Text style={{fontWeight: 'bold'}}>TaxiConnect</Text>{' '}
                      accounts.
                    </Text>
                  </View>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <TouchableOpacity
                      onPress={() => this.automoveForward()}
                      style={[
                        styles.arrowCircledForwardBasic,
                        styles.shadowButtonArrowCircledForward,
                      ]}>
                      <IconMaterialIcons
                        name="arrow-forward-ios"
                        size={30}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </DismissKeyboard>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#fff',
  },
  presentationWindow: {
    flex: 1,
    padding: 20,
  },
  arrowCircledForwardBasic: {
    backgroundColor: '#0e8491',
    width: 60,
    height: 60,
    borderRadius: 10000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowButtonArrowCircledForward: {
    shadowColor: '#d0d0d0',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.6,

    elevation: 6,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ValidateGenericPhoneNumber,
      UpdateErrorModalLog,
      ResetGenericPhoneNumberInput,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(SendFundsFriendInputNumber),
);
