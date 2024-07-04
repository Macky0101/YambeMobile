import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  classeurContainer: {
    width: '48%', // Ajuster la largeur des éléments pour deux colonnes
    aspectRatio: 1,
    marginBottom: 10,
  },
  largeScreenClasseurContainer: {
    width: '32%', // Ajuster la largeur des éléments pour trois colonnes
    aspectRatio: 1,
    marginBottom: 10,
  },
  classeur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 5,
  },
  folderIcon: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderTop: {
    position: 'absolute',
    top: -10,
    right: '15%',
    width: '80%',
    height: 20,
    backgroundColor: '#ffeb3b',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 3,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  folderBody: {
    width: '90%',
    height: '90%',
    backgroundColor: '#dddddd',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderContent: {
    width: '80%',
    height: '70%',
    position: 'absolute',
    top: '10%',
    left: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classeurTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  statistic: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dddddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchbar: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
  },
});

export default styles;
