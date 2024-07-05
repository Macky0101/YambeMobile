import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListClasseur } from '../../Services/AuthServices';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const Home = () => {
  const [classeurs, setClasseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ clp_nom: '', clp_prenom: '' });
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
    getUserInfo();
  }, []);

  const fetchData = async () => {
    try {
      const clp_structure = await AsyncStorage.getItem('clp_structure');
      if (!clp_structure) {
        throw new Error('clp_structure non trouvé dans AsyncStorage');
      }
      const data = await ListClasseur(clp_structure);

      if (data && data.classeur) {
        console.log('Données des classeurs reçues:', data.classeur);
        setClasseurs(data.classeur);
      } else {
        console.log('Pas de classeurs dans les données reçues.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des classeurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async () => {
    const clp_nom = await AsyncStorage.getItem('clp_nom');
    const clp_prenom = await AsyncStorage.getItem('clp_prenom');
    setUserInfo({ clp_nom, clp_prenom });
  };

  const calculateGlobalStats = () => {
    const totalClasseurs = classeurs.length;
    let totalFeuilles = 0;

    classeurs.forEach(classeur => {
      totalFeuilles += parseInt(classeur['Nombre feuille']) || 0;
    });

    return {
      totalClasseurs,
      totalFeuilles,
    };
  };

  const globalStats = calculateGlobalStats();

  const checkLocalData = async () => {
    const localData = await AsyncStorage.getItem('localData');
    return localData !== null;
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmation de déconnexion',
      'Vous allez perdre toutes les données enregistrées localement. Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: async () => {
            const hasLocalData = await checkLocalData();
            if (hasLocalData) {
              Alert.alert(
                'Données non envoyées',
                'Vous avez des données locales non envoyées. Veuillez les envoyer ou les supprimer avant de vous déconnecter.',
                [{ text: 'OK' }]
              );
              return;
            }
            try {
              await AsyncStorage.clear();
              navigation.replace('LoginPage');
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#009960" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Bonjour : {userInfo.clp_nom} {userInfo.clp_prenom}</Text>
        <MaterialIcons name="logout" size={24} color="black" style={styles.logoutIcon} onPress={handleLogout} />
      </View>

      <View style={styles.walletContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.contentTotals}>
            <Text style={styles.walletText}>Classeurs</Text>
            <Text style={styles.walletAmount}>Total: {globalStats.totalClasseurs}</Text>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.contentTotals}>
            <Text style={styles.walletText}>Feuilles</Text>
            <Text style={styles.walletAmount}>Total: {globalStats.totalFeuilles}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.classeurContainer}  onPress={() => navigation.navigate('HomePage')}>
        <Text style={styles.classeurTitle}>Liste des classeurs</Text>
        <View style={styles.classeurContent}>
          <Image source={require('../../assets/logo/classeur-image.png')} style={styles.classeurImage} />
          <TouchableOpacity style={styles.arrowButton} onPress={() => navigation.navigate('HomePage')}>
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <ScrollView>
        {classeurs.map((classeur, index) => (
          <TouchableOpacity key={index} style={styles.feuilleContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📄</Text>
            </View>
            <View style={styles.feuilleContent}>
              <Text style={styles.libelleFeuille}>{classeur['Libelle classeur']}</Text>
              <Text style={styles.dateInsertion}>Date: {classeur['Date']}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutIcon: {
    marginLeft: 10, 
  },
  walletContainer: {
    backgroundColor: '#009960',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentTotals: {
    flex: 1,
    alignItems: 'center',
  },
  walletText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 7,
  },
  walletAmount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
  },
  classeurContainer: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classeurTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  classeurContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classeurImage: {
    width: 100,
    height: 100,
  },
  arrowButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: '#009960',
    fontSize: 18,
    fontWeight: 'bold',
  },
  feuilleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#dddddd',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  feuilleContent: {
    flex: 1,
    paddingVertical: 16,
  },
  libelleFeuille: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateInsertion: {
    fontSize: 12,
    color: '#666666',
  },
});

export default Home;
