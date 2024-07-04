import React, { useState } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerExample() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // Demande la permission d'accéder à la galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin de la permission d\'accès à la galerie pour que cela fonctionne!');
      return;
    }

    // Ouvre la galerie pour sélectionner une image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log('Image sélectionnée : ', result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Demande la permission d'utiliser la caméra
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin de la permission d\'utiliser la caméra pour que cela fonctionne!');
      return;
    }

    // Ouvre la caméra pour prendre une photo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log('Photo prise : ', result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Sélectionner une image de l'album" onPress={pickImage} />
      <Button title="Prendre une photo" onPress={takePhoto} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </View>
  );
}
