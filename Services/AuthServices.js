import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

// const getBaseURL = async () => {
//   const customURL = await AsyncStorage.getItem('custom_baseURL');
//   return customURL || 'https://demo-swedd.org/api';
// };
const getBaseURL = async () => {
  try {
    const customURL = await AsyncStorage.getItem('custom_baseURL');
    return customURL; // Renvoie null ou une chaîne vide si aucune URL personnalisée n'est définie
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'URL personnalisée :', error);
    return null; // Gestion des erreurs en renvoyant null
  }
};


export const login = async (email, password) => {
    try {
        const baseURL = await getBaseURL(); 
        const response = await axios.post(`${baseURL}/api/login.php`, { login: email, pass: password });
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


export const ListClasseur = async (clp_structure, code_projet) => {
  try {
    const baseURL = await getBaseURL();
    const response = await fetch(`${baseURL}/api/classeur.php?Partenaire=${clp_structure}&Projet=${code_projet}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des classeurs. Statut: ' + response.status);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur de récupération des classeurs:', error);
    throw error; // Rejeter l'erreur pour la traiter plus haut
  }
};


export const getFeuille = async (classeurId, clp_structure) => {
  try {
    const baseURL = await getBaseURL();
    const response = await axios.get(`${baseURL}/api/feuille.php`, {
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
      const baseURL = await getBaseURL();
      const response = await axios.get(`${baseURL}/api/classeurfiche.php`, {
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

export const getListProjet = async () => {
  try {
    const baseURL = await getBaseURL();
    const response = await axios.get(`${baseURL}/api/projet.php`);
    return response.data.projet;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    throw error;
  }
};



export const sendDataToServer = async (savedData, location, clpNom, setProgress) => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    throw new Error('Aucune connexion Internet. Veuillez réessayer plus tard.');
  }

  if (!location) {
    throw new Error('Veuillez activer votre position avant d\'envoyer les données.');
  }

  const { coords: { latitude, longitude } } = location;
  const totalItems = savedData.length;

  for (let i = 0; i < totalItems; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { id, codeFeuille, ...item } = savedData[i];
      const tableName = await AsyncStorage.getItem(`Table_${codeFeuille}`);
      const dateData = await AsyncStorage.getItem(`dateData-${id}`);
      const date = dateData ? new Date(JSON.parse(dateData).date) : null;

      if (!tableName) {
        throw new Error(`Le nom de la table pour Code_Feuille ${codeFeuille} n'a pas pu être récupéré.`);
      }

      const formData = new FormData();
      formData.append('Table_Feuille', tableName);
      formData.append('Login', clpNom);
      formData.append('LG', longitude.toString());
      formData.append('LT', latitude.toString());

      const columnsToInclude = Object.keys(item).filter(key => key !== 'id' && key !== 'codeFeuille');
      columnsToInclude.forEach(col => {
        formData.append(`Colonne[]`, col);
        formData.append(`Values[]`, item[col]);
        formData.append(`Type[]`, typeof item[col]);
      });

      if (date) {
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        formData.append('Date_Insertion', formattedDate);
      }

      console.log('Données à envoyer :', formData);
      const baseURL = await getBaseURL();
      const response = await axios.post(`${baseURL}/api/InsertionFormulaire.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Réponse de l\'API :', response.data);

      if (response.status === 200 && !response.data.error) {
        const data = await AsyncStorage.getItem('savedFormData');
        const parsedData = data ? JSON.parse(data) : [];
        const updatedData = parsedData.filter(item => item.id !== savedData[i].id);
        await AsyncStorage.setItem('savedFormData', JSON.stringify(updatedData));

        setProgress(((i + 1) / totalItems) * 100);
      } else {
        throw new Error(response.data.error || 'Erreur lors de l\'envoi des données');
      }
    } catch (error) {
      throw new Error(error.message || 'Une erreur est survenue lors de l\'envoi des données. Veuillez réessayer plus tard.');
    }
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
