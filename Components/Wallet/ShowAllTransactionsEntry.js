import React from 'react';
import {connect} from 'react-redux';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import WalletTransacRecords from './WalletTransacRecords';
import DismissKeyboard from '../Helpers/DismissKeyboard';
import {FlatList} from 'react-native-gesture-handler';

class ShowAllTransactionsEntry extends React.PureComponent {
  constructor(props) {
    super(props);

    this._isMounted = true; //! RESPONSIBLE TO LOCK PROCESSES IN THE MAIN SCREEN WHEN UNMOUNTED.

    //Handlers
    this.backHander = null;
    this._navigatorEvent = null;
  }

  componentWillUnmount() {
    this._isMounted = false; //! MARK AS UNMOUNTED
    //...
    if (this.backHander !== null) {
      this.backHander.remove();
    }
    //...
    if (this._navigatorEvent !== null) {
      this._navigatorEvent();
      this._navigatorEvent = null;
    }
  }

  componentDidMount() {
    let globalObject = this;
    this._isMounted = true;

    //? Add navigator listener - auto clean on focus
    this._navigatorEvent = globalObject.props.navigation.addListener(
      'focus',
      () => {
        console.log('focused');
      },
    );
    this.backHander = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        globalObject.props.navigation.goBack();
        return true;
      },
    );
  }

  render() {
    return (
      <>
        {this._isMounted ? (
          <DismissKeyboard>
            <SafeAreaView style={styles.mainWindow}>
              <StatusBar backgroundColor="#000" />
              <View style={styles.presentationWindow}>
                <FlatList
                  data={this.props.App.wallet_state_vars.transactions_details}
                  keyboardShouldPersistTaps={'always'}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({item}) => (
                    <WalletTransacRecords transactionDetails={item} />
                  )}
                />
              </View>
            </SafeAreaView>
          </DismissKeyboard>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  mainWindow: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    padding: 5,
    paddingTop: 10,
  },
  presentationWindow: {
    flex: 1,
  },
});

const mapStateToProps = (state) => {
  const {App} = state;
  return {App};
};

export default React.memo(connect(mapStateToProps)(ShowAllTransactionsEntry));
