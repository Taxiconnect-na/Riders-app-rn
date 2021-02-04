import React, {useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  PermissionsAndroid,
  BackHandler,
  Platform,
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
import SyncStorage from 'sync-storage';
import {RFValue} from 'react-native-responsive-fontsize';

const App = ({valueM, parentNode, editable}) => {
  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: 5});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={styles.root}>
      <CodeField
        ref={ref}
        {...props}
        value={valueM.length > 0 ? valueM : value}
        onChangeText={setValue}
        onChange={(event) =>
          parentNode.autoUpdaterTheOTP(event.nativeEvent.text)
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

class OTPVerificationGeneric extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;

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
      smsHashLinker: '####', //Has to link to the sms for the auto-completion
    };
    this.otpHandler = this.otpHandler.bind(this);
  }

  /**
   * @func autoUpdaterTheOTP
   * Responsible for updating the state and auto moving forward when we have more than 5 numbers
   * @param otpValue: the otp value received
   */
  autoUpdaterTheOTP(otpValue) {
    this.state.otpValue = otpValue;
    this.autoCheckOTPAsTyped();
  }

  async componentDidMount() {
    let globalObject = this;

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.navigate('PersonalinfosEntryScreen');
        return true;
      },
    );

    RNOtpVerify.getHash().then((result) => {
      try {
        globalObject.state.smsHashLinker = result[0];
      } catch (error) {}
    });
    this.initOTPListener();

    //Add navigator listener
    globalObject._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        globalObject.setState({
          SMS_LIMITER: false,
          otpValue: '',
          showErrorUnmatchedOTP: false,
        }); //reset the error message, reset the otp textvalue, reset the sms limiter
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
    });

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });
    //Socket error handling
    this.props.App.socket.on('error', () => {});
    this.props.App.socket.on('disconnect', () => {
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
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect', () => {});
    this.props.App.socket.on('reconnect_error', () => {
      globalObject.props.App.socket.connect();
    });
    this.props.App.socket.on('reconnect_failed', () => {
      globalObject.props.App.socket.connect();
    });

    /**
     * SOCKET.IO RESPONSES
     */
    //1. OTP response and user status and cheking
    this.props.App.socket.on(
      'updateRiders_profileInfos_io-response',
      function (response) {
        //Stop the loader
        globalObject.setState({loaderState: false});
        //...
        if (
          response !== false &&
          response.response !== undefined &&
          response.response !== null
        ) {
          if (/registered/i.test(response.response) === false) {
            if (
              response.response === true ||
              /success/i.test(response.response)
            ) {
              //Verified
              //Update the local storages
              //phone
              globalObject.props.App.phone_user =
                globalObject.props.App.finalPhoneNumber;
              SyncStorage.set(
                '@phone_user',
                globalObject.props.App.finalPhoneNumber,
              );
              //Do a clean global update
              globalObject.props.UpdateErrorModalLog(false, false, 'any');
              globalObject.props.ResetGenericPhoneNumberInput();
              globalObject.props.navigation.navigate(
                'PersonalinfosEntryScreen',
              );
            } //Error
            else {
              globalObject.setState({
                showErrorUnmatchedOTP: true,
                checkingOTP: false,
              });
            }
          }
        } //Error
        else {
          globalObject.setState({
            showErrorUnmatchedOTP: true,
            checkingOTP: false,
          });
        }
      },
    );
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
    //...
    if (this.backHander !== null) {
      this.backHander.remove();
    }
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
        RNOtpVerify.getOtp()
          .then(() => {
            RNOtpVerify.addListener(this.otpHandler);
          })
          .catch((p) => {});
      } else {
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
      } catch (error) {}
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
    this.props.navigation.navigate('PersonalinfosEntryScreen');
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
      this.state.SMS_LIMITER = false;
    }
    //..
    let phoneNumber = this.props.App.finalPhoneNumber;
    if (phoneNumber !== false) {
      this.setState({loaderState: true});
      if (this.state.SMS_LIMITER === false) {
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
        //...
        let bundleData = {
          user_fingerprint: this.props.App.user_fingerprint,
          dataToUpdate: phoneNumber,
          smsHashLinker: this.state.smsHashLinker,
          infoToUpdate: 'phone',
          direction: 'initChange',
        };
        //Has a final number
        this.props.App.socket.emit('updateRiders_profileInfos_io', bundleData);
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
    if (this.state.checkingOTP === false) {
      this.setState({
        showErrorUnmatchedOTP: false,
        loaderState: true,
        checkingOTP: true,
      });
      let bundleData = {
        user_fingerprint: this.props.App.user_fingerprint,
        dataToUpdate: this.props.App.last_dataPersoUpdated,
        infoToUpdate: 'phone',
        direction: 'confirmChange',
        otp: this.state.otpValue.trim(),
        userType: 'registered',
      };
      //Has a final number
      this.props.App.socket.emit('updateRiders_profileInfos_io', bundleData);
    }
  }

  /**
   * @func autoCheckOTPAsTyped
   * Responsible for checking when the user has entered all the 5 digits to auto launch the checking process
   */
  autoCheckOTPAsTyped() {
    if (this.state.otpValue.trim().length >= 5) {
      //Autocheck
      this.moveForwardCheck();
    } else {
      //Update state
      this.state.showErrorUnmatchedOTP = false;
      this.forceUpdate();
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.loaderState} thickness={4} />
          {this.props.App.generalErrorModal_vars.showErrorGeneralModal ? (
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
                {
                  fontSize: RFValue(19),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
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
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      color: '#0e8491',
                      fontSize: RFValue(17),
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
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                      color: '#b22222',
                      fontSize: RFValue(17),
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
                  style={[systemWeights.light, {fontSize: 12, marginLeft: 6}]}
                />
              </View>
              {
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
              }
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
)(OTPVerificationGeneric);
