import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import KeyboardWrapper from '../components/KeyboardWrapper';

export default function LoginScreen({ setToken }: { setToken: (token: string) => void }) {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        try {
            const res = await fetch('http://10.0.0.56:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account, password }),
            });

            if (res.status === 200) {
                const data = await res.json();
                await AsyncStorage.setItem('token', data.access_token);
                setToken(data.token);

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
            } else {
                Alert.alert('Login Failed', 'Invalid account or password.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            Alert.alert('Error', 'Unable to connect to server.');
        }
    };

    return (

        <KeyboardWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Login</Text>
                <TextInput style={styles.input} placeholder="Account" value={account} onChangeText={setAccount} />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <Button title="Login" onPress={handleLogin} />
                <View style={{ marginTop: 20 }}>
                    <Button title="Don't have an account? Register" onPress={() => navigation.navigate('Register')} />
                </View>
            </View>
        </KeyboardWrapper>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
});
