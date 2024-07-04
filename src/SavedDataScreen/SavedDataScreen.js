import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';


const columnMapping = {
  col0: 'Region',
  col1: 'Cercle',
  col2: 'Code de regions',
  col3: 'Coordonnees',
  col4: 'Date de collecte',
  col5: 'Attribution en couleur',
  col6: 'Image',
  col7: 'Nombre homme inscrit',
  col8: 'Nombre femme inscrit',
  col11: 'Prix unitaire',
  col12: 'Nombre vendu',
  col14: 'Premier trimestre',
  col15: 'Deuxieme trimestre',
  col16: 'Troisieme trimestre',
  col19: 'Trimestres valides',
  col20: 'Qr code',
  col21: 'Localite',
};

const SavedDataScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { codeFeuille } = route.params || {};
  const [savedData, setSavedData] = useState([]);
  const [expandedItems, setExpandedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [clpNom, setClpNom] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allDataSent, setAllDataSent] = useState(false); 


  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await AsyncStorage.getItem('savedFormData');
      const parsedData = data ? JSON.parse(data) : [];
      const filteredData = parsedData.filter(item => item.codeFeuille === codeFeuille);
      console.log('Données récupérées après actualisation:', filteredData);
      setSavedData(filteredData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem('savedFormData');
        const parsedData = data ? JSON.parse(data) : [];
        const filteredData = parsedData.filter(item => item.codeFeuille === codeFeuille);
        setSavedData(filteredData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données enregistrées:', error);
      }
    };

    fetchData();
  }, [codeFeuille]);

  useEffect(() => {
    checkLocationEnabled();
  }, []);

  const checkLocationEnabled = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('L’autorisation d’accéder à l’emplacement a été refusée');
      setLocationEnabled(false);
      return;
    }

    setLocationEnabled(true);

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);
      setLocation(null);
    }
  };

  const toggleItemExpansion = (index) => {
    setExpandedItems(prevExpandedItems => {
      const expanded = [...prevExpandedItems];
      expanded[index] = !expanded[index];
      return expanded;
    });
  };

  const handleItemPress = (index) => {
    toggleItemExpansion(index);
  };

  const handleLongPress = (index) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => deleteItem(index),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const deleteItem = async (index) => {
    try {
      const data = await AsyncStorage.getItem('savedFormData');
      const parsedData = data ? JSON.parse(data) : [];
      const itemToDelete = savedData[index];
      const updatedData = parsedData.filter(item => item.id !== itemToDelete.id);
      await AsyncStorage.setItem('savedFormData', JSON.stringify(updatedData));
      const filteredData = updatedData.filter(item => item.codeFeuille === codeFeuille);
      setSavedData(filteredData);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enregistrement:', error);
    }
  };

  const handleEditPress = (item) => {
    navigation.navigate('FeuilleDetail', { codeFeuille: item.codeFeuille, formData: item });
  };

  useEffect(() => {
    const fetchClpNom = async () => {
      try {
        const clpNomFromStorage = await AsyncStorage.getItem('clp_nom');
        if (clpNomFromStorage) {
          setClpNom(clpNomFromStorage);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de clp_nom depuis AsyncStorage:', error);
      }
    };

    fetchClpNom();
  }, []);

  const sendData = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert('Erreur', 'Aucune connexion Internet. Veuillez réessayer plus tard.');
      return;
    }

    if (!locationEnabled) {
      Alert.alert('Erreur', 'Veuillez activer votre position avant d\'envoyer les données.');
      return;
    }

    setLoading(true);
    setProgress(0);

    const { coords: { latitude, longitude } } = location;
    const totalItems = savedData.length;

    for (let i = 0; i < totalItems; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { id, codeFeuille, ...item } = savedData[i];
        const tableName = await AsyncStorage.getItem(`Table_${codeFeuille}`);
        const dateData = await AsyncStorage.getItem(`dateData-${id}`);
        const date = dateData ? new Date(JSON.parse(dateData).date) : null;

        if (!tableName) {
          Alert.alert('Erreur', `Le nom de la table pour Code_Feuille ${codeFeuille} n'a pas pu être récupéré.`);
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('Table_Feuille', tableName);
        formData.append('Login', clpNom);
        formData.append('LG', longitude.toString());
        formData.append('LT', latitude.toString());

        // Ajouter les colonnes dynamiques et leurs valeurs
        const columnsToInclude = Object.keys(item).filter(key => key !== 'id' && key !== 'codeFeuille');
        columnsToInclude.forEach(col => {
          formData.append(`Colonne[]`, col);
          formData.append(`Values[]`, item[col]);
          formData.append(`Type[]`, typeof item[col]);
        });

        // Ajouter la date formatée si elle est disponible
        if (date) {
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
          formData.append('Date_Insertion', formattedDate);
        }

        console.log('Données à envoyer :', formData);

        const response = await axios.post('https://demo-swedd.org/api/InsertionFormulaire.php', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Réponse de l\'API :', response.data);

        if (response.status === 200 && !response.data.error) {
          deleteItem(i);

          Toast.show({
            type: 'success',
            text1: 'Succès',
            text2: 'Les données ont été envoyées avec succès.'
          });
        } else {
          throw new Error(response.data.error || 'Erreur lors de l\'envoi des données');
        }

        setProgress(((i + 1) / totalItems) * 100);
      } catch (error) {
        console.error('Erreur lors de l\'envoi des données :', error);

        Alert.alert(
          'Erreur',
          error.message || 'Une erreur est survenue lors de l\'envoi des données. Veuillez réessayer plus tard.',
          [{ text: 'OK' }]
        );

        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: 'Erreur lors de l\'envoi des données. Veuillez réessayer plus tard.'
        });

        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setAllDataSent(true);
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.progressText}>{`Envoi en cours: ${Math.round(progress)}%`}</Text>
        </View>
      )}
      <FlatList
        data={savedData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleItemPress(index)}
            onLongPress={() => handleLongPress(index)}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.itemText}>
                {`${columnMapping.col0}: ${item.col0}`}
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => toggleItemExpansion(index)}>
                  <Icon name={expandedItems[index] ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleEditPress(item)}>
                  <Icon name="edit" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            {expandedItems[index] && (
              <View style={styles.detailsContainer}>
                {Object.entries(item)
                  .filter(([key]) => key !== 'codeFeuille')
                  .filter(([key]) => key !== 'id')
                  .map(([key, value]) => (
                    <View key={key} style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>{columnMapping[key]}:</Text>
                      <Text style={styles.fieldValue}>{value}</Text>
                    </View>
                  ))}
              </View>
            )}
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />
  <TouchableOpacity 
  style={[
    styles.sendButton, 
    { backgroundColor: savedData.length === 0 ? '#ccc' : '#009900' }
  ]}
  onPress={sendData}
  disabled={savedData.length === 0}
>
  <Text style={styles.sendButtonText}>Envoyer les données</Text>
</TouchableOpacity>

      {allDataSent && !loading && (  // Affiche un message de succès lorsque toutes les données sont envoyées
  <View style={styles.successContainer}>
    <Text style={styles.successText}>Toutes les données ont été envoyées avec succès.</Text>
  </View>
)}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  detailsContainer: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    color: 'blue',
  },
  fieldValue: {
    color: 'green',
  },
  sendButton: {
    backgroundColor: '#009900',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  successContainer: {  // Nouveau style pour le message de succès
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#dff0d8',
    marginVertical: 20,
    borderRadius: 5,
  },
  successText: {  // Nouveau style pour le texte de succès
    color: '#3c763d',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SavedDataScreen;
