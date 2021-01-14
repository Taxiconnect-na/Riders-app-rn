/* eslint-disable prettier/prettier */
import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {systemWeights} from 'react-native-typography';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

class WalletTransacRecords extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <TouchableOpacity style={styles.mainRecord}>
        <View>
          <IconMaterialIcons
            name="circle"
            size={6}
            style={{top: 8, marginRight: 7}}
          />
        </View>
        <View style={{flex: 1}}>
          <Text
            style={{fontFamily: 'Allrounder-Grotesk-Medium', fontSize: 17.5}}>
            Top-up
          </Text>
          <Text style={{fontFamily: 'Allrounder-Grotesk-Book', fontSize: 15.5}}>
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
              fontFamily: 'Allrounder-Grotesk-Regular',
              fontSize: 17.5,
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
    borderRadius: 7,
    marginBottom: 13,
    backgroundColor: '#fff',
    shadowColor: '#D0D0D0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 0.5,
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
  },
});

export default WalletTransacRecords;
