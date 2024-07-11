import { StyleSheet } from 'react-native';

import { Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  greetingContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutIcon: {
    marginRight: 10,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  projectCard: {
    backgroundColor: '#9BBEC8',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  projectSigle: {
    fontSize: 18,
    fontWeight:'bold',
    color: '#000',
  },
  projectDate: {
    fontSize: 14,
    color: '#000',
  },
  walletContainer: {
    padding: 20,
    backgroundColor: '#B2CBD4',
    borderRadius: 8,
    marginBottom: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentTotals: {
    alignItems: 'center',
  },
  walletText: {
    fontSize: 16,
    color: '#000',
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    width: 1,
    backgroundColor: '#fff',
    height: 40,
    marginHorizontal: 20,
  },
  classeurContainer: {
    width: (width / 2) - 30, // Ajuster la largeur en fonction de l'écran avec un peu d'espace
    padding: 20,
    backgroundColor: '#B2CBD4',
    borderRadius: 5,
    marginBottom: 20,
  },
  classeurTitle: {
    fontSize: 18, // Augmenter légèrement la taille de la police
    fontWeight: '500', // Modifier le poids de la police si nécessaire
    color: '#000',
    marginBottom: 10,
  },
  classeurContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ajouter cet attribut pour l'espacement
  },
  classeurImage: {
    width: 50,
    height: 50,
  },
  arrowButton: {
    marginLeft: 'auto',
  },
  arrowText: {
    fontSize: 24,
    color: '#fff',
  },
  feuilleContainer: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  feuilleContent: {
    marginLeft: 10,
  },
  feuilleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  feuilleDescription: {
    fontSize: 14,
    color: '#666',
  },
  feuilleCount: {
    fontSize: 14,
    color: '#009960',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default styles;
