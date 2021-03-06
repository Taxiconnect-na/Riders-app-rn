import React from 'react';
import {View, Text} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

class AnnotationPickup extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View
        style={{
          padding: 10,
          width: 140,
          borderWidth: 1,
          borderColor: 'transparent',
        }}>
        <View
          style={{
            backgroundColor: '#fff',
            flexDirection: 'row',
            height: 40,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.7,

            elevation: 6,
            borderRadius: 2,
          }}>
          <View
            style={{
              backgroundColor: '#000',
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: 2,
              borderBottomLeftRadius: 2,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 5,
              paddingRight: 5,
              flex: 1,
            }}>
            <Text
              style={[
                {
                  fontSize: RFValue(13),
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  flex: 1,
                },
              ]}>
              {this.props.title.length > 17
                ? this.props.title.substring(0, 17) + '.'
                : this.props.title}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default React.memo(AnnotationPickup);
