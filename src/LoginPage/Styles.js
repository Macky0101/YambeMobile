import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   backgroundColor: '#405189',
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    circleContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: -1,
    },
    circle1: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#405189',
      position: 'absolute',
      top: 50,
      right: -50,
    },
    circle2: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#405189',
      position: 'absolute',
      bottom: 100,
      left: -50,
    },
    circle3: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#405189',
      position: 'absolute',
      bottom: 50,
      right: 50,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: '#000',
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      marginBottom: 25,
      paddingBottom: 5,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      color: '#000',
    },
    forgotText: {
      color: '#f78fb3',
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#405189',
      padding: 10,
      paddingHorizontal:40,
      borderRadius: 20,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    buttonTextModal:{
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 11,
    },
    loginTopLogo:{
        width: '100%',
        height: 105,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: 300,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    modalInput: {
      width: '100%',
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 15,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      marginHorizontal: 5,
    },
    linkButton: {
      backgroundColor: '#405189',
      padding: 10,
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 20,
      marginLeft:20
    },
    linkButtonText: {
      color: '#405189',
      fontWeight: 'bold',
    },
    buttonContainer:{
      flexDirection:'row',
      justifyContent: 'space-between',
    }
  });
  export default styles