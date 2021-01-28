import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';

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
                  ? 'Allrounder-Grotesk-Book'
                  : 'Allrounder Grotesk Book',
              fontSize: 16.5,
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

export default Notifiyer;
