/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import {CreditCardInput} from '../Modules/react-native-credit-card-input';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import GenericLoader from '../Modules/GenericLoader/GenericLoader';
import {RFValue} from 'react-native-responsive-fontsize';

class TopUpWalletScreen extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;

    this.eventNetworkSwitch = null; //Will hold the netork's event listener.

    this.cardData = null;
    this.state = {
      cardInfosValidated: false,
      enablePayButton: null, //Whether or not to enable the payment button based on the validity of the inputs
      buttonPayOpacity: new Animated.Value(0.2),
      errorMessageOpacity: new Animated.Value(0),
      errorMessageTopPosition: new Animated.Value(10),
      errorMessageText: 'Please recheck your details', //The error message to show during the user input - ddefault: AS SEET
      renderPayModal: false, //To know whether to show or not the payment modal - default: false
      resultOperations: null, //The result of the top-up process - default: null
      resultOperationErrorText: 'Unable to make the payment.',
      loaderState: false, //To know whether the loader is on or off - default: falsee
      isDeviceConnectedInternet: true,
      internetConnectionType: 'Cellular',
    };

    this._navigatorEvent = null;

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    var globalObject = this;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        //? Reset generic infos
        globalObject.cardData = null;
        globalObject.setState({
          cardInfosValidated: false,
          enablePayButton: null,
          buttonPayOpacity: new Animated.Value(0.2),
          errorMessageOpacity: new Animated.Value(0),
          errorMessageTopPosition: new Animated.Value(10),
          errorMessageText: 'Please recheck your details',
          renderPayModal: false,
          resultOperations: null,
          resultOperationErrorText: 'Unable to make the payment.',
          loaderState: false,
          isDeviceConnectedInternet: true,
          internetConnectionType: 'Cellular',
        });
      },
    );

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );
    //Check the network state
    //..Add listener
    NetInfo.fetch().then((state) => {
      if (this.state.isDeviceConnectedInternet !== state.isConnected) {
        globalObject.setState({
          isDeviceConnectedInternet: state.isConnected,
          internetConnectionType: state.type,
        });
      }
    });
    // Subscribe
    this.eventNetworkSwitch = NetInfo.addEventListener((state) => {
      if (this.state.isDeviceConnectedInternet !== state.isConnected) {
        //Check if error window is opened, close it and reinitialize result object
        if (
          globalObject.state.resultOperations !== null &&
          globalObject.state.isDeviceConnectedInternet === false &&
          state.isConnected
        ) {
          //Transition from disconnected to connected
          if (/failed/i.test(globalObject.state.resultOperations.status)) {
            globalObject.dismissPaymentModal();
          }
        } else if (
          globalObject.state.resultOperations === null &&
          globalObject.state.isDeviceConnectedInternet &&
          state.isConnected === false
        ) {
          //Transition from connected to disconnected
          globalObject.setState({
            resultOperations: {status: 'failed'},
            resultOperationErrorText: 'No Internet connection.',
          });
        }
        //..
        globalObject.setState({
          isDeviceConnectedInternet: state.isConnected,
          internetConnectionType: state.type,
        });
      }
    });

    /**
     * SOCKET IO Handlers
     */
    /**
     * Handle to topup event response
     * event: topUp_wallet_io
     */
    this.props.App.socket.on(
      'topUp_wallet_io-response',
      function (dataReceived) {
        console.log(dataReceived);
        if (dataReceived !== undefined) {
          if (
            /success/i.test(dataReceived.response) &&
            dataReceived.response !== false
          ) {
            //Successful transation
            globalObject.setState({
              resultOperations: {status: 'success'},
            });
          } //An error occured
          else {
            globalObject.setState({
              resultOperations: {status: 'failed'},
              resultOperationErrorText:
                dataReceived.message !== undefined &&
                /declined/i.test(dataReceived.message)
                  ? 'Credit card declined'
                  : 'Unable to make the payment.',
            });
          }
        } //Error
        else {
          globalObject.setState({
            resultOperations: {status: 'failed'},
            resultOperationErrorText:
              dataReceived.message !== undefined &&
              /declined/i.test(dataReceived.message)
                ? 'Credit card declined'
                : 'Unable to make the payment.',
          });
        }
      },
    );
  }

  componentWillUnmount() {
    //Kill network's event listener
    this.eventNetworkSwitch();
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //.
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  /**
   * @func _onChange()
   * @param {*} form
   * Responsible to hold complete card informations
   * Will check that all the informations are correct in one field before allowing next field's input
   */
  _onChange = (form) => {
    this.hideErrorMessages();
    this.cardData = form;
    ///....
    if (
      /incomplete/i.test(form.status.number) &&
      form.values.number.length >= 19
    ) {
      //Auto validate if it reached 19 chars and is saying incomplete
      form.status.number = 'valid';
    }
    //...
    if (
      /valid/i.test(form.status.number) &&
      /valid/i.test(form.status.expiry) &&
      /valid/i.test(form.status.cvc)
    ) {
      let globalObject = this;
      Animated.timing(this.state.buttonPayOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        globalObject.setState({
          cardInfosValidated: true,
          enablePayButton: true,
          renderPayModal: false,
        });
      });
    } else {
      let globalObject = this;
      Animated.timing(this.state.buttonPayOpacity, {
        toValue: 0.2,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        globalObject.setState({
          cardInfosValidated: false,
          enablePayButton: null,
          renderPayModal: false,
        });
      });
    }
  };

  /**
   * @func execTopup()
   * Responsible for firing up the payement request to the corresponding service
   */
  execTopup() {
    if (this.state.cardInfosValidated) {
      //Good to go
      if (this.state.enablePayButton === true) {
        this.setState({
          renderPayModal: true,
          resultOperations: null,
          loaderState: true,
        });
        //Make the payment
        let dataBundle = {
          user_fp: this.props.App.user_fingerprint,
          amount: this.props.App.top_up_wallet_crucialData.amount,
          number: this.cardData.values.number.replace(' ', ''),
          expiry: this.cardData.values.expiry.replace('/', ''),
          cvv: this.cardData.values.cvc,
          type: this.cardData.values.type,
        };
        //...
        if (this.state.isDeviceConnectedInternet) {
          this.props.App.socket.emit('topUp_wallet_io', dataBundle);
        } //Device not connected to the internet
        else {
          this.setState({
            resultOperations: {status: 'failed'},
            resultOperationErrorText: 'No Internet connection.',
          });
        }
      }
    } else {
      if (this.cardData !== null) {
        this.highlightErrors();
      }
    }
  }

  /**
   * @func renderAppropriateScreens()
   * Responsible for rendering the appropriate screen based on the situation or level of payment
   * process.
   */
  renderAppropriateScreens() {
    if (this.state.renderPayModal) {
      return (
        <>
          <ActivityIndicator size={'large'} color={'#fff'} />
        </>
      );
    } //Normal payment form
    else {
      return (
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
              },
            ]}>
            {`Top-up wallet - N$${this.props.App.top_up_wallet_crucialData.amount}`}
          </Text>
        </>
      );
    }
  }

  /**
   * @func hideErrorMessages()
   * Responsible for hiding any error messages, useful when typing
   */
  hideErrorMessages() {
    Animated.parallel([
      Animated.timing(this.state.errorMessageOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.errorMessageTopPosition, {
        toValue: 10,
        duration: 250,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }

  /**
   * @func highlightErrors()
   * Responsible for showing clearly badly entered credit card details
   */

  highlightErrors() {
    if (
      /^invalid$/i.test(this.cardData.status.number) ||
      /^incomplete$/i.test(this.cardData.status.number)
    ) {
      this.setState({
        errorMessageText: 'Please check your card number',
      });
    } else if (
      /^invalid$/i.test(this.cardData.status.expiry) ||
      /^incomplete$/i.test(this.cardData.status.expiry)
    ) {
      this.setState({
        errorMessageText: 'Please check the expiry date',
      });
    } else if (
      /^invalid$/i.test(this.cardData.status.cvc) ||
      /^incomplete$/i.test(this.cardData.status.cvc)
    ) {
      this.setState({
        errorMessageText: 'Please check the CVV number',
      });
    }
    //...
    Animated.parallel([
      Animated.timing(this.state.errorMessageOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.errorMessageTopPosition, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }

  /**
   * @func dismissPaymentModalToWallet()
   * Responsible for closing modal and redirecting user to wallet main screen
   */
  dismissPaymentModalToWallet() {}

  /**
   * @func renderModalContent
   * Responsible for filling up the content of the modal view.
   */
  renderModalContent() {
    //DEBUG
    //this.state.resultOperations = {};
    //this.state.resultOperations['status'] = 'failed';
    ///DEBUG-----------------------------------------------
    if (
      this.state.renderPayModal && //to false for debug!!!
      this.state.resultOperations === null
    ) {
      return (
        <View style={{backgroundColor: '#fff', height: 300}}>
          <GenericLoader active={this.state.loaderState} thickness={4} />
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text
              style={[
                {
                  fontSize: RFValue(20),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                },
              ]}>
              Making the payment
            </Text>
          </View>
        </View>
      );
    } else if (
      this.state.renderPayModal &&
      this.state.resultOperations !== null
    ) {
      if (
        this.state.renderPayModal &&
        /failed/i.test(this.state.resultOperations.status)
      ) {
        return (
          <View style={{backgroundColor: '#fff', height: 350}}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconFeather
                name="slash"
                color={'#b22222'}
                size={35}
                style={{marginRight: 5}}
              />
              <Text
                style={[
                  {
                    fontSize: RFValue(19),
                    color: '#b22222',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    marginTop: 15,
                  },
                ]}>
                {this.state.resultOperationErrorText}
              </Text>
            </View>
            <View style={{padding: 20, paddingBottom: 40}}>
              <TouchableOpacity
                onPress={() =>
                  this.setState({renderPayModal: false, resultOperations: null})
                }
                style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    color: '#fff',
                  }}>
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      } else if (
        this.state.renderPayModal &&
        /success/i.test(this.state.resultOperations.status)
      ) {
        return (
          <View style={{backgroundColor: '#fff', height: 350}}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconAnt name="checkcircleo" color="#09864A" size={35} />
              <Text
                style={[
                  {
                    fontSize: RFValue(19),
                    color: '#09864A',
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    marginTop: 15,
                  },
                ]}>
                Payment successful for{' '}
                <Text
                  style={[
                    {
                      fontWeight: 'bold',
                    },
                  ]}>
                  N${this.props.App.top_up_wallet_crucialData.amount}
                </Text>
                .
              </Text>
            </View>
            <View style={{padding: 20, paddingBottom: 40}}>
              <TouchableOpacity
                onPress={() => this.dismissPaymentModal()}
                style={[styles.bttnGenericTc, {borderRadius: 2}]}>
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    color: '#fff',
                  }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
    } else {
      return <></>;
    }
  }

  /**
   * @func dismissPaymentModal
   * Responsible for closing the payment modal on error and reset initial value for resultOperations
   */
  dismissPaymentModal() {
    this.setState({
      resultOperations: null,
      renderPayModal: false,
    });
    //Move back to wallet entry
    this.props.navigation.navigate('WalletEntry');
  }

  /**
   * MAIN
   */

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <StatusBar backgroundColor="#000" />
          <Modal
            testID={'modal'}
            isVisible={this.state.renderPayModal}
            animationInTiming={300}
            animationOutTiming={300}
            useNativeDriver={true}
            style={styles.modalBottom}>
            {this.renderModalContent()}
          </Modal>
          <View
            style={{
              flex: 1,
              padding: 20,
              paddingTop: 10,
              paddingLeft: 0,
              paddingRight: 0,
            }}>
            <View
              style={{
                flex: 1,
              }}>
              <View
                style={{
                  padding: 20,
                  paddingTop: 15,
                  paddingBottom: 15,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.goBack();
                  }}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{top: 0}}>
                    <IconAnt name="arrowleft" size={25} />
                  </View>
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
                    },
                  ]}>
                  Payment information
                </Text>
              </View>
              <View
                style={{
                  minHeight: 50,
                }}>
                <CreditCardInput
                  ref={(c) => (this._cardInput = c)}
                  placeholders={{
                    number: 'Card number',
                    expiry: 'MM/YY',
                    cvc: 'CVV',
                  }}
                  labels={{
                    cvc: '',
                    number: '',
                    expiry: '',
                  }}
                  requiresName={false}
                  requiresCVC={true}
                  allowScroll={false}
                  inputContainerStyle={{
                    paddingBottom: 10,
                    paddingTop: 10,
                    paddingLeft: 5,
                  }}
                  inputStyle={[
                    {
                      fontSize: RFValue(19),
                      paddingLeft: 20,
                      paddingRight: 20,
                      fontFamily:
                        Platform.OS === 'android'
                          ? 'UberMoveTextRegular'
                          : 'Uber Move Text',
                    },
                  ]}
                  additionalInputsProps={{
                    number: {
                      maxLength: 19,
                    },
                    expiry: {
                      maxLength: 5,
                    },
                    cvc: {
                      maxLength: 3,
                    },
                  }}
                  onChange={this._onChange}
                />
              </View>
              <Animated.Text
                style={[
                  {
                    opacity: this.state.errorMessageOpacity,
                    padding: 20,
                    color: '#b22222',
                    transform: [
                      {translateY: this.state.errorMessageTopPosition},
                    ],
                    fontSize: RFValue(15),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                  },
                ]}>
                {this.state.errorMessageText}
              </Animated.Text>
            </View>
            <View style={styles.nextArea}>
              <View
                style={{
                  paddingBottom: 10,
                  flexDirection: 'row',
                }}>
                <View style={{marginRight: 3}}>
                  <IconMaterialIcons
                    name="shield"
                    size={15}
                    color={'#0D8691'}
                  />
                </View>
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={[
                        {
                          fontSize: RFValue(15),
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextRegular'
                              : 'Uber Move Text',
                          flex: 1,
                          color: '#757575',
                        },
                      ]}>
                      All the information entered is secured.
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: RFValue(15),
                        fontFamily:
                          Platform.OS === 'android'
                            ? 'UberMoveTextMedium'
                            : 'Uber Move Text Medium',

                        color: '#333333',
                      }}>
                      A handling fee of 3.5% applies.
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => this.execTopup()}
                style={{borderWidth: 1, borderColor: 'transparent'}}>
                <Animated.View
                  style={[
                    styles.bttnGenericTc,
                    {opacity: this.state.buttonPayOpacity},
                  ]}>
                  {this.renderAppropriateScreens()}
                </Animated.View>
              </TouchableOpacity>
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
  nextArea: {
    marginTop: '10%',
    padding: 20,
    paddingBottom: '10%',
    backgroundColor: '#fff',
  },
  loader: {
    borderTopWidth: 5,
    width: 20,
    marginBottom: 10,
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
  modalBottom: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  backArrowHeaderSearch: {
    width: 80,
    marginLeft: -5,
    paddingBottom: 5,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(TopUpWalletScreen));
