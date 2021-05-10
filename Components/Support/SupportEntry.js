import React from 'react';
import {connect} from 'react-redux';
import {
  Text,
  View,
  Image,
  StyleSheet,
  BackHandler,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import call from 'react-native-phone-call';
import {RFValue} from 'react-native-responsive-fontsize';
import AdManager from '../Modules/AdManager/AdManager';

class SupportEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this.backListener = null; //Responsible to hold the listener for the go back overwritter.
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMMOUNTED
    //...
    /*if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this.backListener !== null) {
      this.backListener = null;
    }*/
    this._navigatorEvent();
  }

  componentDidMount() {
    let globalObject = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    globalObject._navigatorEvent = this.props.navigation.addListener(
      'focus',
      () => {
        globalObject.backListener = globalObject.backHander = BackHandler.addEventListener(
          'hardwareBackPress',
          function () {
            globalObject.props.navigation.navigate('Home_drawer');
            return true;
          },
        );
        //Add home going back handler-----------------------------
        globalObject._navigatorEvent = globalObject.props.navigation.addListener(
          'beforeRemove',
          (e) => {
            // Prevent default behavior of leaving the screen
            e.preventDefault();
            if (/POP/i.test(e.data.action.type)) {
              globalObject.props.navigation.navigate('Home_drawer');
            }
            return;
          },
        );
      },
    );
    //--------------------------------------------------------
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <ScrollView style={styles.mainContainer}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingBottom: 50,
              }}>
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  marginBottom: '5%',
                }}>
                <View
                  style={{
                    width: '100%',
                    height: 120,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    source={this.props.App.supportMainImage}
                    style={{width: '60%', height: '100%', resizeMode: 'cover'}}
                  />
                </View>
                <Text
                  style={{
                    fontSize: RFValue(28),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'MoveMedium'
                        : 'Uber Move Text Medium',
                    marginTop: '3%',
                  }}>
                  We are here for you.
                </Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  marginTop: '2%',
                }}>
                <Text
                  style={{
                    textAlign: 'left',
                    fontSize: RFValue(17),
                    lineHeight: 23,
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                  }}>
                  If you need{' '}
                  <Text style={{fontWeight: 'bold'}}>assistance</Text> on using
                  The{' '}
                  <Text style={{fontWeight: 'bold', color: '#0e8491'}}>
                    TaxiConnect platform
                  </Text>
                  , contact Us.
                </Text>
                <Text
                  style={{
                    textAlign: 'left',
                    marginBottom: 20,
                    fontSize: RFValue(17),
                    lineHeight: 23,
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextLight'
                        : 'Uber Move Text Light',
                  }}>
                  In case of an{' '}
                  <Text style={{fontWeight: 'bold'}}>emergency</Text>, you can
                  contact the <Text style={{fontWeight: 'bold'}}>police</Text>.
                </Text>
              </View>
              {/**Buttons */}
              <TouchableOpacity
                style={[
                  styles.bttnGenericTc,
                  {marginBottom: 20, marginTop: '5%'},
                ]}
                onPress={() => call({number: '+264814400089', prompt: true})}>
                <IconCommunity
                  name="phone"
                  color={'#fff'}
                  size={20}
                  style={{marginRight: 5}}
                />
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    color: '#fff',
                  }}>
                  Contact TaxiConnect
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bttnGenericTc, {backgroundColor: '#CBCBCB'}]}
                onPress={() => call({number: '+2646110111', prompt: true})}>
                <IconCommunity
                  name="shield"
                  color={'#000'}
                  size={20}
                  style={{marginRight: 5}}
                />
                <Text
                  style={{
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextMedium'
                        : 'Uber Move Text Medium',
                    fontSize: RFValue(20),
                    color: '#000',
                  }}>
                  Call City Police
                </Text>
              </TouchableOpacity>
            </View>
            <AdManager />
          </ScrollView>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  bttnGenericTc: {
    borderColor: 'red',
    padding: 12,
    height: 60,
    width: '100%',
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

export default React.memo(connect(mapStateToProps)(SupportEntry));
