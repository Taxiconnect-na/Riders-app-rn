import React from 'react';
import {connect} from 'react-redux';
import {Animated, ShapeSource} from '@react-native-mapbox-gl/maps';
import {point} from '@turf/helpers';
import bearing from '@turf/bearing';

class RenderClosestDrivers extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func updateClosestLiveDriversMap_render
   * Responsible for updating on the map the closest drivers after the response from the MAP service
   * is received.
   */
  updateClosestLiveDriversMap_render() {
    let globalObject = this;
    //Update the list of the closest drivers if no trip in progress
    if (
      this.props.App.isRideInProgress === false &&
      /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails)/i.test(
        this.props.App.bottomVitalsFlow.currentStep,
      ) &&
      this.props.App._CLOSEST_DRIVERS_DATA !== null &&
      this.props.App._CLOSEST_DRIVERS_DATA.length !== undefined &&
      this.props.App._CLOSEST_DRIVERS_DATA.length > 0 &&
      this.props.App.intervalProgressLoop === false
    ) {
      return this.props.App._CLOSEST_DRIVERS_DATA.map((driver, index) => {
        if (
          driver.driver_coordinates !== undefined &&
          driver.driver_coordinates !== null
        ) {
          //Compute the bearing
          let carBearing = bearing(
            point([
              parseFloat(driver.driver_coordinates.longitude),
              parseFloat(driver.driver_coordinates.latitude),
            ]),
            point([
              parseFloat(driver.prev_driver_coordinates.longitude),
              parseFloat(driver.prev_driver_coordinates.latitude),
            ]),
          );
          //...
          return (
            <ShapeSource
              key={index}
              id={'currentLocationSource' + index}
              shape={{
                type: 'Point',
                coordinates: [
                  parseFloat(driver.driver_coordinates.longitude),
                  parseFloat(driver.driver_coordinates.latitude),
                ],
              }}>
              <Animated.SymbolLayer
                id={'symbolCarLayer' + (index + 1)}
                minZoomLevel={1}
                //layerIndex={5000}
                style={{
                  iconAllowOverlap: false,
                  iconImage: globalObject.props.App.carIcon_black,
                  iconSize: globalObject.props.App.carIconRelativeSize,
                  iconRotate: carBearing,
                }}
              />
            </ShapeSource>
          );
        } else {
          return null;
        }
      });
      //return tmp;
    } else {
      return null;
    }
  }

  render() {
    return <>{this.updateClosestLiveDriversMap_render()}</>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(RenderClosestDrivers));
