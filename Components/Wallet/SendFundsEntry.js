import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IconEntypo from 'react-native-vector-icons/Entypo';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {RFValue} from 'react-native-responsive-fontsize';

class SendFundsEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;
  }

  componentWillUnmount() {
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //..
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  componentDidMount() {
    let globalObject = this;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        globalObject.props.App.recipient_crucial_data = null; //! Clear the recipient
        globalObject.props.App.user_sender_nature = null; //! Clear the user nature
      },
    );

    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );
  }

  /**
   * @func updateUser_natureRecipient
   * Responsible for updating the related string for the recipient. (friend or driver - ONLY).
   * And move to the next screen after.
   * @param user_nature
   */
  updateUser_natureRecipient(user_nature) {
    this.props.App.user_sender_nature = user_nature; //! Update the recipient's user nature: friend/driver
    if (/friend/i.test(user_nature)) {
      //Send to friend or family
      this.props.navigation.navigate('SendFundsFriendInputNumber');
    } else if (/driver/i.test(user_nature)) {
      //Send to driver
      this.props.navigation.navigate('PayTaxiInputNumber');
    }
  }

  render() {
    return (
      <DismissKeyboard>
        <SafeAreaView style={styles.mainWindow}>
          <StatusBar backgroundColor="#000" />
          <View style={styles.presentationWindow}>
            <Text
              style={[
                {
                  fontSize: RFValue(22),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'MoveMedium'
                      : 'Uber Move Medium',
                  marginBottom: 30,
                  marginTop: 10,
                  padding: 20,
                },
              ]}>
              Easily send cab fares to anyone.
            </Text>
            <View>
              <TouchableOpacity
                onPress={() => this.updateUser_natureRecipient('friend')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: '#EEEEEE',
                  paddingBottom: 35,
                  paddingLeft: 20,
                  paddingRight: 20,
                  marginBottom: 40,
                }}>
                <View style={{flexDirection: 'row', flex: 1, minHeight: 70}}>
                  <View style={{width: 35, paddingTop: 1}}>
                    <IconFontAwesome5
                      name="mobile"
                      size={25}
                      style={{marginRight: 8}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{height: 35}}>
                      <Text
                        style={[
                          {
                            fontSize: RFValue(19),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            color: '#0e8491',
                            flex: 1,
                          },
                        ]}>
                        Send to friends
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          flex: Platform.OS === 'android' ? 1 : 0,
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextLight'
                              : 'Uber Move Text Light',
                          lineHeight: RFValue(17),
                          paddingRight: 10,
                        }}>
                        Send rides or delivery credits to your friends and
                        family instantly and hustle free.
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{height: '100%', paddingTop: 5}}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color="#000"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.updateUser_natureRecipient('driver')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: 0,
                  borderBottomColor: '#d0d0d0',
                  paddingBottom: 25,
                  paddingLeft: 20,
                  paddingRight: 20,
                }}>
                <View style={{flexDirection: 'row', flex: 1, minHeight: 70}}>
                  <View style={{width: 35, paddingTop: 1}}>
                    <IconEntypo
                      name="flash"
                      size={25}
                      style={{marginRight: 8}}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <View style={{height: 35}}>
                      <Text
                        style={[
                          {
                            fontSize: RFValue(19),
                            fontFamily:
                              Platform.OS === 'android'
                                ? 'UberMoveTextMedium'
                                : 'Uber Move Text Medium',
                            color: '#0e8491',
                            flex: 1,
                          },
                        ]}>
                        Pay a driver
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          flex: Platform.OS === 'android' ? 1 : 0,
                          fontFamily:
                            Platform.OS === 'android'
                              ? 'UberMoveTextLight'
                              : 'Uber Move Text Light',
                          lineHeight: RFValue(17),
                          paddingRight: 10,
                        }}>
                        Directly send payments to your driver seamlessly.
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{height: '100%', paddingTop: 5}}>
                  <IconMaterialIcons
                    name="arrow-forward-ios"
                    size={14}
                    color="#000"
                  />
                </View>
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
  presentationWindow: {
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(SendFundsEntry));
