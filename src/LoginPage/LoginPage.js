import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableWithoutFeedback, Keyboard, ScrollView, ActivityIndicator, Modal, Alert,ProgressBarAndroid } from 'react-native';
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
  const [isLinkValid, setIsLinkValid] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      // Vérifie si l'URL est valide à chaque changement de 'link'
      setIsLinkValid(isValidURL(link));
    }, [link]);

  const loginSubmit = async () => {
    try {
      setLoading(true);
      const response = await login(email, password);
      const user = response.Resultat[0];
      
      // AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('clp_structure', user.clp_structure);

      setLoading(false);
      navigation.replace('ProjectSelectionPage'); 
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

    if (link.endsWith('/')) {
      Alert.alert('Lien incorrect', 'Veuillez retirer la barre oblique (/) à la fin de l\'URL.');
      return;
    }
  
    setLinkLoading(true);
    try {
      const response = await fetch(link);
      if (response.ok) {
        setModalVisible(false);
        // Enregistrer l'URL personnalisée dans AsyncStorage
        await AsyncStorage.setItem('custom_baseURL', link);
        // Redémarrer l'application ou actualiser pour utiliser la nouvelle URL
      } else {
        Alert.alert('Lien invalide', 'Veuillez entrer un lien valide.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du lien :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification du lien.');
    } finally {
      setLinkLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Animatable.View animation="fadeInUp" style={styles.circleContainer}>
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
              <TouchableOpacity style={[styles.button, !isLinkValid && styles.disabledButton]} onPress={loginSubmit} disabled={!isLinkValid || loading}>
                <Text style={styles.buttonText}>{loading ? 'Connexion en cours...' : 'connexion'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={() => setModalVisible(true)}>
                <Icon name="link" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
  
          {loading && (
            <View style={[ { position: 'absolute', bottom: 20, alignSelf: 'center' }]}>
              <Text style={{ color: '#000000', textAlign:'center' }}>Chargement... {Math.round(progress)}%</Text>
            </View>
          )}
  
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
          <Modal
            transparent={true}
            animationType="none"
            visible={loading}
            onRequestClose={() => {}}
          >
            <View style={styles.modalBackground}>
              <View style={styles.activityIndicatorWrapper}>
                <ActivityIndicator
                  animating={loading}
                  size="large"
                  color="#FFFFFF"
                />
              </View>
            </View>
          </Modal>
  
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </View>
  
  );
};
const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },

});
export default LoginPage;











// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableWithoutFeedback, Keyboard, ScrollView, ActivityIndicator, Modal, Alert, ProgressBarAndroid } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as Animatable from 'react-native-animatable';
// import { useNavigation } from '@react-navigation/native';
// import { login, ListClasseur, getFeuille, getFormulaire } from '../../Services/AuthServices';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import styles from './Styles';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigation = useNavigation();
//   const [errorMessage, setErrorMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   const loginSubmit = async () => {
//     try {
//       setLoading(true);
//       const response = await login(email, password);
//       const user = response.Resultat[0];
      
//       await AsyncStorage.setItem('user', JSON.stringify(user));
//       await AsyncStorage.setItem('clp_structure', user.clp_structure);

//       // Charger les données après une connexion réussie
//       const classeurData = await ListClasseur(user.clp_structure);
//       await AsyncStorage.setItem('classeurData', JSON.stringify(classeurData));
//       setProgress(10); // Mettre à jour la progression

//       if (classeurData.classeur && classeurData.classeur.length > 0) {
//         const totalItems = classeurData.classeur.length * 2; // Classeur + Feuille
//         let loadedItems = 0;

//         for (const classeur of classeurData.classeur) {
//           const feuilleData = await getFeuille(classeur.Id, user.clp_structure);
//           await AsyncStorage.setItem(`feuilleData_${classeur.Id}`, JSON.stringify(feuilleData));
//           loadedItems++;
//           setProgress((loadedItems / totalItems) * 100); // Mettre à jour la progression

//           if (feuilleData.classeur && feuilleData.classeur.length > 0) {
//             for (const feuille of feuilleData.classeur) {
//               const formulaireData = await getFormulaire(feuille['Code_Feuille']);
//               await AsyncStorage.setItem(`formulaireData_${feuille['Code_Feuille']}`, JSON.stringify(formulaireData));
//               loadedItems++;
//               setProgress((loadedItems / totalItems) * 100); // Mettre à jour la progression
//             }
//           }
//         }
//       }

//       setLoading(false);
//       navigation.replace('home'); 
//     } catch (error) {
//       console.error('Erreur lors de la connexion:', error);
//       setLoading(false);
//       setErrorMessage('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
//       setTimeout(() => {
//         setErrorMessage('');
//       }, 3000);
//     }
//   };

//   return (
// <View style={styles.container}>
//   <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <ScrollView contentContainerStyle={styles.inner}>
//         <Animatable.View animation="fadeInUp" style={styles.circleContainer}>
//         </Animatable.View>
//         <Image style={styles.loginTopLogo} source={require('./../../assets/logo/ruche.png')} resizeMode="contain" />
//         <Text style={styles.title}>Ruche</Text>
//         <Text style={styles.subtitle}>Veuillez vous connecter pour continuer</Text>

//         <View style={styles.inputContainer}>
//           <Icon name="email" size={20} color="#000" />
//           <TextInput
//             style={styles.input}
//             placeholder="Identifiant"
//             placeholderTextColor="#666"
//             value={email}
//             onChangeText={setEmail}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="lock" size={20} color="#000" />
//           <TextInput
//             style={styles.input}
//             placeholder="Mot de passe "
//             placeholderTextColor="#666"
//             secureTextEntry
//             value={password}
//             onChangeText={setPassword}
//           />
//         </View>

//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.button} onPress={loginSubmit}>
//             <Text style={styles.buttonText}>{loading ? 'Connexion en cours...' : 'connexion'}</Text>
//           </TouchableOpacity>
//         </View>

//         {loading && (
//           <View style={[modalStyles.activityIndicatorWrapper, { position: 'absolute', bottom: 20, alignSelf: 'center' }]}>
//             <Text style={{ color: '#000000', textAlign:'center' }}>Chargement... {Math.round(progress)}%</Text>
//           </View>
//         )}

//         {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

//         <Modal
//           transparent={true}
//           animationType="none"
//           visible={loading}
//           onRequestClose={() => {}}
//         >
//           <View style={styles.modalBackground}>
//             <View style={styles.activityIndicatorWrapper}>
//               <ActivityIndicator
//                 animating={loading}
//                 size="large"
//                 color="#FFFFFF"
//               />
//             </View>
//           </View>
//         </Modal>

//       </ScrollView>
//     </TouchableWithoutFeedback>
//   </KeyboardAvoidingView>
// </View>

//   );
// };

// const modalStyles = StyleSheet.create({
//   modalBackground: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//   },
//   activityIndicatorWrapper: {
//     // backgroundColor: '#FFFFFF',
//     // height: 100,
//     // width: 100,
//     // borderRadius: 10,
//     // display: 'flex',
//     // alignItems: 'center',
//     // justifyContent: 'center'
//   }
// });

// export default LoginPage;
