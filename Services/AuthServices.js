import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = 'https://demo-swedd.org/api';

const axiosInstance = axios.create({
    baseURL,
});

export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post('/login.php', { login: email, pass: password });
        console.log('response', response.data);

        // Vérifier si la réponse contient les informations utilisateur
        if (response.data && response.data.Resultat && response.data.Resultat.length > 0) {
            const user = response.data.Resultat[0];
            const { clp_nom, clp_prenom, clp_mail } = user;

            await AsyncStorage.setItem('clp_nom', clp_nom);
            await AsyncStorage.setItem('clp_prenom', clp_prenom);
            await AsyncStorage.setItem('clp_mail', clp_mail);
            console.log('clp_nom:', clp_nom);
            // console.log('clp_prenom:', clp_prenom);
            // console.log('clp_mail:', clp_mail);
        }

        return response.data;
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
};


export const ListClasseur = async (clp_structure) => {
    try {
        const response = await axiosInstance.get(`/classeur.php?Partenaire=${clp_structure}`);
        console.log('response', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des classeurs:', error);
        throw error;
    }
};




export const getFeuille = async (classeurId, clp_structure) => {
  try {
    const response = await axios.get('https://demo-swedd.org/api/feuille.php', {
      params: {
        Classeur: classeurId,
        Partenaire: clp_structure,
      },
    });

    const infoFeuille = response.data;
    console.log('info', infoFeuille);

    if (infoFeuille && infoFeuille.classeur && infoFeuille.classeur.length > 0) {
      for (const feuille of infoFeuille.classeur) {
        const table = feuille.Table;
        const codeFeuille = feuille['Code_Feuille'];

        // Store the table with codeFeuille as the key
        await AsyncStorage.setItem(`Table_${codeFeuille}`, table);
        console.log(`Table for codeFeuille ${codeFeuille}:`, table);
      }
      return response.data;
    } else {
      console.error('No classeur information found in the response.');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille:', error);
    throw error;
  }
};




export const getFormulaire = async (codeFeuille) => {
  try {
      const response = await axios.get(`${baseURL}/classeurfiche.php`, {
          params: {
              code_feuille: codeFeuille,
          },
      });
      return response.data;
  } catch (error) {
      console.error('Erreur lors de la récupération du formulaire:', error);
      throw error;
  }
};

























// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const baseURL = 'https://demo-swedd.org/api';

// const axiosInstance = axios.create({
//     baseURL,
// });

// export const login = async (email, password) => {
//     try {
//         const response = await axiosInstance.post('/login.php', { login: email, pass: password });
//         console.log('response', response.data);

//         if (response.data && response.data.Resultat && response.data.Resultat.length > 0) {
//             const user = response.data.Resultat[0];
//             const { clp_nom, clp_prenom, clp_mail, clp_structure } = user;

//             await AsyncStorage.setItem('clp_nom', clp_nom);
//             await AsyncStorage.setItem('clp_prenom', clp_prenom);
//             await AsyncStorage.setItem('clp_mail', clp_mail);
//             await AsyncStorage.setItem('clp_structure', clp_structure);
//             console.log('clp_nom:', clp_nom);
//         }

//         return response.data;
//     } catch (error) {
//         console.error('Erreur lors de la connexion:', error);
//         throw error;
//     }
// };

// export const ListClasseur = async (clp_structure) => {
//     try {
//         const response = await axiosInstance.get(`/classeur.php?Partenaire=${clp_structure}`);
//         console.log('response', response.data);
        
//         // Store data in AsyncStorage
//         await AsyncStorage.setItem('classeurs', JSON.stringify(response.data.classeur));

//         return response.data;
//     } catch (error) {
//         console.error('Erreur lors de la récupération des classeurs:', error);
//         throw error;
//     }
// };

// export const getFeuille = async (classeurId, clp_structure) => {
//     try {
//         const response = await axios.get('https://demo-swedd.org/api/feuille.php', {
//             params: {
//                 Classeur: classeurId,
//                 Partenaire: clp_structure,
//             },
//         });

//         const infoFeuille = response.data;
//         console.log('info', infoFeuille);

//         if (infoFeuille && infoFeuille.classeur && infoFeuille.classeur.length > 0) {
//             for (const feuille of infoFeuille.classeur) {
//                 const table = feuille.Table;
//                 const codeFeuille = feuille['Code_Feuille'];

//                 // Store the table with codeFeuille as the key
//                 await AsyncStorage.setItem(`Table_${codeFeuille}`, table);
//                 console.log(`Table for codeFeuille ${codeFeuille}:`, table);
//             }
//             return response.data;
//         } else {
//             console.error('No classeur information found in the response.');
//             return null;
//         }
//     } catch (error) {
//         console.error('Erreur lors de la récupération de la feuille:', error);
//         throw error;
//     }
// };

// export const getFormulaire = async (codeFeuille) => {
//     try {
//         const response = await axios.get(`${baseURL}/classeurfiche.php`, {
//             params: {
//                 code_feuille: codeFeuille,
//             },
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Erreur lors de la récupération du formulaire:', error);
//         throw error;
//     }
// };
