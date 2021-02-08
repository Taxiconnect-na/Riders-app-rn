import React from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback
    touchSoundDisabled={true}
    onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

export default React.memo(DismissKeyboard);
