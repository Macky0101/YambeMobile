import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  walletContainer: {
    backgroundColor: '#009960',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 7,
  },
  walletAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: '100%', // Match the height of the container
    backgroundColor: '#FFF', // White color for the separator
    marginHorizontal: 20, // Space around the separator
  },
});

export default styles;
