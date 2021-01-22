/* eslint-disable prettier/prettier */
import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import SOCKET_CORE from '../Helpers/managerNode';
import {CreditCardInput} from '../Modules/react-native-credit-card-input';
import {systemWeights} from 'react-native-typography';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import NetInfo from '@react-native-community/netinfo';
import Modal from 'react-native-modal';
import DismissKeyboard from '../Helpers/DismissKeyboard';

const windowWidth = Dimensions.get('window').width;

class TopUpWalletScreen extends React.PureComponent {
  constructor(props) {
    super(props);
    this.userFp =
      '7c57cb6c9471fd33fd265d5441f253eced2a6307c0207dea57c987035b496e6e8dfa7105b86915da';

    this.eventNetworkSwitch = null; //Will hold the netork's event listener.

    this.cardData = null;
    this.state = {
      cardInfosValidated: false,
      enablePayButton: null,
      buttonPayOpacity: new Animated.Value(0.2),
      errorMessageOpacity: new Animated.Value(0),
      errorMessageTopPosition: new Animated.Value(10),
      errorMessageText: 'Please recheck your details',
      renderPayModal: false,
      paymentAmount: 70,
      resultOperations: null,
      resultOperationErrorText: 'Unable to make the payment.',
      loaderPosition: new Animated.Value(0), //For animation loader
      showLocationSearch_loader: false,
      isDeviceConnectedInternet: true,
      internetConnectionType: 'Cellular',
    };

    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    var globalObject = this;
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
          if (globalObject.state.resultOperations.status == 'failed') {
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

    //...
    SOCKET_CORE.on('connect', () => {
      //Auto cancel anything
      //objectApp.socket.emit('cancelCurrentRide-response', {response:'internal'});
      //console.log('something');
    });
    SOCKET_CORE.on('error', (error) => {
      //console.log('something');
    });
    SOCKET_CORE.on('disconnect', () => {
      //objectApp.setState({errorInternet: true});
      //console.log('something');
    });
    SOCKET_CORE.on('connect_error', () => {
      //objectApp.setState({errorInternet: true});
      //console.log('something');
    });
    SOCKET_CORE.on('connect_timeout', () => {
      //console.log('something');
    });
    SOCKET_CORE.on('reconnect', () => {
      ////console.log('something');
    });
    SOCKET_CORE.on('reconnect_error', () => {
      //console.log('something');
    });
    SOCKET_CORE.on('reconnect_failed', () => {
      //console.log('something');
    });

    /**
     * LISTENERS
     */
    SOCKET_CORE.on('paymentCreditTopup-response', function (dataReceived) {
      if (dataReceived !== undefined) {
        if (dataReceived.response === 'success') {
          //Successful transation
          globalObject.setState({
            resultOperations: {status: 'success'},
          });
        } //An error occured
        else {
          globalObject.setState({
            resultOperations: {status: 'failed'},
            resultOperationErrorText: 'Unable to make the payment.',
          });
        }
      } //Error
      else {
        globalObject.setState({
          resultOperations: {status: 'failed'},
          resultOperationErrorText: 'Unable to make the payment.',
        });
      }
    });
  }

  componentWillUnmount() {
    //Kill network's event listener
    this.eventNetworkSwitch();
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
  execTopup = () => {
    let globalObject = this;
    if (this.state.cardInfosValidated) {
      //Good to go
      if (this.state.enablePayButton === true) {
        this.setState({
          renderPayModal: true,
          showLocationSearch_loader: true,
          resultOperations: null,
        });
        //Make the payment
        let dataBundle = {
          user_fp: this.props.App.user_fingerprint,
          amount: this.state.paymentAmount,
          number: this.cardData.values.number.replace(' ', ''),
          expiry: this.cardData.values.expiry.replace('/', ''),
          cvv: this.cardData.values.cvc,
          name: this.props.App.user_name,
          type: this.cardData.values.type,
        };
        //...
        if (globalObject.state.isDeviceConnectedInternet) {
          globalObject.socket.emit('paymentCreditTopup', dataBundle);
        } //Device not connected to the internet
        else {
          globalObject.setState({
            resultOperations: {status: 'failed'},
            resultOperationErrorText: 'No Internet connection.',
          });
        }
        /*setInterval(function () {
          console.log(dataBundle);
          globalObject.socket.emit('paymentCreditTopup', dataBundle);
        }, 2000);*/
      }
    } else {
      if (this.cardData !== null) {
        this.highlightErrors();
      }
    }
  };

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
                fontSize: 22,
                color: '#fff',
                paddingRight: 5,
                fontFamily: 'Allrounder-Grotesk-Medium',
              },
            ]}>
            Top-up wallet
            <Text style={[{color: '#fff', paddingRight: 5}]}>
              • N$ {this.state.paymentAmount}
            </Text>
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
    //this.state.resultOperations = {};
    //this.state.resultOperations['status'] = 'success';
    ///-----------------------------------------------
    this.fire_search_animation();
    if (
      this.state.renderPayModal && //to false for debug!!!
      this.state.resultOperations === null
    ) {
      return (
        <View style={{backgroundColor: '#fff', height: 200}}>
          <View>
            <Animated.View
              style={[
                styles.loader,
                {
                  borderTopColor: this.state.showLocationSearch_loader
                    ? '#000'
                    : '#fff',
                  transform: [{translateX: this.state.loaderPosition}],
                },
              ]}
            />
          </View>
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text
              style={[
                {fontSize: 19, fontFamily: 'Allrounder-Grotesk-Regular'},
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
        this.state.resultOperations.status === 'failed'
      ) {
        return (
          <View style={{backgroundColor: '#fff', height: 200}}>
            <View
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
              }}>
              <TouchableOpacity
                onPress={() => this.dismissPaymentModal()}
                style={styles.backArrowHeaderSearch}>
                <IconAnt name="arrowleft" size={28} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <IconFeather
                name="slash"
                color={'red'}
                size={20}
                style={{marginRight: 5}}
              />
              <Text
                style={[
                  {
                    fontSize: 18,
                    color: 'red',
                    fontFamily: 'Allrounder-Grotesk-Regular',
                  },
                ]}>
                {this.state.resultOperationErrorText}
              </Text>
            </View>
          </View>
        );
      } else if (
        this.state.renderPayModal &&
        this.state.resultOperations.status == 'success'
      ) {
        return (
          <View style={{backgroundColor: '#fff', height: 200}}>
            <View
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 10,
              }}>
              <TouchableOpacity
                onPress={() => this.dismissPaymentModalToWallet()}
                style={styles.backArrowHeaderSearch}>
                <IconAnt name="arrowleft" size={28} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <IconFeather
                name="check"
                color={'#0D8691'}
                size={20}
                style={{marginRight: 5}}
              />
              <Text
                style={[
                  {
                    fontSize: 19,
                    color: '#0D8691',
                    fontFamily: 'Allrounder-Grotesk-Regular',
                  },
                ]}>
                Payment successful for{' '}
                <Text style={[{fontFamily: 'Allrounder-Grotesk-Medium'}]}>
                  N${this.state.paymentAmount}
                </Text>
                .
              </Text>
            </View>
          </View>
        );
      }
    } else {
      return <></>;
    }
  }

  fire_search_animation() {
    if (this.state.showLocationSearch_loader) {
      Animated.timing(this.state.loaderPosition, {
        toValue: windowWidth,
        duration: 500,
        easing: Easing.bezier(0.5, 0.0, 0.0, 0.8),
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(this.state.loaderPosition, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          this.fire_search_animation();
        });
      });
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
      loaderPosition: new Animated.Value(0), //For animation loader
      showLocationSearch_loader: false,
    });
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
                      fontSize: 22.5,
                      fontFamily: 'Allrounder-Grotesk-Book',
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
                      fontSize: 19,
                      paddingLeft: 20,
                      paddingRight: 20,
                      fontFamily: 'Allrounder-Grotesk-Regular',
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
                  systemWeights.light,
                  {
                    opacity: this.state.errorMessageOpacity,
                    padding: 20,
                    color: 'red',
                    transform: [
                      {translateY: this.state.errorMessageTopPosition},
                    ],
                  },
                ]}>
                {this.state.errorMessageText}
              </Animated.Text>
            </View>
            <View style={styles.nextArea}>
              <View
                style={{
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  paddingBottom: 10,
                }}>
                <IconMaterialIcons
                  name="shield"
                  size={15}
                  color={'#0D8691'}
                  style={{marginRight: 3, top: 1}}
                />
                <Text
                  style={[
                    {fontSize: 14.5, fontFamily: 'Allrounder-Grotesk-Book'},
                  ]}>
                  All the information entered is secured.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {} /*this.execTopup*/}
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
    borderRadius: 5,
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

export default connect(mapStateToProps)(TopUpWalletScreen);
