import React from 'react';
import {View, Text, Platform} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

class AnnotationDestination extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    //? Replace Samora Machel Constituency by Wanaheda

    return (
      <View
        style={{
          padding: 10,
          width: this.props.showSuffix ? 140 : 57,
          borderWidth: 1,
          borderColor: 'transparent',
        }}>
        <View
          style={{
            backgroundColor: this.props.showSuffix ? '#fff' : '#096ED4',
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
              backgroundColor: '#096ED4',
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: 2,
              borderBottomLeftRadius: 2,
            }}>
            <Text
              style={[
                {
                  fontSize: RFValue(13.5),
                  color: '#fff',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                },
              ]}>
              {this.props.etaInfos.eta.split(' ')[0]}
            </Text>
            <Text
              style={[
                {
                  fontSize: RFValue(11),
                  color: '#fff',
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  bottom: 1,
                },
              ]}>
              {this.props.etaInfos.eta !== undefined &&
              this.props.etaInfos.eta !== null &&
              this.props.etaInfos.eta.split(' ') !== undefined &&
              this.props.etaInfos.eta.split(' ') !== null &&
              this.props.etaInfos.eta.split(' ')[1] !== undefined &&
              this.props.etaInfos.eta.split(' ')[1] !== null
                ? this.props.etaInfos.eta.split(' ')[1].toUpperCase()
                : '...'}
            </Text>
          </View>
          {this.props.showSuffix ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 5,
                paddingLeft: 5,
                flex: 1,
              }}>
              <Text
                style={[
                  {
                    fontSize: RFValue(12),
                    fontFamily:
                      Platform.OS === 'android'
                        ? 'UberMoveTextRegular'
                        : 'Uber Move Text',
                    flex: 1,
                  },
                ]}>
                {this.props.title.length > 17
                  ? /Samora Machel Constituency/i.test(this.props.title)
                    ? 'Wanaheda'
                    : `${this.props.title.substring(0, 17)} .`
                  : this.props.title}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }
}

export default React.memo(AnnotationDestination);
