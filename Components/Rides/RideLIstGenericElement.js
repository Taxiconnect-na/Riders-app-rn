import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconOcticons from 'react-native-vector-icons/Octicons';

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
            <IconOcticons name="primitive-square" size={12} style={{top: 6}} />
          </View>
          <View style={{}}>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Regular',
                fontSize: 17,
                marginBottom: 5,
              }}>
              To{' '}
              {this.props.requestLightData.destination_name.length < 18
                ? this.props.requestLightData.destination_name
                : this.props.requestLightData.destination_name.substring(
                    0,
                    15,
                  ) + '...'}
            </Text>
            <Text
              style={{
                fontFamily: 'Allrounder-Grotesk-Book',
                fontSize: 14,
                marginBottom: 5,
              }}>
              {this.props.requestLightData.date_requested}
            </Text>
            <Text style={{fontFamily: 'Allrounder-Grotesk-Book', fontSize: 14}}>
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
  }
}

const styles = StyleSheet.create({
  rideItemMainView: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#d0d0d0',
    padding: 20,
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default RideLIstGenericElement;
