import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableWithoutFeedback, Keyboard, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { login } from '../../Services/AuthServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';

// Function to validate URL
const isValidURL = (string) => {
  const res = string.match(/(https?:\/\/[^\s]+)/g);
  return (res !== null);
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [link, setLink] = useState('');
  const navigation = useNavigation();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false); 

  const loginSubmit = async () => {
    try {
      setLoading(true);
      const response = await login(email, password);
      const user = response.Resultat[0];
      
      // AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('clp_structure', user.clp_structure);

      setLoading(false);
      navigation.replace('HomePage'); 
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setLoading(false);
      setErrorMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  const checkLinkAndNavigate = async () => {
    if (!isValidURL(link)) {
      Alert.alert('Lien invalide', 'Veuillez entrer un lien valide.');
      return;
    }

    setLinkLoading(true);
    try {
      const response = await fetch(link);
      if (response.ok) {
        setModalVisible(false);
        navigation.navigate('LoginPage', { link });
      } else {
        Alert.alert('Lien invalide', 'Veuillez entrer un lien valide.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du lien:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification du lien.');
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Animatable.View animation="fadeInUp" style={styles.circleContainer}>
            {/* <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} /> */}
          </Animatable.View>
          <Image style={styles.loginTopLogo} source={require('./../../assets/logo/ruche.png')} resizeMode="contain" />
          <Text style={styles.title}>Ruche</Text>
          <Text style={styles.subtitle}>Veuillez vous connecter pour continuer</Text>

          <View style={styles.inputContainer}>
            <Icon name="email" size={20} color="#000" />
            <TextInput
              style={styles.input}
              placeholder="Identifiant"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#000" />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe "
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={loginSubmit}>
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>connexion</Text>
              )}
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.linkButton} onPress={() => setModalVisible(true)}>
              <Icon name="link" size={20} color="#fff" />
            </TouchableOpacity> */}
          </View>

          {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

          <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Votre lien</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Entre URL"
                  value={link}
                  onChangeText={setLink}
                />
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={checkLinkAndNavigate}>
                    {linkLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonTextModal}>Verifie</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={styles.buttonTextModal}>fermer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
