import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import KeyboardWrapper from '../components/KeyboardWrapper';

// define navigation param types
type RootStackParamList = {
    Login: undefined;
    Register: undefined;
};

// type RegisterScreenProps = {
//     navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
//     route: RouteProp<RootStackParamList, 'Register'>;
// };

export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [account, setAccount] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            const res = await fetch('http://10.0.0.56:8000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, account, email, password }),
            });

            if (res.status === 201) {
                Alert.alert('Success', 'Registration successful. Please log in.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Registration failed', 'Please check your input.');
            }
        } catch (err) {
            Alert.alert('Error', 'Unable to connect to server.');
        }
    };

    return (
        <KeyboardWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Register</Text>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="Account" value={account} onChangeText={setAccount} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <Button title="Register" onPress={handleRegister} />
                <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account? Login</Text>
            </View>
        </KeyboardWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 5 },
    link: { color: 'blue', marginTop: 20, textAlign: 'center' },
});
