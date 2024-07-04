
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Switch, ScrollView,
  ActivityIndicator, StyleSheet, Button, Alert, Modal, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform,Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import ColorPicker from 'react-native-wheel-color-picker';
import * as Crypto from 'expo-crypto';
import { getFormulaire } from '../../Services/AuthServices';



const FeuilleDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { codeFeuille, formData: existingFormData, qrCodeData } = route.params || {};
  // const { codeFeuille, formData: existingFormData } = route.params || {};
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedChoices, setSelectedChoices] = useState({});
  const [formData, setFormData] = useState(existingFormData || {});
  const [isConnected, setIsConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showModalCHOIX, setShowModalCHOIX] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [allRequiredFilled, setAllRequiredFilled] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedImage, setSelectedImage] = React.useState(null);
  const [showImagePicker, setShowImagePicker] = React.useState(false);
  const [selectedField, setSelectedField] = React.useState(null);

  // Fonction pour générer un UUID
const generateUUID = async () => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    (new Date()).toISOString()
  );
};

  useEffect(() => {
    console.log('codeFeuille:', codeFeuille);
  }, []);

  useEffect(() => {
    if (qrCodeData) {
      handleFieldChange(selectedField, qrCodeData);
    }
  }, [qrCodeData]);

  useEffect(() => {
    if (existingFormData) {
      setFormData(existingFormData);
    }
  }, []);
  
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const storedPermission = await AsyncStorage.getItem('mediaLibraryPermission');
        
        if (storedPermission === 'granted') {
          // Permission already granted
          return;
        }
        
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          // alert('Permission d\'accès à la bibliothèque de médias requise.');
        }
        
        await AsyncStorage.setItem('mediaLibraryPermission', status);
      }
    })();
  




    const handleConnectivityChange = async (state) => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        // Toast.show({
        //   type: 'error',
        //   text1: 'Connexion perdue',
        //   text2: 'Vous êtes hors connexion. Les données peuvent ne pas être à jour.'
        // });
        const storedData = await AsyncStorage.getItem(`formFields-${codeFeuille}`);
        if (storedData) {
          setFormFields(JSON.parse(storedData));
          setLoading(false);
        }
      } else {
        fetchFormFields();
      }
    };

    NetInfo.fetch().then(handleConnectivityChange);
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);
  

  const fetchFormFields = async () => {
    try {
      const data = await getFormulaire(codeFeuille);
      setFormFields(data);
      await AsyncStorage.setItem(`formFields-${codeFeuille}`, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la récupération des champs de formulaire:', error);
      const storedData = await AsyncStorage.getItem(`formFields-${codeFeuille}`);
      if (storedData) {
        setFormFields(JSON.parse(storedData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevData) => {
      const newData = { ...prevData, [fieldName]: value };

      // Check if all required fields are filled
      const allFilled = formFields.every(field => {
        if (field.requis) {
          // console.log(`Champ ${fieldName} mis à jour avec la valeur : ${value}`);
          return newData[field.nomColonne] !== undefined && newData[field.nomColonne] !== '';

        }
        return true;
      });

      setAllRequiredFilled(allFilled);
      return newData;
    });
  };

  // const selectImage = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setSelectedImage(result.assets[0].uri);
  //     handleFieldChange(selectedField, result.assets[0].uri);
  //     setShowImagePicker(false);
  //     console.log('Image sélectionnée : ', result.assets[0].uri);
  //   }
  // };

  // const takePhoto = async () => {
  //   let result = await ImagePicker.launchCameraAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setSelectedImage(result.assets[0].uri);
  //     handleFieldChange(selectedField, result.assets[0].uri);
  //     setShowImagePicker(false);
  //     console.log('Photo prise : ', result.assets[0].uri);
  //   }
  // };
  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      handleFieldChange(selectedField, result.assets[0].uri);
      setShowImagePicker(false);
      console.log('Image sélectionnée : ', result.assets[0].uri);
    }
  };
  
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      handleFieldChange(selectedField, result.assets[0].uri);
      setShowImagePicker(false);
      console.log('Photo prise : ', result.assets[0].uri);
    }
  };
  
  const handleSaveData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('savedFormData');
      const savedDataArray = savedData ? JSON.parse(savedData) : [];
  
      const newFormData = {
        ...formData,
        codeFeuille,
        id: existingFormData?.id || await generateUUID()
      };
  
      const dateData = {
        date: new Date().toISOString()
      };
  
      // Enregistrer les données du formulaire
      if (existingFormData) {
        const index = savedDataArray.findIndex(data => data.id === existingFormData.id);
        if (index !== -1) {
          savedDataArray[index] = newFormData;
        }
      } else {
        savedDataArray.push(newFormData);
      }
  
      await AsyncStorage.setItem('savedFormData', JSON.stringify(savedDataArray));
  
      // Enregistrer la date séparément
      await AsyncStorage.setItem(`dateData-${newFormData.id}`, JSON.stringify(dateData));
      
      Toast.show({
        type: 'success',
        text1: 'Données enregistrées',
        text2: 'Les données du formulaire ont été enregistrées avec succès.'
      });
  
      // Réinitialiser le formulaire après l'enregistrement
      setFormData({});
      setSelectedDate(new Date());
      setSelectedChoices({});
      setSelectedImage(null);
      console.log('Données du formulaire enregistrées :', newFormData);
      console.log('Date enregistrée :', dateData.date);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des données du formulaire:', error);
    }
  };
  
  
  
  
    // Initialiser formData avec les données existantes
  useEffect(() => {
    console.log('Received formData:', existingFormData);
    if (existingFormData) {
      setFormData(existingFormData);
      setLoading(false);
    }
  }, [existingFormData]);
  
  
  const renderField = (field) => {
    switch (field.type) {
      case 'TEXT':
          return (
            <View key={field.nomColonne} style={styles.fieldContainer}>
              <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
              <TextInput
                style={styles.input}
                value={formData[field.nomColonne] || ''}
                onChangeText={(text) => handleFieldChange(field.nomColonne, text)}
                placeholder={field.inputType === 'number' ? '0' : ''}
                keyboardType={field.inputType === 'number' ? 'numeric' : 'default'}
              />
            </View>
          );
          case 'COULEUR':
            return (
              <View key={field.nomColonne} style={styles.fieldContainer}>
                <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
                <TouchableOpacity onPress={() => { setShowColorPicker(true); setSelectedField(field.nomColonne); }}>
                  <View style={[styles.input, { backgroundColor: formData[field.nomColonne] || '#FFFFFF' }]}>
                    <Text style={{ color: formData[field.nomColonne] ? 'white' : 'black' }}>
                      {formData[field.nomColonne] || 'Sélectionnez une couleur'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Modal visible={showColorPicker} transparent={true}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <ColorPicker
                        color={currentColor}
                        onColorChange={(color) => setCurrentColor(color)}
                        thumbSize={40}
                        sliderSize={40}
                        noSnap={true}
                        row={false}
                        swatchesLast={true}
                        swatches={true}
                        discrete={false}
                        wheelLodingIndicator={<ActivityIndicator size={40} />}
                        sliderLodingIndicator={<ActivityIndicator size={20} />}
                        useNativeDriver={false}
                        useNativeLayout={false}
                      />
                      <Button title="Confirmer" onPress={() => {
                        handleFieldChange(selectedField, currentColor);
                        setShowColorPicker(false);
                      }} />
                      <Button title="Fermer" onPress={() => setShowColorPicker(false)} />
                    </View>
                  </View>
                </Modal>
              </View>
            );
            case 'FICHIER':
              return (
                <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            <TouchableOpacity onPress={() => { setShowImagePicker(true); setSelectedField(field.nomColonne); }}>
              <View style={styles.input}>
                {formData[field.nomColonne] ? (
                  <Image source={{ uri: formData[field.nomColonne] }} style={styles.imagePreview} />
                ) : (
                  <Text>Sélectionnez une image</Text>
                )}
              </View>
            </TouchableOpacity>
            <Modal visible={showImagePicker} transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Button title="Choisir dans la bibliothèque" onPress={selectImage} />
                  <Button title="Prendre une photo" onPress={takePhoto} />
                  <Button title="Annuler" onPress={() => setShowImagePicker(false)} />
                </View>
              </View>
            </Modal>
          </View>
              );
          

      case 'INT':
      case 'DOUBLE':
        return (
          <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData[field.nomColonne]?.toString() || ''}
              onChangeText={(value) => handleFieldChange(field.nomColonne, value)}
            />
          </View>
        );
        case 'DATE':
          return (
            <View key={field.nomColonne} style={styles.fieldContainer}>
              <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <View style={styles.input}>
                  <Text>{formData[field.nomColonne] || 'Sélectionnez une date'}</Text>
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={selectedDate}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      const formattedDate = new Date(date).toISOString().split('T')[0]; // Format YYYY-MM-DD
                      setSelectedDate(date);
                      handleFieldChange(field.nomColonne, formattedDate);
                    }
                  }}
                />
              )}
            </View>
          );
               
      case 'CHOIX':
        return (
          <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            <TouchableOpacity onPress={() => {
              setSelectedField(field.nomColonne);
              setModalData(field.choix);
              setShowModalCHOIX(true);
            }}>
              <View style={styles.input}>
                <Text>{selectedChoices[field.nomColonne] || 'Sélectionnez'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'CHECKBOX':
        return (
          <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            <Switch
              value={formData[field.nomColonne] || false}
              onValueChange={(value) => handleFieldChange(field.nomColonne, value)}
            />
          </View>
        );
      case 'FILE':
        return (
          <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            <Button
              title="Upload File"
              onPress={async () => {
                try {
                  const res = await DocumentPicker.getDocumentAsync({});
                  handleFieldChange(field.nomColonne, res.uri);
                  console.log(res.uri, res.type, res.name, res.size);
                } catch (err) {
                  if (DocumentPicker.isCancel(err)) {
                    console.log('Canceled');
                  } else {
                    throw err;
                  }
                }
              }}
            />
          </View>
        );
      
        
        case 'FEUILLE':
          return (
            <View key={field.nomColonne} style={styles.fieldContainer}>
              <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
              <TouchableOpacity onPress={() => {
                setSelectedField(field.nomColonne);
                setModalData(field.choix);
                setShowModal(true);
              }}>
                <View style={styles.input}>
                  <Text>{selectedChoices[field.nomColonne] || 'Sélectionnez un emplacement'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
      case 'CHOIX MULTIPLES':
        return (
          <View key={field.nomColonne} style={styles.fieldContainer}>
            <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
            {field.choix.map((option, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  value={formData[field.nomColonne]?.includes(option)}
                  onValueChange={(value) => {
                    let updatedChoices = formData[field.nomColonne] || [];
                    if (value) {
                      updatedChoices = [...updatedChoices, option];
                    } else {
                      updatedChoices = updatedChoices.filter((choice) => choice !== option);
                    }
                    handleFieldChange(field.nomColonne, updatedChoices);
                  }}
                />
                <Text>{option}</Text>
              </View>
            ))}
          </View>
        );
        case 'QRCODE':
          return (
            <View key={field.nomColonne} style={styles.fieldContainer}>
              <Text>{field.libelle}{field.requis && <Text style={styles.required}> *</Text>}</Text>
              <Button
                title="Scan QR Code"
                onPress={() => {
                  setSelectedField(field.nomColonne);
                  navigation.navigate('QrCodeScanner');
                }}
              />
            </View>
          );
      default:
        return null;
    }
  };
  const handleViewData = () => {
    navigation.navigate('SavedDataScreen', { codeFeuille });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        {formFields.map((field) => renderField(field))}
      </ScrollView>
      <View style={styles.buttonContainer}>
  <TouchableOpacity
    onPress={handleSaveData}
    disabled={!allRequiredFilled}
    style={[
      styles.saveButton,
      !allRequiredFilled && styles.disabledButton,
    ]}
  >
    <Text style={styles.buttonText}>Enregistrer</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={handleViewData}
    style={styles.dataButton}
  >
    <Text style={styles.buttonText}>Voir les données</Text>
  </TouchableOpacity>

</View>


      <Modal visible={showModal} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={modalData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setSelectedChoices((prevChoices) => ({
                    ...prevChoices,
                    [selectedField]: item.value,
                  }));
                  handleFieldChange(selectedField, item.value);
                  setShowModal(false);
                }}>
                  <Text style={styles.modalItem}>{item.value}</Text>
                </TouchableOpacity>
              )}
            />

            <Button title="Fermer" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={showModalCHOIX} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={modalData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  setSelectedChoices((prevChoices) => ({
                    ...prevChoices,
                    [selectedField]: item,
                  }));
                  handleFieldChange(selectedField, item);
                  setShowModalCHOIX(false);
                }}>
                  <Text style={styles.modalItem}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <Button title="Fermer" onPress={() => setShowModalCHOIX(false)} />
          </View>
        </View>
      </Modal>
      
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    width: '100%'
  },
  required: {
    color: 'red',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    padding: 10,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    paddingHorizontal: 20, 
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  }
  ,
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  dataButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  
});

export default FeuilleDetail;
