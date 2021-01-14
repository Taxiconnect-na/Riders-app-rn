import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  ResetGenericPhoneNumberInput,
  UpdateErrorModalLog,
} from '../Redux/HomeActionsCreators';

class HeaderRideTypesSelector extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  /**
   * @func showModalRideTypes
   * Responsible for showing the modal where it will be possible to
   * select the ride type.
   */
  showModalRideTypes() {
    this.props.UpdateErrorModalLog(true, 'show_select_ride_type_modal', 'any');
  }

  render() {
    return (
      <>
        <TouchableOpacity
          onPress={() => this.showModalRideTypes()}
          style={styles.mainWindow}>
          <Text
            style={{fontFamily: 'Allrounder-Grotesk-Regular', fontSize: 18}}>
            {this.props.App.shownRides_types}
          </Text>
        </TouchableOpacity>
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    borderWidth: 1,
    borderRadius: 200,
    borderColor: '#d0d0d0',
    backgroundColor: '#f0f0f0',
    right: 20,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9000000,
    minWidth: 100,
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      ResetGenericPhoneNumberInput,
      UpdateErrorModalLog,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderRideTypesSelector);
