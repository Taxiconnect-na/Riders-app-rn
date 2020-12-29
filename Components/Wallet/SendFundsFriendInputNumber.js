import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconAnt from 'react-native-vector-icons/AntDesign';
import PhoneNumberInput from '../Modules/PhoneNumberInput/Components/PhoneNumberInput';

class SendFundsFriendInputNumber extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style={styles.mainWindow}>
        <View style={styles.presentationWindow}>
          <Text
            style={[
              systemWeights.semibold,
              {
                fontSize: 19,
                fontFamily: 'Allrounder-Grotesk-Book',
                marginBottom: 35,
              },
            ]}>
            What's the receiver's phone number?
          </Text>
          <PhoneNumberInput />

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
                You can only send funds to active TaxiConnect accounts.
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <TouchableOpacity
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
    padding: 20,
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

export default SendFundsFriendInputNumber;
