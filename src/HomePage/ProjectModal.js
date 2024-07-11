import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import { getListProjet } from '../../Services/AuthServices';
import styles from './styleProjectModal';

const ProjectModal = ({ isVisible, onClose, onSelect }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projects = await getListProjet();
      setProjects(projects);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.sigle}>{item.sigle_projet}</Text>
      <Text style={styles.projectName}>{item.intitule_projet}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Sélectionnez un projet</Text>
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item.code_projet.toString()}
        />
      </View>
    </Modal>
  );
};

export default ProjectModal;
