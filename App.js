import React from 'react';
import { StyleSheet } from 'react-native';
import Routes from './Routes/Routes';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <>
      <Routes />
      <Toast />
    </>
  );
}
