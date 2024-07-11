import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getListProjet } from '../../Services/AuthServices';

const ProjectSelectionPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await getListProjet();
      setProjects(projectsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    await AsyncStorage.setItem('selectedProject', JSON.stringify(project));
    console.log('selectedProject', JSON.stringify(project));
    navigation.replace('home');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009960" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.title}>Sélectionnez un projet</Text> */}
      {projects.map((project) => (
        <TouchableOpacity key={project.code_projet} style={styles.projectCard} onPress={() => selectProject(project)}>
          <Text style={styles.projectSigle}>{project.sigle_projet}</Text>
          <Text style={styles.projectTitle}>{project.intitule_projet}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  projectCard: {
    padding: 20,
    backgroundColor: '#B2CBD4',
    // backgroundColor: '#009960',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  projectTitle: {
    fontSize: 14,
    color: '#000',
  },
  projectSigle: {
    fontSize: 18,
    color: '#000',
  },
});

export default ProjectSelectionPage;
