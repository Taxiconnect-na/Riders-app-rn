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
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {
  ValidateGenericPhoneNumber,
  UpdateErrorModalLog,
  ResetGenericPhoneNumberInput,
} from '../Redux/HomeActionsCreators';
import ErrorModal from '../Helpers/ErrorModal';
import NetInfo from '@react-native-community/netinfo';
import {RFValue} from 'react-native-responsive-fontsize';
import {_MAIN_URL_ENDPOINT} from '@env';
const io = require('socket.io-client');

class PhoneDetailsScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    this._shouldShow_errorModal = true; //! ERROR MODAL AUTO-LOCKER - PERFORMANCE IMPROVER.
    this.backListener = null; //Responsible to hold the listener for the go back overwritter.
    this._isMounted = false;

    this.state = {
      networkStateChecker: false,
    };
  }

  componentDidMount() {
    let that = this;
    this._isMounted = true; //? mark component as mounted

    //? Add navigator listener - auto clean on focus
    this.backListener = that.props.navigation.addListener('focus', () => {
      that.props.ResetGenericPhoneNumberInput();
      that.props.App.detailToModify = null; //! RESET GENDER controller to null
    });
    //Auto reset phone number validity to false
    this.props.App.isPhoneNumberValid = false;
    //Network state checker
    this.state.networkStateChecker = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        that.props.UpdateErrorModalLog(
          state.isConnected,
          'connection_no_network',
          state.type,
        );
      } //connected
      else {
        that.props.UpdateErrorModalLog(false, false, state.type);
      }
    });

    //connection
    this.props.App.socket.on('connect', () => {
      that.props.UpdateErrorModalLog(false, false, 'any');
    });
    //Socket error handling
    this.props.App.socket.on('error', (error) => {});
    this.props.App.socket.on('disconnect', () => {
      const socket = io(String(_MAIN_URL_ENDPOINT), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 100,
        reconnectionDelayMax: 200,
      });
    });
    this.props.App.socket.on('connect_error', () => {
      //Ask for the OTP again
      that.props.UpdateErrorModalLog(true, 'service_unavailable', 'any');
      that.props.App.socket.connect();
    });
    this.props.App.socket.on('connect_timeout', () => {
      const socket = io(String(_MAIN_URL_ENDPOINT), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 100,
        reconnectionDelayMax: 200,
      });
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {
      that.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      const socket = io(String(_MAIN_URL_ENDPOINT), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 100,
        reconnectionDelayMax: 200,
      });
    });
  }

  componentWillUnmount() {
    /*if (this.backListener !== null) {
      //
      this.backListener = null;
    }*/
    //? Mark component as unmounted
    this._isMounted = false;
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

  /**
   * @func renderError_modalView
   * Responsible for rendering the modal view only once.
   */
  renderError_modalView() {
    return (
      <ErrorModal
        active={this.props.App.generalErrorModal_vars.showErrorGeneralModal}
        error_status={
          this.props.App.generalErrorModal_vars.generalErrorModalType
        }
        parentNode={null}
      />
    );
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <DismissKeyboard>
            <SafeAreaView style={styles.mainWindow}>
              <StatusBar backgroundColor="black" />
              {this.props.App.generalErrorModal_vars.showErrorGeneralModal
                ? this.renderError_modalView()
                : null}
              {this.automoveForward()}
              <View style={styles.presentationWindow}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('EntryScreen')}
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
                          : 'Uber Move Text Medium',
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
                          fontSize: RFValue(13),
                          marginLeft: 6,
                          lineHeight: 18,
                          color: '#141414',
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                        },
                      ]}>
                      By proceeding, you will receive an SMS and data fees may
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
      ResetGenericPhoneNumberInput,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(PhoneDetailsScreen),
);
