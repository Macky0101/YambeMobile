import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { ListClasseur } from '../../Services/AuthServices';
import styles from './Styles';
import { MaterialIcons } from '@expo/vector-icons';

const HomePage = () => {
  const [classeurs, setClasseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { code_projet } = route.params; 

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const fetchData = async () => {
    try {
      const storedClasseurs = await AsyncStorage.getItem('classeurs');
      if (storedClasseurs) {
        setClasseurs(JSON.parse(storedClasseurs));
      }

      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        if (!code_projet) {
          throw new Error('Code du projet non trouvé');
        }

        const clp_structure = await AsyncStorage.getItem('clp_structure');
        const data = await ListClasseur(clp_structure, code_projet);  // Utiliser le code du projet pour obtenir les classeurs
        if (data && data.classeur) {
          setClasseurs(data.classeur);
          await AsyncStorage.setItem('classeurs', JSON.stringify(data.classeur));
          Toast.show({
            type: 'success',
            text1: 'Données mises à jour',
            text2: 'Les données ont été synchronisées depuis le serveur.',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connexion perdue',
          text2: 'Vous êtes hors connexion.',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des classeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      setIsLargeScreen(width >= 420);
    };

    Dimensions.addEventListener('change', updateLayout);
    updateLayout();

    return () => {
      Dimensions.addEventListener('change', updateLayout);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405189" />
      </View>
    );
  }

  const renderClasseurs = () => {
    const filteredClasseurs = classeurs.filter(item => 
      item['Libelle classeur'].toLowerCase().includes(searchText.toLowerCase())
    );

    if (filteredClasseurs.length === 0) {
      return <Text style={styles.emptyMessage}>Aucun classeur disponible</Text>;
    }

    return filteredClasseurs.map((item) => (
      <TouchableOpacity
        key={item.Id}
        style={isLargeScreen ? styles.largeScreenClasseurContainer : styles.classeurContainer}
        onPress={() => navigation.navigate('ClasseurDetails', { classeur: item })}
      >
        <View style={styles.classeur}>
          <View style={styles.folderIcon}>
            <View style={[styles.folderTop, { backgroundColor: item['Couleur classeur'] }]} />
            <View style={[styles.folderBody]}>
              <View style={styles.folderContent}>
                <Text style={styles.classeurTitle} ellipsizeMode="tail">
                  {item['Libelle classeur']}
                </Text>
                <Text style={styles.statistic}>Feuilles: {item['Nombre feuille']}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="black" style={styles.searchIcon} />
        <TextInput
          style={styles.searchbar}
          placeholder="Rechercher un classeur..."
          onChangeText={handleSearch}
          value={searchText}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      >
        {renderClasseurs()}
      </ScrollView>
    </View>
  );
};

export default HomePage;
