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
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {
  ValidateGenericPhoneNumber,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';

class PhoneDetailsScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      networkStateChecker: false,
    };
  }

  componentDidMount() {
    let globalObject = this;
    //Auto reset phone number validity to false
    this.props.App.isPhoneNumberValid = false;
    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        globalObject.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
      } //connected
      else {
        globalObject.props.UpdateErrorModalLog(false, false, state.type);
      }
    });

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });
    //Socket error handling
    this.props.App.socket.on('error', (error) => {
      //console.log('something');
    });
    this.props.App.socket.on('disconnect', () => {
      //console.log('something');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_error', () => {
      //Ask for the OTP again
      globalObject.props.UpdateErrorModalLog(
        true,
        'service_unavailable',
        'any',
      );
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      console.log('connect_timeout');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {
      ////console.log('something');
    });
    this.props.App.socket.on('reconnect_error', () => {
      console.log('reconnect_error');
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      console.log('reconnect_failed');
      globalObject.props.App.socket.connect();
    });
  }

  /**
   * @func automoveForward
   * Responsible for auto move forward if the phone number is true
   */
  automoveForward() {
    if (this.props.App.isPhoneNumberValid) {
      this.props.navigation.navigate('OTPVerificationEntry');
      return null;
    } else {
      return null;
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <StatusBar backgroundColor="black" />
          <ErrorModal
            active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
            error_status={
              this.props.App.generalErrorModal_vars.generalErrorModalType
            }
          />
          {this.automoveForward()}
          <View style={styles.presentationWindow}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('EntryScreen')}
              style={{width: '30%'}}>
              <IconAnt name="arrowleft" size={29} />
            </TouchableOpacity>
            <Text
              style={[
                systemWeights.semibold,
                {
                  fontSize: 21,
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  marginTop: 15,
                  marginBottom: 35,
                },
              ]}>
              What's your phone number?
            </Text>
            <PhoneNumberInput autoFocus={true} />
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
                      fontSize: 13,
                      marginLeft: 6,
                      lineHeight: 18,
                      fontFamily: 'Allrounder-Grotesk-Book',
                    },
                  ]}>
                  By proceeding, you will receive an SMS and additional fees may
                  apply.
                </Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                {this.props.App.renderCountryCodeSeacher === false ? (
                  <TouchableOpacity
                    onPress={() => this.props.ValidateGenericPhoneNumber()}
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
                ) : null}
              </View>
            </View>
          </View>
        </SafeAreaView>
      </DismissKeyboard>
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
    paddingRight: 30,
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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PhoneDetailsScreen);
