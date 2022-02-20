import React from 'react';
import { StatusBar } from 'react-native';
import AppEntry from './src/AppEntry';

const App = () => {
  StatusBar.setHidden(true);
  return (
    <AppEntry />
  );
};

export default App;
