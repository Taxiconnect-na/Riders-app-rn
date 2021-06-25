import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Animated, MapView, Camera} from '@react-native-mapbox-gl/maps';
import {Platform} from 'react-native';
import {StyleSheet, ImageBackground} from 'react-native';
import PulseCircleLayer from '../Modules/PulseCircleLayer';
var turf = require('@turf/turf');
import {UpdateTinyCarOnMapIconSize} from '../Redux/HomeActionsCreators';
import RenderClosestDrivers from './RenderClosestDrivers';
import RenderTrackerDrivers from './RenderTrackerDrivers';
import PreviewRoute from './PreviewRoute';

class RenderMainMapView extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func repositionMaviewMarker
   * @param point: point next to which the MarkerView should be placed - required
   * @param label: to know which kind of state variable to update (destination or origin markerView stuff), can be "destination" or "origin" - Required
   * Responsible for placing optimally ANY MarkerView next to any point provided in the current
   * bounded area of the map.
   */
  async repositionMaviewMarker(point = false, label = false) {
    if (
      point !== false &&
      label !== false &&
      this.props.parentNode !== undefined &&
      this.props.parentNode != null
    ) {
      point = {
        latitude: point[1],
        longitude: point[0],
      };
      //...
      if (
        point.latitude !== undefined &&
        point.longitude !== false &&
        this.props.parentNode !== undefined &&
        this.props.parentNode != null
      ) {
        //Check if the camera module's ready
        if (
          this.props.parentNode.camera !== undefined &&
          this.props.parentNode.camera !== null &&
          this.props.parentNode.camera != null &&
          this.props.parentNode._map !== undefined &&
          this.props.parentNode._map !== null
        ) {
          //Find the current bounds - [longitude, latitude] - NE and SW points
          const currentBounds = await this.props.parentNode._map.getVisibleBounds();
          let NEBound = currentBounds[0];
          let SWBound = currentBounds[1];
          //...Convert bounds to turfs
          let NEBoundTurf = turf.point([NEBound[1], NEBound[0]]);
          let SWBoundTurf = turf.point([SWBound[1], SWBound[0]]);
          //..Convert ppoint provided to turf
          let targetPointTurf = turf.point([point.latitude, point.longitude]);
          //Find the relevant distances
          /**
           * Find the closest bounds to the provided point (@param point)
           * and deduce appropriate anchor position.
           */
          let toNEDistance = turf.distance(NEBoundTurf, targetPointTurf, {
            units: 'miles',
          });
          let toSWDistance = turf.distance(SWBoundTurf, targetPointTurf, {
            units: 'miles',
          });
          //Compare the distances
          if (toNEDistance > toSWDistance) {
            //The point is closer to the SW bound
            if (label === 'destination') {
              this.props.App.previewDestinationData.destinationAnchor =
                Platform.OS === 'android'
                  ? {
                      x: 1,
                      y: 0.4,
                    }
                  : {
                      x: 0,
                      y: 0.4,
                    };
            } else {
              this.props.App.previewDestinationData.originAnchor =
                Platform.OS === 'android'
                  ? {
                      x: 1,
                      y: 0.4,
                    }
                  : {
                      x: 1.5,
                      y: 0.4,
                    };
            }
          } //The point is closer to the NE bound
          else {
            if (label === 'destination') {
              this.props.App.previewDestinationData.destinationAnchor = {
                x: 0,
                y: 0.9,
              };
            } else {
              this.props.App.previewDestinationData.originAnchor = {
                x: -0.05,
                y: 0.9,
              };
            }
          }
        } else {
          return {x: 0, y: 0};
        }
      }
    }
  }

  async normalizeCarSizeToZoom() {
    if (
      this.props.parentNode._map !== undefined &&
      this.props.parentNode._map != null
    ) {
      //Hook the recenter button state function
      this.props.parentNode.updateCenterMapButton();
      //...
      /*if (
        this.props.parentNode._map !== undefined &&
        this.props.parentNode._map != null
      ) {
        const mapZoom = await this.props.parentNode._map.getZoom();
        let carIconUpdateSize = this.props.App.carIconRelativeSize / mapZoom;
        //let carIconUpdateSize = 0.3;

        /*if (mapZoom < 12.6 && mapZoom >= 10.6) {
        carIconUpdateSize -= 0.08;
      } else if (mapZoom < 10.6) {
        carIconUpdateSize -= 0.08;
      }*/
      //...
      /*if (carIconUpdateSize > 0.28) {
        carIconUpdateSize = 0.28;
      } else if (carIconUpdateSize < 0.18) {
        carIconUpdateSize = 0.18;
      }
        //Update Icon
        if (this.props.App.carIconRelativeSize !== carIconUpdateSize) {
          this.props.UpdateTinyCarOnMapIconSize(carIconUpdateSize);
        }
      }*/
    }
  }

  customRenderOrderer() {
    //! Coordinates order fix - major bug fix for ocean bug
    let userLatitude = this.props.App.latitude;
    let userLongitude = this.props.App.longitude;
    //? Recenter the userr location Pin based on the custom location if provided.
    if (
      this.props.App.search_pickupLocationInfos
        .isBeingPickedupFromCurrentLocation === false &&
      this.props.App.search_pickupLocationInfos.passenger0Destination !== false
    ) {
      userLatitude = this.props.App.search_pickupLocationInfos
        .passenger0Destination.coordinates[1];
      userLongitude = this.props.App.search_pickupLocationInfos
        .passenger0Destination.coordinates[0];
    }
    //...
    if (
      userLatitude !== undefined &&
      userLatitude !== null &&
      userLatitude !== 0 &&
      userLongitude !== undefined &&
      userLongitude !== null &&
      userLongitude !== 0
    ) {
      //? Switch latitude and longitude - check the negative sign
      if (parseFloat(userLongitude) < 0) {
        //Negative - switch
        let latitudeTmp = userLatitude;
        userLatitude = userLongitude;
        userLongitude = latitudeTmp;
      }
    }
    //!--------- Ocean bug fix
    //...
    if (this.props.App.gprsGlobals.hasGPRSPermissions) {
      return (
        <MapView
          ref={(c) => (this.props.parentNode._map = c)}
          style={styles.map}
          onDidFinishLoadingMap={() => this.props.parentNode.recalibrateMap()}
          onUserLocationUpdate={() => this.props.parentNode.recalibrateMap()}
          onDidFailLoadingMap={() => this.props.parentNode.recalibrateMap()}
          onDidFinishRenderingMapFully={() =>
            this.props.parentNode.recalibrateMap()
          }
          onRegionDidChange={() => this.normalizeCarSizeToZoom()}
          scrollEnabled={
            this.props.App.isRideInProgress
              ? true
              : this.props.App.bottomVitalsFlow.scrollEnabled
          }
          zoomEnabled={
            this.props.App.isRideInProgress
              ? true
              : this.props.App.bottomVitalsFlow.zoomEnabled
          }
          rotateEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.rotateEnabled
          }
          pitchEnabled={
            this.props.App.isRideInProgress
              ? false
              : this.props.App.bottomVitalsFlow.pitchEnabled
          }
          attributionEnabled={false}
          compassEnabled={false}
          id={'mainMapViewElement'}
          styleURL={'mapbox://styles/masterroot/ckq3roasw2m4u18mjz8xkoale'}>
          <Camera
            ref={(c) => (this.props.parentNode.camera = c)}
            //followUserMode="compass"
            zoomLevel={20}
          />

          <PreviewRoute
            parentNode={this.props.parentNode}
            parentNodeDirect={this}
          />
          <RenderTrackerDrivers parentNode={this} />
          <RenderClosestDrivers />

          {this.props.App.isRideInProgress === false ||
          /riderDropoffConfirmation_left/i.test(
            this.props.App.request_status,
          ) ? (
            /riderDropoffConfirmation_left/i.test(
              this.props.App.request_status,
            ) === false ? (
              <>
                <Animated.ShapeSource
                  id={'shape'}
                  aboveLayerID={'lineRoutePickup'}
                  shape={
                    new Animated.Shape({
                      type: 'LineString',
                      coordinates: [
                        [0, 0],
                        [1, 1],
                      ],
                    })
                  }>
                  <Animated.LineLayer id={'lineRoutePickup'} />
                </Animated.ShapeSource>
                <PulseCircleLayer
                  radius={10}
                  pulseRadius={25}
                  aboveLayerID={'lineRoutePickup'}
                  innerCircleStyle={{
                    circleColor: '#fff',
                    circleStrokeColor: '#000',
                    circleStrokeWidth: 0.5,
                  }}
                  innerCirclePulseStyle={{
                    circleColor: /(addMoreTripDetails|selectCarTypeAndPaymentMethod|confirmFareAmountORCustomize|gettingRideProcessScreen|errorRequestingProcessScreen)/i.test(
                      this.props.App.bottomVitalsFlow.currentStep,
                    )
                      ? '#096ED4'
                      : '#0e8491',
                    circleStrokeColor: /(addMoreTripDetails|selectCarTypeAndPaymentMethod|confirmFareAmountORCustomize|gettingRideProcessScreen|errorRequestingProcessScreen)/i.test(
                      this.props.App.bottomVitalsFlow.currentStep,
                    )
                      ? '#000'
                      : '#0e8491',
                  }}
                  outerCircleStyle={{
                    circleOpacity: 0.4,
                    circleColor: '#000',
                  }}
                  shape={{
                    type: 'Point',
                    coordinates: [userLongitude, userLatitude],
                  }}
                />
              </>
            ) : null
          ) : /pending/i.test(this.props.App.request_status) ? (
            <>
              <Animated.ShapeSource
                id={'shape'}
                aboveLayerID={'lineRoutePickup'}
                shape={
                  new Animated.Shape({
                    type: 'LineString',
                    coordinates: [
                      [0, 0],
                      [1, 1],
                    ],
                  })
                }>
                <Animated.LineLayer id={'lineRoutePickup'} />
              </Animated.ShapeSource>
              {this.props.App.pickupLocation_metadata !== undefined &&
              this.props.App.pickupLocation_metadata !== null &&
              this.props.App.pickupLocation_metadata.coordinates !==
                undefined &&
              this.props.App.pickupLocation_metadata.coordinates !== null ? (
                <PulseCircleLayer
                  radius={10}
                  aboveLayerID={'lineRoutePickup'}
                  pulseRadius={25}
                  shape={{
                    type: 'Point',
                    coordinates: this.props.App.pickupLocation_metadata.coordinates.map(
                      parseFloat,
                    ),
                  }}
                />
              ) : null}
            </>
          ) : /inRouteToDestination/i.test(this.props.App.request_status) ? (
            <PulseCircleLayer
              radius={10}
              pulseRadius={25}
              aboveLayerID={'lineRoutePickup'}
              innerCircleStyle={{
                circleColor: '#fff',
                circleStrokeColor: '#007fff',
                circleStrokeWidth: 0.5,
              }}
              outerCircleStyle={{
                circleOpacity: 0.4,
                circleColor: '#007fff',
              }}
              shape={{
                type: 'Point',
                coordinates: this.props.App.destinationPoint.map(parseFloat),
              }}
            />
          ) : (
            <PulseCircleLayer
              radius={10}
              pulseRadius={25}
              aboveLayerID={'lineRoutePickup'}
              shape={{
                type: 'Point',
                coordinates: this.props.App.pickupPoint,
              }}
            />
          )}
        </MapView>
      );
    } //Close the interface until proper GRPS detected
    else {
      //Stop animation by default
      this.props.parentNode.resetAnimationLoader();
      return (
        <ImageBackground
          source={this.props.App.backgroundVirgin}
          style={{
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center',
            opacity: 0.1,
          }}
        />
      );
    }
  }

  render() {
    return <>{this.customRenderOrderer()}</>;
  }
}

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      UpdateTinyCarOnMapIconSize,
    },
    dispatch,
  );

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default React.memo(
  connect(mapStateToProps, mapDispatchToProps)(RenderMainMapView),
);
