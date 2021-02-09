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
  BackHandler,
  Platform,
  Image,
} from 'react-native';
import {UpdateErrorModalLog} from '../Redux/HomeActionsCreators';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';

class CheckPhoneOrTaxiNumber extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;

    this.state = {
      isCheckingDetails: true, //TO know whether the checking process is still running (determines the state of the loader) - default: false
      hasFoundSomeErrors: false, //TO know whether the checking process was failed or not - default: false
      errorsNature: null, //? The type of errors found : 3 cases (not active Taxiconnect, active account or another error)
      responseData: null, //Will contain the checked data if any
    };
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    if (this._navigatorEvent !== undefined && this._navigatorEvent !== null) {
      this._navigatorEvent();
    }
  }

  componentDidMount() {
    let globalObject = this;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        console.log('focused');
        globalObject.checkSenderDetails(); //! AUTO CHECK THE RECIPIENT
        globalObject.props.App.recipient_crucial_data = null; //! Clear the recipient AFTER check data
        globalObject.setState({
          isCheckingDetails: true,
          hasFoundSomeErrors: false,
          errorsNature: null,
          responseData: null,
        });
      },
    );

    //connection
    this.props.App.socket.on('connect', () => {
      globalObject.props.UpdateErrorModalLog(false, false, 'any');
    });

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );

    /**
     * SOCKET EVENTS HANDLERS
     */

    /**
     * Handle the response of the recipient checker.
     * event: checkRecipient_information_beforeTransfer
     * ? Have 3 case : not active Taxiconnect account, active account or general error
     */
    this.props.App.socket.on(
      'checkRecipient_information_beforeTransfer-response',
      function (response) {
        if (
          response !== undefined &&
          response !== null &&
          response.response !== undefined &&
          response.response !== null &&
          /verified/i.test(response.response) &&
          response.receipient_name !== undefined &&
          response.receipient_name !== null
        ) {
          globalObject.props.App.recipient_crucial_data = response;
          globalObject.props.App.recipient_crucial_data['recipient_number'] =
            globalObject.props.App.finalPhoneNumber; //! Save the recipient AFTER check data - add the phone number as well
          globalObject.setState({
            responseData: response,
            isCheckingDetails: false,
            hasFoundSomeErrors: false,
            errorsNature: null,
          }); //? Make sure the close the loader
        } //Transaction error
        else {
          globalObject.setState({
            isCheckingDetails: false,
            hasFoundSomeErrors: true,
            errorsNature:
              response.flag !== undefined && response.flag !== null
                ? response.flag
                : 'general_error_network_maybe',
          });
        }
      },
    );
  }

  /**
   * @func checkSenderDetails
   * Responsible for checking if the sender is valid or not.
   */
  checkSenderDetails() {
    //DEBUG
    //this.props.App.user_sender_nature = 'friend';
    //this.props.App.finalPhoneNumber = '+264856997167';
    //DEBUG
    if (this.props.App.user_sender_nature !== undefined) {
      //Valid  user nature : friend / driver
      if (/friend/i.test(this.props.App.user_sender_nature)) {
        //Friend
        let phoneNumber = this.props.App.finalPhoneNumber;
        if (phoneNumber !== false) {
          //Start the loader
          this.setState({
            isCheckingDetails: true,
            hasFoundSomeErrors: false,
            errorsNature: null,
            responseData: null,
          });

          let bundleCheckRecipient = {
            user_fingerprint: this.props.App.user_fingerprint,
            user_nature: this.props.App.user_sender_nature,
            payNumberOrPhoneNumber: phoneNumber,
          };
          console.log(bundleCheckRecipient);
          //..
          this.props.App.socket.emit(
            'checkRecipient_information_beforeTransfer',
            bundleCheckRecipient,
          );
        } //Return to choose sending users
        else {
          this.props.navigation.navigate('SendFundsEntry');
        }
      } else if (/driver/i.test(this.props.App.user_sender_nature)) {
        //Driver
        let paymentNumber = this.props.App.paymentNumberOrTaxiNumber;
        if (
          paymentNumber !== false &&
          paymentNumber !== null &&
          paymentNumber !== undefined
        ) {
          //Start the loader
          this.setState({
            isCheckingDetails: true,
            hasFoundSomeErrors: false,
            errorsNature: null,
            responseData: null,
          });

          let bundleCheckRecipient = {
            user_fingerprint: this.props.App.user_fingerprint,
            user_nature: this.props.App.user_sender_nature,
            payNumberOrPhoneNumber: paymentNumber,
          };
          console.log(bundleCheckRecipient);
          //..
          this.props.App.socket.emit(
            'checkRecipient_information_beforeTransfer',
            bundleCheckRecipient,
          );
        } //Return to choose sending users
        else {
          this.props.navigation.navigate('SendFundsEntry');
        }
      } //!Invalid user nature
      else {
        this.props.navigation.navigate('SendFundsEntry');
      }
    } //Return to choose sending users
    else {
      this.props.navigation.navigate('SendFundsEntry');
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <GenericLoader active={this.state.isCheckingDetails} thickness={4} />
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <View style={{flex: 1}}>
              {this.state.isCheckingDetails ? (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80%',
                  }}>
                  <Text
                    style={{
                      fontSize: RFValue(21),
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextMedium'
                          : 'Uber Move Text Medium',
                      color: '#0e8491',
                    }}>
                    Give us a sec...
                  </Text>
                  <Text
                    style={{
                      fontSize: RFValue(16),
                      marginTop: 10,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextLight'
                          : 'Uber Move Text Light',
                    }}>
                    Checking the receiver's information
                  </Text>
                </View>
              ) : /friend/i.test(this.props.App.user_sender_nature) ? (
                this.state.hasFoundSomeErrors === false ? (
                  <>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.goBack()}
                      style={{width: '30%'}}>
                      <IconAnt name="arrowleft" size={29} />
                    </TouchableOpacity>
                    <View
                      style={{
                        height: '80%',
                        alignItems: 'center',
                        paddingTop: '7%',
                      }}>
                      <View
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          padding: 20,
                          paddingBottom: '15%',
                        }}>
                        <Text
                          style={{
                            fontSize: RFValue(22),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'MoveMedium'
                                : 'Uber Move Medium',
                          }}>
                          Good to go!
                        </Text>
                      </View>
                      <View
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 200,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#fff',
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 7,
                          },
                          shadowOpacity: 0.41,
                          shadowRadius: 9.11,

                          elevation: 14,
                          marginBottom: 20,
                        }}>
                        <Image
                          source={require('../../Media_assets/Images/user.png')}
                          style={{
                            resizeMode: 'contain',
                            width: '60%',
                            height: '80%',
                            borderRadius: 0,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: RFValue(20),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                        }}>
                        {this.state.responseData.receipient_name}
                      </Text>
                      <View
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          marginTop: 10,
                        }}>
                        <Text
                          style={{
                            fontSize: RFValue(16),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextRegular'
                                : 'Uber Move Text',
                            textAlign: 'left',
                            color: '#09864A',
                          }}>
                          You are allowed to make the transaction.
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.goBack()}
                      style={{width: '30%'}}>
                      <IconAnt name="arrowleft" size={29} />
                    </TouchableOpacity>
                    <View
                      style={{
                        flex: 1,
                        paddingTop: '7%',
                      }}>
                      <View
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          paddingBottom: 20,
                          flexDirection: 'row',
                        }}>
                        <IconAnt
                          name="closecircleo"
                          size={20}
                          color={'#b22222'}
                        />
                        <Text
                          style={{
                            fontSize: RFValue(21),
                            marginLeft: 5,
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                          }}>
                          Unable to proceed
                        </Text>
                      </View>

                      <View
                        style={{
                          width: '100%',
                        }}>
                        {/transaction_error_want_toSend_toHiHermslef/i.test(
                          this.state.errorsNature,
                        ) ? (
                          <Text
                            style={{
                              fontSize: RFValue(17.5),
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextLight'
                                  : 'Uber Move Text Light',
                              textAlign: 'left',
                              lineHeight: 23,
                            }}>
                            Sorry it looks like you are trying to make this
                            transaction to yourslef, you cannot perform this
                            kind of action, please visit the{' '}
                            <Text style={{fontWeight: 'bold'}}>
                              Support Tab
                            </Text>{' '}
                            for any assistance.
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontSize: RFValue(17.5),
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextLight'
                                  : 'Uber Move Text Light',
                              textAlign: 'left',
                              lineHeight: 23,
                            }}>
                            Sorry you are only allowed to make transfers to{' '}
                            <Text
                              style={{fontWeight: 'bold', color: '#0e8491'}}>
                              active TaxiConnect numbers
                            </Text>{' '}
                            , please make sure that your receiver has a
                            TaxiConnect account and try again.
                          </Text>
                        )}
                      </View>
                    </View>
                  </>
                )
              ) : //FOR DRIVERS
              this.state.hasFoundSomeErrors === false ? (
                <>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={{width: '30%'}}>
                    <IconAnt name="arrowleft" size={29} />
                  </TouchableOpacity>
                  <View
                    style={{
                      height: '80%',
                      alignItems: 'center',
                      paddingTop: '7%',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        padding: 20,
                        paddingBottom: '15%',
                      }}>
                      <Text
                        style={{
                          fontSize: RFValue(22),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'MoveMedium'
                              : 'Uber Move Medium',
                        }}>
                        Good to go!
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 200,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        shadowColor: '#000',
                        shadowOffset: {
                          width: 0,
                          height: 7,
                        },
                        shadowOpacity: 0.41,
                        shadowRadius: 9.11,

                        elevation: 14,
                        marginBottom: 20,
                      }}>
                      <Image
                        source={require('../../Media_assets/Images/user.png')}
                        style={{
                          resizeMode: 'contain',
                          width: '60%',
                          height: '80%',
                          borderRadius: 0,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: RFValue(20),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',
                      }}>
                      {this.state.responseData.receipient_name}
                    </Text>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        marginTop: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: RFValue(16),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          textAlign: 'left',
                          color: '#09864A',
                        }}>
                        Driver transaction allowed
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.goBack()}
                    style={{width: '30%'}}>
                    <IconAnt name="arrowleft" size={29} />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      paddingTop: '7%',
                    }}>
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        paddingBottom: 20,
                        flexDirection: 'row',
                      }}>
                      <IconAnt
                        name="closecircleo"
                        size={20}
                        color={'#b22222'}
                      />
                      <Text
                        style={{
                          fontSize: RFValue(21),
                          marginLeft: 5,
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextMedium'
                              : 'Uber Move Text Medium',
                        }}>
                        Unable to proceed
                      </Text>
                    </View>

                    <View
                      style={{
                        width: '100%',
                      }}>
                      {/transaction_error_want_toSend_toHiHermslef/i.test(
                        this.state.errorsNature,
                      ) ? (
                        <Text
                          style={{
                            fontSize: RFValue(17.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            textAlign: 'left',
                            lineHeight: 23,
                          }}>
                          Sorry it looks like you are trying to make this
                          transaction to yourslef, you cannot perform this kind
                          of action, please visit the{' '}
                          <Text style={{fontWeight: 'bold'}}>Support Tab</Text>{' '}
                          for any assistance.
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: RFValue(17.5),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextLight'
                                : 'Uber Move Text Light',
                            textAlign: 'left',
                            lineHeight: 23,
                          }}>
                          Sorry you are only allowed to make transfers to{' '}
                          <Text style={{fontWeight: 'bold', color: '#0e8491'}}>
                            active TaxiConnect drivers
                          </Text>{' '}
                          , please make sure that your receiver is a TaxiConnect
                          driver and try again.
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
            <View style={{}}>
              {this.state.isCheckingDetails === false ? (
                <TouchableOpacity
                  onPress={() =>
                    this.state.hasFoundSomeErrors === false
                      ? this.props.navigation.navigate('SendFundsInputAmount')
                      : this.props.navigation.goBack()
                  }
                  style={{
                    borderColor: 'transparent',
                    width: '100%',
                    justifyContent: 'center',
                  }}>
                  <View style={[styles.bttnGenericTc]}>
                    {this.state.hasFoundSomeErrors === false ? (
                      <>
                        <Text
                          style={[
                            {
                              fontFamily:
                                Platform.OS === 'android'
                                  ? 'UberMoveTextMedium'
                                  : 'Uber Move Text Medium',
                              fontSize: RFValue(22),
                              color: '#fff',
                              flex: 1,
                              textAlign: 'center',
                            },
                          ]}>
                          Next
                        </Text>
                        <IconMaterialIcons
                          name="arrow-forward-ios"
                          size={20}
                          color="#fff"
                        />
                      </>
                    ) : (
                      <Text
                        style={[
                          {
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            fontSize: RFValue(22),
                            color: '#fff',
                            flex: 1,
                            textAlign: 'center',
                          },
                        ]}>
                        Try again
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : null}
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
  },
  bttnGenericTc: {
    borderColor: '#000',
    padding: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#000',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,

    elevation: 3,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(CheckPhoneOrTaxiNumber),
);
