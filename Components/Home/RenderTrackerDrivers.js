import React from 'react';
import {connect} from 'react-redux';
import {
  Animated,
  ShapeSource,
  CircleLayer,
  MarkerView,
} from '@react-native-mapbox-gl/maps';
import {Platform} from 'react-native';
import {View} from 'react-native';
import AnnotationDestination from './AnnotationDestination';
import AnnotationPickup from './AnnotationPickup';

class RenderTrackerDrivers extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func renderDriverTracker_render
   * Responsible for rndering the driver's car scenarios.
   */
  renderDriverTracker_render() {
    if (
      this.props.App.route != null &&
      this.props.App.route !== undefined &&
      this.props.App.isRideInProgress &&
      this.props.App.isInRouteToDestination === false &&
      /inRouteToPickup/i.test(this.props.App.request_status)
    ) {
      //Pickup scenarios animations
      return (
        <>
          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.shape,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'round',
                lineWidth: 5,
                lineOpacity: 0.8,
                lineColor: '#000',
              }}
            />
          </Animated.ShapeSource>

          {this.props.App.actPointToMinusOne === false ? (
            /inRouteToPickup/i.test(this.props.App.request_status) ? (
              <ShapeSource
                id="currentLocationSource"
                shape={{
                  type: 'Point',
                  coordinates:
                    this.props.App.lastDriverCoords == null
                      ? [0, 0]
                      : this.props.App.lastDriverCoords,
                }}>
                <CircleLayer
                  id="currentLocationCircle"
                  style={{
                    circleOpacity: 1,
                    circleColor: '#000',
                    circleRadius: 8,
                  }}
                />
              </ShapeSource>
            ) : null
          ) : (
            <Animated.ShapeSource
              id="symbolCarIcon"
              shape={
                new Animated.Shape({
                  type: 'Point',
                  coordinates: this.props.App.actPoint,
                })
              }>
              <Animated.SymbolLayer
                id="symbolCarLayer"
                minZoomLevel={1}
                style={{
                  iconAllowOverlap: true,
                  iconImage: this.props.App.carIcon,
                  iconSize: 0.28,
                  iconRotate: this.props.App.lastDriverBearing,
                }}
              />
            </Animated.ShapeSource>
          )}
        </>
      );
    } else if (
      this.props.App.routeDestination != null &&
      this.props.App.routeDestination !== undefined &&
      this.props.App.isRideInProgress &&
      this.props.App.isInRouteToDestination &&
      /inRouteToDestination/i.test(this.props.App.request_status)
    ) {
      this.props.parentNode.repositionMaviewMarker(
        this.props.App.destinationPoint,
        'destination',
      );
      //Destination routes animation scenarios
      return (
        <View>
          <Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.shapeDestination,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'round',
                lineWidth: 4,
                lineOpacity: 0.8,
                lineColor: '#000',
              }}
            />
          </Animated.ShapeSource>

          {this.props.App.actPointToMinusOne === false ? (
            /inRouteToPickup/i.test(this.props.App.request_status) ? (
              <ShapeSource
                id="currentLocationSource"
                shape={{
                  type: 'Point',
                  coordinates:
                    this.props.App.lastDriverCoords == null
                      ? [0, 0]
                      : this.props.App.lastDriverCoords,
                }}>
                <CircleLayer
                  id="currentLocationCircle"
                  style={{
                    circleOpacity: 1,
                    circleColor: '#000',
                    circleRadius: 8,
                  }}
                />
              </ShapeSource>
            ) : (
              <Animated.ShapeSource
                id="symbolCarIcon"
                shape={
                  new Animated.Shape({
                    type: 'Point',
                    coordinates: this.props.App.actPointDestination,
                  })
                }>
                <Animated.SymbolLayer
                  id="symbolCarLayer"
                  minZoomLevel={1}
                  style={{
                    iconAllowOverlap: true,
                    iconImage: this.props.App.carIcon_black,
                    iconSize: 0.28,
                    iconRotate: this.props.App.lastDriverBearing,
                  }}
                />
              </Animated.ShapeSource>
            )
          ) : (
            <Animated.ShapeSource
              id="symbolCarIcon"
              shape={
                new Animated.Shape({
                  type: 'Point',
                  coordinates: this.props.App.actPointDestination,
                })
              }>
              <Animated.SymbolLayer
                id="symbolCarLayer"
                minZoomLevel={1}
                style={{
                  iconAllowOverlap: true,
                  iconImage: this.props.App.carIcon_black,
                  iconSize: 0.28,
                  iconRotate: this.props.App.lastDriverBearing,
                }}
              />
            </Animated.ShapeSource>
          )}

          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={this.props.App.destinationPoint.map(parseFloat)}>
            <AnnotationDestination
              title={'Destination'}
              etaInfos={this.props.App.destinationLocation_metadata}
              showSuffix={false}
            />
          </MarkerView>
        </View>
      );
    } else if (
      /pending/i.test(this.props.App.request_status) &&
      this.props.App.isRideInProgress &&
      this.props.App.pickupLocation_metadata !== undefined &&
      this.props.App.pickupLocation_metadata !== null &&
      this.props.App.pickupLocation_metadata.coordinates !== undefined &&
      this.props.App.pickupLocation_metadata.coordinates !== null
    ) {
      //....
      //Pending request
      //Pickup location and request status bar
      return (
        <View>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={Platform.OS === 'android' ? {x: 1, y: 1} : {x: 1.5, y: 1}}
            coordinate={this.props.App.pickupLocation_metadata.coordinates.map(
              parseFloat,
            )}>
            <AnnotationPickup title={'Your pickup'} />
          </MarkerView>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    return <>{this.renderDriverTracker_render()}</>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default connect(mapStateToProps)(RenderTrackerDrivers);
