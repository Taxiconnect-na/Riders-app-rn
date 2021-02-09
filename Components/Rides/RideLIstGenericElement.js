import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconOcticons from 'react-native-vector-icons/Octicons';
import {RFValue} from 'react-native-responsive-fontsize';

class RideLIstGenericElement extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func onSelectThisRequest_forDetails
   * @param request_fp: the request fp for the request
   * Responsible for handling the selection of a specific ride for
   * more details, and auto move forward.
   */
  onSelectThisRequest_forDetails(request_fp) {
    this.props.parentNode.props.UpdateTargetedRequest_yourRides_history(
      request_fp,
    );
    this.props.parentNode.props.navigation.navigate(
      'DetailsRidesGenericScreen',
    );
  }

  render() {
    if (this.props.requestLightData.destination_name !== undefined) {
      return (
        <TouchableOpacity
          onPress={() =>
            this.onSelectThisRequest_forDetails(
              this.props.requestLightData.request_fp,
            )
          }
          style={styles.rideItemMainView}>
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{marginRight: 4}}>
              <IconOcticons
                name="primitive-square"
                size={12}
                style={{top: 6}}
              />
            </View>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextMedium'
                      : 'Uber Move Text Medium',
                  fontSize: RFValue(17),
                  marginBottom: 5,
                  flex: 1,
                }}>
                To{' '}
                {this.props.requestLightData.destination_name.length < 30
                  ? this.props.requestLightData.destination_name
                  : this.props.requestLightData.destination_name.substring(
                      0,
                      30,
                    ) + '...'}
              </Text>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextLight'
                      : 'Uber Move Text Light',
                  fontSize: RFValue(16),
                  marginBottom: 5,
                }}>
                {this.props.requestLightData.date_requested}
              </Text>
              <Text
                style={{
                  fontFamily:
                    Platform.OS === 'android'
                      ? 'UberMoveTextRegular'
                      : 'Uber Move Text',
                  fontSize: RFValue(16),
                  color: '#0e8491',
                }}>
                {this.props.requestLightData.car_brand}
              </Text>
            </View>
          </View>
          <View>
            <IconMaterialIcons
              name="arrow-forward-ios"
              size={15}
              color="#0e8491"
              style={{top: 3}}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  rideItemMainView: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default React.memo(RideLIstGenericElement);
