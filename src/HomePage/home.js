import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListClasseur } from '../../Services/AuthServices';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import ProjectModal from './ProjectModal';
import axios from 'axios';
import styles from './stylehome';

const Home = () => {
  const [classeurs, setClasseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ clp_nom: '', clp_prenom: '' });
  const [projectInfo, setProjectInfo] = useState({});
  const [feuilles, setFeuilles] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
    getUserInfo();
    getProjectInfo();
    // fetchFeuilles();
  }, []);

  const fetchData = async () => {
    try {
      const clp_structure = await AsyncStorage.getItem('clp_structure');
      const project = await AsyncStorage.getItem('selectedProject');
  
      if (!clp_structure || !project) {
        throw new Error('clp_structure ou projet non trouvé dans AsyncStorage');
      }
  
      const projectData = JSON.parse(project);
      const data = await ListClasseur(clp_structure, projectData.code_projet);
      console.log('code projet', projectData.code_projet);
  
      if (data && data.classeur) {
        // console.log('Données des classeurs reçues:', data.classeur);
        setClasseurs(data.classeur);
        await AsyncStorage.setItem('classeurs', JSON.stringify(data.classeur));
      } else {
        console.log('Pas de classeurs dans les données reçues.');
      }
  
      // Stocker le code projet dans un état
      setProjectInfo(projectData);
    } catch (error) {
      console.error('Erreur lors de la récupération des classeurs:', error);
    } finally {
      setLoading(false);
    }
  };

 
  // const fetchFeuilles = async () => {
  //   try {
  //     const response = await axios.get('https://demo-swedd.org/api/all_feuille.php?Partenaire=8&Projet=2000001616');
  //     const { feuille } = response.data;
  //     const feuilleWithLocalData = [];
  
  //     for (let i = 0; i < feuille.length; i++) {
  //       const item = feuille[i];
  //       const localDataKey = `feuille_${item.Code_Feuille}`;
  //       const localData = await AsyncStorage.getItem(localDataKey);
  
  //       console.log(`Local data for ${localDataKey}:`, localData);
  
  //       if (localData !== null && localData !== '') {
  //         try {
  //           const parsedLocalData = JSON.parse(localData);
  //           if (Array.isArray(parsedLocalData) && parsedLocalData.length > 0) {
  //             feuilleWithLocalData.push(item);
  //           }
  //         } catch (parseError) {
  //           console.error(`Erreur de parsing des données locales pour feuille ${item.Code_Feuille}:`, parseError);
  //         }
  //       }
  //     }
  
  //     console.log('Feuilles avec données locales :', feuilleWithLocalData);
  //     setFeuilles(feuilleWithLocalData);
  //   } catch (error) {
  //     console.error('Erreur lors de la récupération des feuilles de classeur:', error);
  //   }
  // };
  
  
  
  
  
  
  
  

  const getUserInfo = async () => {
    const clp_nom = await AsyncStorage.getItem('clp_nom');
    const clp_prenom = await AsyncStorage.getItem('clp_prenom');
    setUserInfo({ clp_nom, clp_prenom });
  };

  const getProjectInfo = async () => {
    const project = await AsyncStorage.getItem('selectedProject');
    if (project) {
      setProjectInfo(JSON.parse(project));
    }
  };
  const handleProjectSelect = async (project) => {
    await AsyncStorage.setItem('selectedProject', JSON.stringify(project));
    setProjectInfo(project);
    setModalVisible(false);
    fetchData();
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
        <Text style={styles.greeting}>
          {userInfo.clp_nom} {userInfo.clp_prenom}
        </Text>
        <MaterialIcons name="logout" size={24} color="black" style={styles.logoutIcon} onPress={handleLogout} />
      </View>
      <View style={styles.projectCard}>
        <Text style={styles.projectSigle}>{projectInfo.sigle_projet}</Text>
        <Text style={styles.projectName}>{projectInfo.intitule_projet}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5 }}>
          <Text style={styles.projectDate}>Début: {projectInfo.date_debut}</Text>
          <Text style={styles.projectDate}>Fin: {projectInfo.date_fin}</Text>
        </View>
      </View>
      {/* <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Changer de projet</Text>
      </TouchableOpacity> */}
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.classeurContainer} onPress={() => setModalVisible(true)}>
          <Text style={styles.classeurTitle}>Changer de projet</Text>
          <View style={styles.classeurContent}>
            <TouchableOpacity style={styles.arrowButton}>
              <MaterialIcons name="work" size={32} color="black" style={styles.logoutIcon} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.classeurContainer} onPress={() => navigation.navigate('HomePage', { code_projet: projectInfo.code_projet })}>
          <Text style={styles.classeurTitle}>Classeurs</Text>
          <View style={styles.classeurContent}>
            <TouchableOpacity style={styles.arrowButton}>
              <MaterialIcons name="folder" size={32} color="black" style={styles.logoutIcon} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* <ScrollView>
        {feuilles.map((feuille, index) => (
          <View key={index} style={styles.feuilleContainer}>
            <Text style={styles.feuilleTitle}>{feuille.Nom_Feuille}</Text>
            <Text style={styles.feuilleDescription}>{feuille.Libelle_Feuille}</Text>
          </View>
        ))}
      </ScrollView> */}
      <ProjectModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleProjectSelect}
      />
    </View>
  );
};

export default Home;
