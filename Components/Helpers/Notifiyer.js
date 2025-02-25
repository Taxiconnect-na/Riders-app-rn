import React from 'react';
import {View, Text, Platform} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

class Notifiyer extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (
      this.props.active !== undefined &&
      this.props.active &&
      this.props.message
    ) {
      return (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            zIndex: 9000000,
            width: '100%',
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              this.props.color !== undefined ? this.props.color : '#096ED4',
          }}>
          <Text
            style={{
              fontFamily:
                Platform.OS === 'android'
                  ? 'UberMoveTextRegular'
                  : 'Uber Move Text',
              fontSize: RFValue(16.5),
              color: '#fff',
            }}>
            {this.props.message}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }
}

export default React.memo(Notifiyer);
