import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  Animated,
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  PointAnnotation,
  MarkerView,
} from '@react-native-mapbox-gl/maps';
import {point} from '@turf/helpers';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import PulseCircleLayer from '../Modules/PulseCircleLayer';
import bearing from '@turf/bearing';
var turf = require('@turf/turf');
import {UpdateTinyCarOnMapIconSize} from '../Redux/HomeActionsCreators';
import {ROUTE} from './Route';

const AnnotationPickup = ({title}) => (
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
        height: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.7,

        elevation: 6,
        borderRadius: 3,
      }}>
      <View
        style={{
          backgroundColor: '#000',
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}
      />
      <View
        style={{
          justifyContent: 'center',
          paddingLeft: 5,
          paddingRight: 10,
        }}>
        <Text
          style={[{fontSize: 13.5, fontFamily: 'Allrounder-Grotesk-Regular'}]}>
          {title.length > 11 ? title.substring(0, 11) + '.' : title}
        </Text>
      </View>
    </View>
  </View>
);

const AnnotationDestination = ({title, etaInfos}) => (
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
        height: 35,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.7,

        elevation: 6,
        borderRadius: 3,
      }}>
      <View
        style={{
          backgroundColor: '#096ED4',
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
        }}>
        <Text
          style={[
            {
              fontSize: 13.5,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Regular',
            },
          ]}>
          {etaInfos.eta.split(' ')[0]}
        </Text>
        <Text
          style={[
            {
              fontSize: 11,
              color: '#fff',
              fontFamily: 'Allrounder-Grotesk-Regular',
              bottom: 1,
            },
          ]}>
          {etaInfos.eta.split(' ')[1].toUpperCase()}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          paddingLeft: 5,
          paddingRight: 10,
        }}>
        <Text style={[{fontSize: 13, fontFamily: 'Allrounder-Grotesk-Book'}]}>
          {title.length > 11 ? title.substring(0, 11) + '.' : title}
        </Text>
      </View>
    </View>
  </View>
);

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
    if (point !== false && label !== false) {
      point = {
        latitude: point[1],
        longitude: point[0],
      };
      //...
      if (point.latitude !== undefined && point.longitude !== false) {
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
              this.props.App.previewDestinationData.destinationAnchor = {
                x: 1,
                y: 0.4,
              };
            } else {
              this.props.App.previewDestinationData.originAnchor = {
                x: 1,
                y: 0.4,
              };
            }
          } //The point is closer to the NE bound
          else {
            if (label === 'destination') {
              this.props.App.previewDestinationData.destinationAnchor = {
                x: -0.1,
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

  /**
   * @func previewRouteToDestinationSnapshot
   * Responsible for showing to the user the way to the first destination after selecting
   * the destination location on the booking flow. -> Find the best anchor combination
   */
  previewRouteToDestinationSnapshot() {
    if (
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        undefined &&
      this.props.App.previewDestinationData.originDestinationPreviewData !==
        false
    ) {
      //Reposition MarkerViews optimally
      //Destination anchor
      this.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[
          this.props.App.previewDestinationData.originDestinationPreviewData
            .routePoints.coordinates.length - 1
        ],
        'destination',
      );
      //Origin anchor
      this.repositionMaviewMarker(
        this.props.App.previewDestinationData.originDestinationPreviewData
          .routePoints.coordinates[0],
        'origin',
      );

      //Fit to bounds
      this.props.parentNode.recalibrateMap();
      return (
        <>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ]
            }>
            <AnnotationDestination
              title={
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== undefined &&
                this.props.App.search_passengersDestinations
                  .passenger1Destination.location_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.location_name
                  : this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== undefined &&
                    this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name !== false
                  ? this.props.App.search_passengersDestinations
                      .passenger1Destination.street_name
                  : 'Destination'
              }
              etaInfos={{
                eta: this.props.App.previewDestinationData
                  .originDestinationPreviewData.eta,
              }}
            />
          </MarkerView>
          {/*<PulseCircleLayer
            radius={8}
            aboveLayerID={'lineRoutePickup'}
            innerCircleStyle={{
              circleColor: '#fff',
              circleStrokeColor: '#096ED4',
              circleStrokeWidth: 0.5,
            }}
            outerCircleStyle={{
              circleOpacity: 0.4,
              circleColor: '#096ED4',
            }}
            pulseRadius={20}
            shape={{
              type: 'Point',
              coordinates: this.props.App.previewDestinationData
                .originDestinationPreviewData.routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ],
            }}
          />*/}

          {/*<Animated.ShapeSource
            id={'shape'}
            shape={
              new Animated.Shape(
                this.props.App.previewDestinationData.originDestinationPreviewData.routePoints,
              )
            }>
            <Animated.LineLayer
              id={'lineRoutePickup'}
              style={{
                lineCap: 'square',
                lineWidth: 4,
                //lineOpacity: 0.8,
                lineColor: '#096ED4',
              }}
            />
            </Animated.ShapeSource>*/}
          <Animated.ShapeSource
            id={'shapeas'}
            shape={
              new Animated.Shape({
                type: 'LineString',
                coordinates: this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates,
              })
            }>
            <Animated.LineLayer
              id={'lineRoutePickupLine'}
              style={{
                lineCap: 'round',
                lineWidth: 3,
                lineOpacity: 1,
                lineColor: '#096ED4',
              }}
            />
          </Animated.ShapeSource>

          <PointAnnotation
            id={'originAnnotationPreview'}
            aboveLayerID={'lineRoutePickup'}
            //anchor={{x: -0.2, y: 0.5}}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[
                this.props.App.previewDestinationData
                  .originDestinationPreviewData.routePoints.coordinates.length -
                  1
              ]
            }>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: '#096ED4',
              }}
            />
          </PointAnnotation>
          <MarkerView
            id="riderPickupLocation_tooltip"
            anchor={this.props.App.previewDestinationData.originAnchor}
            //anchor={{x: 0, y: 1}}
            coordinate={
              this.props.App.previewDestinationData.originDestinationPreviewData
                .routePoints.coordinates[0]
            }>
            <AnnotationPickup
              title={
                this.props.App.search_pickupLocationInfos
                  .isBeingPickedupFromCurrentLocation === false &&
                this.props.App.search_pickupLocationInfos
                  .passenger0Destination !== false
                  ? this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== undefined &&
                    this.props.App.search_pickupLocationInfos
                      .passenger0Destination.location_name !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.location_name
                    : this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== undefined &&
                      this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street !== false
                    ? this.props.App.search_pickupLocationInfos
                        .passenger0Destination.street
                    : 'Pickup location'
                  : 'My location'
              }
            />
          </MarkerView>
        </>
      );
    } else {
      return null;
    }
  }

  renderDriverTracker() {
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
                lineWidth: 4,
                lineOpacity: 0.8,
                lineColor: '#000',
              }}
            />
          </Animated.ShapeSource>

          {/*<Animated.ShapeSource
            id="currentLocationSource"
            shape={
              new Animated.Shape({
                type: 'Point',
                coordinates: this.props.App.actPoint,
              })
            }>
            <Animated.CircleLayer
              id="currentLocationCircle"
              style={{
                circleOpacity: 1,
                circleColor: '#000',
                circleRadius: 10,
              }}
            />
            </Animated.ShapeSource>*/}
          {this.props.App.actPointToMinusOne === false ? (
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
      this.repositionMaviewMarker(
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
                  iconSize: this.props.App.carIconRelativeSize,
                  iconRotate: this.props.App.lastDriverBearing,
                }}
              />
            </Animated.ShapeSource>
          )}

          <PointAnnotation
            id="riderPickupLocation_tooltip"
            //anchor={{x: 1, y: 1}}
            anchor={this.props.App.previewDestinationData.destinationAnchor}
            coordinate={this.props.App.destinationPoint.map(parseFloat)}>
            <AnnotationDestination
              title={'Destination'}
              etaInfos={this.props.App.destinationLocation_metadata}
            />
          </PointAnnotation>
          {/*<Animated.ShapeSource
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
                iconImage: this.props.App.carIcon,
                iconSize: this.props.App.carIconRelativeSize,
                iconRotate: this.props.App.lastDriverBearing,
              }}
            />
            </Animated.ShapeSource>*/}
        </View>
      );
    } else if (/pending/i.test(this.props.App.request_status)) {
      //....
      //Pending request
      //Pickup location and request status bar
      return (
        <View>
          <PointAnnotation
            id="riderPickupLocation_tooltip"
            anchor={{x: 1, y: 1}}
            coordinate={this.props.App.pickupLocation_metadata.coordinates.map(
              parseFloat,
            )}>
            <AnnotationPickup title={'Pickup'} />
          </PointAnnotation>
        </View>
      );
    } else {
      return null;
    }
  }

  /**
   * @func updateClosestLiveDriversMap
   * Responsible for updating on the map the closest drivers after the response from the MAP service
   * is received.
   */
  updateClosestLiveDriversMap() {
    let globalObject = this;
    //Update the list of the closest drivers if no trip in progress
    if (
      this.props.App.isRideInProgress === false &&
      /(mainView|selectRideOrDelivery|identifyLocation|selectConnectMeOrUs|selectNoOfPassengers|addMoreTripDetails|selectCarTypeAndPaymentMethod|confirmFareAmountORCustomize)/i.test(
        this.props.App.bottomVitalsFlow.currentStep,
      ) &&
      this.props.App._CLOSEST_DRIVERS_DATA !== null &&
      this.props.App._CLOSEST_DRIVERS_DATA.length !== undefined &&
      this.props.App._CLOSEST_DRIVERS_DATA.length > 0
    ) {
      let tmp = this.props.App._CLOSEST_DRIVERS_DATA.map((driver, index) => {
        //Compute the bearing
        let carBearing = bearing(
          point([
            driver.driver_coordinates.longitude,
            driver.driver_coordinates.latitude,
          ]),
          point([
            driver.prev_driver_coordinates.longitude,
            driver.prev_driver_coordinates.latitude,
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
                driver.driver_coordinates.longitude,
                driver.driver_coordinates.latitude,
              ],
            }}>
            <Animated.SymbolLayer
              id={'symbolCarLayer' + (index + 1)}
              minZoomLevel={1}
              style={{
                iconAllowOverlap: true,
                iconImage: globalObject.props.App.carIcon_black,
                iconSize: globalObject.props.App.carIconRelativeSize,
                iconRotate: carBearing,
              }}
            />
          </ShapeSource>
        );
      });
      return tmp;
    } else {
      return null;
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
              ? false
              : this.props.App.bottomVitalsFlow.scrollEnabled
          }
          zoomEnabled={
            this.props.App.isRideInProgress
              ? false
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
          styleURL={'mapbox://styles/dominiquektt/ckax4kse10a791iofjbx59jzm'}>
          <Camera
            ref={(c) => (this.props.parentNode.camera = c)}
            zoomLevel={20}
            //centerCoordinate={[this.props.App.longitude, this.props.App.latitude]}
            //followUserLocation={this.props.App.isRideInProgress ? false : true} //<------------------BREAKS FITBOUNDS.
          />

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
                    circleColor: /(addMoreTripDetails|selectCarTypeAndPaymentMethod)/i.test(
                      this.props.App.bottomVitalsFlow.currentStep,
                    )
                      ? '#096ED4'
                      : '#0e8491',
                    circleStrokeColor: /(addMoreTripDetails|selectCarTypeAndPaymentMethod)/i.test(
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
                    coordinates: [
                      this.props.App.longitude,
                      this.props.App.latitude,
                    ],
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

          {this.previewRouteToDestinationSnapshot()}
          {this.renderDriverTracker()}
          {this.updateClosestLiveDriversMap()}
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

export default connect(mapStateToProps, mapDispatchToProps)(RenderMainMapView);
