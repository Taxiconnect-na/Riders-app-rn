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
  Image,
  ScrollView,
  SectionList,
} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DropDownPicker from 'react-native-dropdown-picker';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import WalletTransacRecords from './WalletTransacRecords';
import SyncStorage from 'sync-storage';

class WalletEntry extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let globalObject = this;
    //Add home going back handler-----------------------------
    this.props.navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();
      globalObject.props.navigation.navigate('Home_drawer');
      return;
    });
    //--------------------------------------------------------
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <View style={styles.presentationWindow}>
          <View
            style={{
              padding: 20,
              backgroundColor: '#0e8491',
              paddingBottom: 30,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,

              elevation: 5,
            }}>
            <View
              style={{
                flexDirection: 'row',
                height: 60,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 18,
                  color: '#fff',
                }}>
                Hey, Dominique
              </Text>
              <View
                style={{
                  width: 50,
                  height: 50,
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
                }}>
                <Image
                  source={require('../../Media_assets/Images/woman.webp')}
                  style={{
                    resizeMode: 'cover',
                    width: '100%',
                    height: '100%',
                    borderRadius: 200,
                  }}
                />
              </View>
            </View>
            <View style={{marginTop: 25}}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 35,
                  color: '#fff',
                }}>
                N$ 450
              </Text>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Book',
                  color: '#9AE8FF',
                  fontSize: 16,
                }}>
                Your balance
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 20,
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('SendFundsEntry')}
              style={[
                styles.selectMenu3,
                {marginRight: '7%', backgroundColor: '#0e8491', borderWidth: 0},
              ]}>
              <IconFeather name="share" size={30} color={'#fff'} />
              <Text style={[styles.textSelectMenu3, {color: '#fff'}]}>
                Send
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('WalletTopUpEntry')}
              style={[
                styles.selectMenu3,
                {marginRight: '7%', backgroundColor: '#0e8491', borderWidth: 0},
              ]}>
              <IconMaterialIcons
                name="account-balance-wallet"
                size={30}
                color={'#fff'}
              />
              <Text style={[styles.textSelectMenu3, {color: '#fff'}]}>
                Top-up
              </Text>
            </TouchableOpacity>
            <View style={[styles.selectMenu3, {borderWidth: 2, opacity: 0}]}>
              <IconMaterialIcons name="shield" size={30} />
              <Text style={styles.textSelectMenu3}>Secure</Text>
            </View>
          </View>
          <View style={{padding: 20, flex: 1}}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                paddingBottom: 10,
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Regular',
                  fontSize: 17.5,
                  color: '#999999',
                  paddingBottom: 15,
                  flex: 1,
                }}>
                History
              </Text>
              <Text
                style={{
                  fontFamily: 'Allrounder-Grotesk-Medium',
                  fontSize: 15,
                  color: '#999999',
                  paddingBottom: 15,
                }}>
                Show all
              </Text>
            </TouchableOpacity>

            <View style={{flex: 1}}>
              <SectionList
                sections={[
                  {
                    title: 'Top-up',
                    data: [{transaction_type: 'topup', amount: 50}],
                  },
                  {
                    title: 'Top-up',
                    data: [{transaction_type: 'topup', amount: 50}],
                  },
                ]}
                keyboardShouldPersistTaps={'always'}
                keyExtractor={(item, index) => item + index}
                renderItem={({item}) => <WalletTransacRecords />}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
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
  selectMenu3: {
    borderWidth: 1,
    width: '28%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  textSelectMenu3: {
    fontFamily: 'Allrounder-Grotesk-Medium',
    fontSize: 17,
    marginTop: 10,
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
  root: {flex: 1, padding: 20},
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

export default connect(mapStateToProps)(WalletEntry);
