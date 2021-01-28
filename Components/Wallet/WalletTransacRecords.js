/* eslint-disable prettier/prettier */
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Platform} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

class WalletTransacRecords extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity style={styles.mainRecord}>
        <View>
          <IconCommunity
            name="square"
            size={6}
            style={{top: 10, marginRight: 7}}
          />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android' ? 'MoveBold' : 'Uber Move Bold',
              fontSize: 17,
            }}>
            Top-up
          </Text>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'Allrounder-Grotesk-Regular'
                  : 'Allrounder Grotesk Regular',
              color: '#a5a5a5',
              fontSize: 16,
            }}>
            Today at 15:45
          </Text>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',

            width: 55,
          }}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android' ? 'MoveRegular' : 'Uber Move Regular',
              fontSize: 17,
              color: '#0e8491',
            }}>
            N$50
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  mainRecord: {
    padding: 15,
    flexDirection: 'row',
    borderRadius: 3,
    marginBottom: 13,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
  },
});

export default WalletTransacRecords;
