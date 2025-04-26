import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function UserScreen() {
    const [account, setAccount] = useState('');
    const [name, setName] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch('http://10.0.0.56:8000/api/v1/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 200) {
                const data = await res.json();
                const user = Array.isArray(data) ? data[0] : data;
                setAccount(user.account);
                setName(user.username);
            } else {
                Alert.alert('Failed to fetch user info');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            Alert.alert('Error', 'Failed to load user information.');
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert('Error', 'Please enter both current and new password.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch('http://10.0.0.56:8000/api/v1/users/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                }),
            });

            if (res.status === 200) {
                setShowChangePassword(false);
                setOldPassword('');
                setNewPassword('');

                Alert.alert('Success', 'Password updated successfully. Please log in again.');
                await AsyncStorage.removeItem('token');
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })
                );
            } else if (res.status === 400) {
                const data = await res.json();
                Alert.alert('Error', data.detail || 'Old password incorrect.');
            } else {
                Alert.alert('Error', 'Failed to update password.');
            }
        } catch (err) {
            console.error('Change password error:', err);
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('token');

            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    };

    return (
        <View style={{paddingTop: 50}}>
            <Text style={styles.title}>👤 User Info</Text>
            <Text style={styles.info}>Account: {account}</Text>
            <Text style={styles.info}>Name: {name}</Text>

            {showChangePassword && (
                <View style={styles.passwordContainer}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Old Password"
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <Button title="Submit" onPress={handleChangePassword} />
                    <View style={{ height: 10 }} />
                    <Button title="Cancel" color="gray" onPress={() => setShowChangePassword(false)} />
                </View>
            )}

            {!showChangePassword && (
                <View style={styles.buttonGroup}>
                    <Button title="Change Password" onPress={() => setShowChangePassword(true)} />
                    <View style={{ height: 15 }} />
                    <Button title="Log Out" color="red" onPress={handleLogout} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    info: {
        fontSize: 18,
        marginVertical: 8,
        textAlign: 'center'
    },
    buttonGroup: { marginTop: 30 },
    passwordContainer: { marginTop: 30 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
});
