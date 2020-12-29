import React, {useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import RNOtpVerify from 'react-native-otp-verify';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';
import NetInfo from '@react-native-community/netinfo';
import ErrorModal from '../Helpers/ErrorModal';
import syncStorage from 'sync-storage';

const App = ({valueM, parentNode, editable}) => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: 5});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  console.log(valueM);

  return (
    <View style={styles.root}>
      <CodeField
        ref={ref}
        {...props}
        value={valueM.length > 0 ? valueM : value}
        onChangeText={setValue}
        onChange={(event) =>
          parentNode.setState({
            otpValue: event.nativeEvent.text,
          })
        }
        autoFocus
        cellCount={5}
        editable={editable}
        rootStyle={styles.codeFieldRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({index, symbol, isFocused}) => (
          <Text
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}>
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
    </View>
  );
};

class OTPVerificationEntry extends React.PureComponent {
  constructor(props) {
    super(props);
    var _navigatorEvent = false; //Hold the events related to the navigation, should request for a new otp on focus
    this.state = {
      loaderState: true,
      otpValue: '',
      userStatus: false, //TO know whether the user is registered or not for a more appropriate next navigation.
      SMS_LIMITER: false, //To limit the sms to 1, and reset when the screen is refocused
      showSendAgain: false, //Send again way after 30 seconds
      showErrorUnmatchedOTP: false, //Whether to show the error when the code doesn't match or not
      checkingOTP: false, //TO know whether the app is checking the OTP or not, basedd on that show or hide the net button
      didCheckOTP: false, //TO know if the otp was already check - once
      networkStateChecker: false,
    };
    this.otpHandler = this.otpHandler.bind(this);
  }

  componentDidMount() {
    let globalObject = this;
    //RNOtpVerify.getHash().then(console.log).catch(console.log);
    this.initOTPListener();

    //Add navigator listener
    globalObject._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        console.log('screen focused');
        globalObject.setState({
          SMS_LIMITER: false,
          otpValue: '',
          showErrorUnmatchedOTP: false,
        }); //reset the error message, reset the otp textvalue, reset the sms limiter
        globalObject.requestForOTP();
      },
    );

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

      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
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
      console.log('connect_error');
      //Ask for the OTP again
      globalObject.props.UpdateErrorModalLog(
        true,
        'connection_no_network',
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

    /**
     * SOCKET.IO RESPONSES
     */
    //1. OTP response and user status
    this.props.App.socket.on(
      'sendOtpAndCheckerUserStatusTc-response',
      function (response) {
        console.log(response);
        //Stop the loader
        globalObject.setState({loaderState: false});
        //...
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (!/error/i.test(response.response)) {
            globalObject.setState({loaderState: false});
            //Registered or not yet registered
            if (/^not_yet_registered$/i.test(response.response)) {
              //Not yet registered
              //Send to create acccount screen
              globalObject.state.userStatus = 'new_user';
            } else if (/^registered$/i.test(response.response)) {
              //Registered user
              globalObject.state.userStatus = 'registered_user';
              //Save the user_fp!!!!
              syncStorage.set('@ufp', response.user_fp);
            } //Error
            else {
              globalObject.props.UpdateErrorModalLog(
                true,
                'error_checking_user_status_login',
                'any',
              );
            }
          } //Error - call error modal with try again button going back to phone number input
          else {
            globalObject.setState({loaderState: false});
            globalObject.props.UpdateErrorModalLog(
              true,
              'error_checking_user_status_login',
              'any',
            );
          }
        } //Error - go back to phone number
        else {
          globalObject.setState({loaderState: false});
          globalObject.goBackFUnc();
        }
      },
    );

    /**
     * CHECK OTP
     */
    this.props.App.socket.on('checkThisOTP_SMS-response', function (response) {
      globalObject.setState({loaderState: false}); //Disable the loader
      if (response.response !== undefined) {
        if (response.response === true) {
          //Reset otp value
          globalObject.setState({otpValue: ''});
          //true
          //Correct
          //Check the net navigation
          if (/new_user/i.test(globalObject.state.userStatus)) {
            //Create new account
            globalObject.props.navigation.navigate('CreateAccountEntry');
          } //Home
          else {
            globalObject.props.navigation.navigate('Home');
          }
        } else if (response.response === false) {
          //wrong otp
          globalObject.setState({
            showErrorUnmatchedOTP: true,
            checkingOTP: false,
            didCheckOTP: false,
          });
        }
        //Unmatched otp - show error - empty the value
        else {
          globalObject.setState({checkingOTP: true, didCheckOTP: false});
          globalObject.props.UpdateErrorModalLog(
            true,
            'error_checking_otp',
            'any',
          );
        }
      } //error checking the otp - show modal log
      else {
        globalObject.setState({checkingOTP: true, didCheckOTP: false});
        globalObject.props.UpdateErrorModalLog(
          true,
          'error_checking_otp',
          'any',
        );
      }
    });
  }

  componentWillUnmount() {
    //Remove navigation event listener
    if (this._navigatorEvent !== false && this._navigatorEvent !== undefined) {
      this._navigatorEvent();
    }
    //Remove the network state listener
    if (this.state.networkStateChecker !== false) {
      this.state.networkStateChecker();
    }
    //Remove the auto otp seeker
    RNOtpVerify.removeListener();
  }

  /**
   * @func initOTPListener
   * Responsible for initializing the OTP reader
   * OTP Hash key: QEg7axwB9km (debug)
   */
  async initOTPListener() {
    let globalObject = this;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        //Request for otp
        globalObject.requestForOTP();
        //...
        console.log('Can read sms');
        RNOtpVerify.getOtp()
          .then((p) => {
            console.log('here');
            RNOtpVerify.addListener(this.otpHandler);
          })
          .catch((p) => console.log(p));
      } else {
        console.log('SMS reading permission denied.');
        //Request for otp
        globalObject.requestForOTP();
        //...
      }
    } catch (err) {
      console.warn(err);
      //Request for otp
      globalObject.requestForOTP();
      //...
    }
  }

  /**
   * @func otpHandler
   * Responsible for handling and auto-filling the otp
   */
  otpHandler(message) {
    if (!/Timeout error/i.test(message)) {
      //Extract the code
      try {
        message = message.split(' ')[1].trim();
        //Update the code input
        this.setState({otpValue: message});
        Keyboard.dismiss();
        //Auto check
        this.moveForwardCheck();
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * @func goBackFUnc
   * Responsible for going back the phone number verification and
   * most importantly reset the validity of the phone number and it's value
   *
   */
  goBackFUnc() {
    this.props.ResetGenericPhoneNumberInput();
    this.setState({
      showSendAgain: false,
      otpValue: '',
      showErrorUnmatchedOTP: false,
    }); //Hide send again and show after 30 sec
    this.props.navigation.navigate('PhoneDetailsScreen');
  }

  /**
   * @func requestForOTP
   * @param reset: to reset everything and send a new otp of True
   * Responsible for requesting for an OTP of 5-digits and returning whether the user
   * is new or already registered.
   * Get the fingerprint if already registered.
   */
  requestForOTP(reset = false) {
    if (reset) {
      console.log('here');
      this.state.SMS_LIMITER = false;
    }
    //..
    let phoneNumber = this.props.App.finalPhoneNumber;
    if (phoneNumber !== false) {
      this.setState({loaderState: true});
      if (this.state.SMS_LIMITER === false) {
        console.log(this.state.SMS_LIMITER);
        console.log(phoneNumber);
        //Limit the sms
        //this.state.SMS_LIMITER = true;
        this.setState({
          SMS_LIMITER: true,
          showSendAgain: false,
          otpValue: '',
          showErrorUnmatchedOTP: false,
        }); //Hide send again and show after 30 sec
        let globalObject = this;
        setTimeout(function () {
          globalObject.setState({showSendAgain: true});
        }, 30000);

        //Has a final number
        this.props.App.socket.emit('sendOtpAndCheckerUserStatusTc', {
          phone_number: phoneNumber,
        });
      }
    } //Go back to the numbe input
    else {
      this.goBackFUnc();
    }
  }

  /**
   * @func moveForwardCheck
   * Responsible for checking the OTP and moving the the correct screen depending on whether the user
   * is already registered or not.
   */
  moveForwardCheck() {
    //Request for otp check
    this.setState({
      showErrorUnmatchedOTP: false,
      loaderState: true,
      checkingOTP: true,
    });
    this.props.App.socket.emit('checkThisOTP_SMS', {
      phone_number: this.props.App.finalPhoneNumber,
      otp: this.state.otpValue,
    });
  }

  /**
   * @func autoCheckOTPAsTyped
   * Responsible for checking when the user has entered all the 5 digits to auto launch the checking process
   */
  autoCheckOTPAsTyped() {
    if (
      this.state.otpValue.trim().length >= 5 &&
      this.state.didCheckOTP === false
    ) {
      console.log('Autochecking launched');
      //Autocheck
      this.moveForwardCheck();
    }
  }

  render() {
    console.log(this.state.otpValue);
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.loaderState} />
          {this.autoCheckOTPAsTyped()}
          {this.props.App.generalErrorModal_vars.showErrorGeneralModal ===
          false ? (
            <ErrorModal
              active={
                this.props.App.generalErrorModal_vars.showErrorGeneralModal
              }
              error_status={
                this.props.App.generalErrorModal_vars.generalErrorModalType
              }
              parentNode={this}
            />
          ) : null}
          <View style={styles.presentationWindow}>
            <TouchableOpacity
              onPress={() => this.goBackFUnc()}
              style={{width: '30%'}}>
              <IconAnt name="arrowleft" size={29} />
            </TouchableOpacity>
            <Text
              style={[
                systemWeights.semibold,
                {
                  fontSize: 19,
                  fontFamily: 'Allrounder-Grotesk-Book',
                  marginTop: 15,
                  marginBottom: 35,
                },
              ]}>
              Enter the 5-digits code sent you.
            </Text>
            <App
              valueM={this.state.otpValue}
              parentNode={this}
              editable={!this.state.checkingOTP}
            />
            {this.state.showSendAgain &&
            this.state.showErrorUnmatchedOTP === false ? (
              <TouchableOpacity
                onPress={() => this.requestForOTP(true)}
                style={{marginTop: '15%'}}>
                <Text
                  style={[
                    {
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#0e8491',
                      fontSize: 17,
                    },
                  ]}>
                  I didn't receive the code.
                </Text>
              </TouchableOpacity>
            ) : this.state.showErrorUnmatchedOTP ? (
              <View style={{marginTop: '15%'}}>
                <Text
                  style={[
                    {
                      fontFamily: 'Allrounder-Grotesk-Book',
                      color: '#b22222',
                      fontSize: 17,
                    },
                  ]}>
                  The code entered is not correct.
                </Text>
              </View>
            ) : null}

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
                    systemWeights.light,
                    {fontSize: 12, marginLeft: 6},
                  ]}></Text>
              </View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                {this.state.checkingOTP === false ? (
                  <TouchableOpacity
                    onPress={() => this.moveForwardCheck()}
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
  root: {},
  title: {textAlign: 'center', fontSize: 30},
  codeFieldRoot: {marginTop: 20},
  cell: {
    flex: 1,
    height: 40,
    lineHeight: 38,
    marginRight: 20,
    fontSize: 25,
    borderBottomWidth: 2,
    borderColor: '#00000030',
    textAlign: 'center',
  },
  focusCell: {
    borderColor: '#000',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetGenericPhoneNumberInput,
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OTPVerificationEntry);
