import React, {useState, useEffect, useCallback} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardWrapper from '../components/KeyboardWrapper';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';

export default function BudgetScreen() {
    const [amount, setAmount] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    interface BudgetItem {
        id: number;
        year: number;
        month: number;
        amount: number;
        total_spent: number;
        remaining: number;
    }

    const [budgets, setBudgets] = useState<BudgetItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            fetchBudgets();
        }, [])
    );

    const fetchBudgets = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://10.0.0.56:8000/api/v1/budget/budget/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBudgets(data);
    };

    const handleCreateBudget = async () => {
        const token = await AsyncStorage.getItem('token');
        const value = parseInt(amount);
        if (isNaN(value) || value <= 0) {
            Alert.alert('Invalid input', 'Please enter a valid number.');
            return;
        }
        const res = await fetch('http://10.0.0.56:8000/api/v1/budget/budget/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: value, year, month })
        });
        if (res.ok) {
            Alert.alert('Success', 'Budget created successfully.');
            fetchBudgets();
            setAmount('');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create New Budget</Text>

            <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                keyboardType="numeric"
                onChangeText={setAmount}
            />

            <Text style={styles.label}>Select Year:</Text>
            <Picker
                selectedValue={year.toString()}
                onValueChange={(itemValue) => setYear(Number(itemValue))}
                style={styles.picker}
            >
                {Array.from({ length: 5 }, (_, i) => 2025 + i).map(y => (
                    <Picker.Item key={y} label={`${y}`} value={`${y}`} />
                ))}
            </Picker>

            <Text style={styles.label}>Select Month:</Text>
            <Picker
                selectedValue={month.toString()}
                onValueChange={(itemValue) => setMonth(Number(itemValue))}
                style={styles.picker}
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <Picker.Item key={m} label={`${m}`} value={`${m}`} />
                ))}
            </Picker>

            <View style={{ paddingTop: 50 }}>
                <Button title="Create Budget" onPress={handleCreateBudget} />
            </View>

            <Text style={styles.subtitle}>Your Budgets:</Text>
            {budgets.map(b => (
                <View key={b.id} style={styles.budgetItem}>
                    <Text>{b.year}-{b.month}: ${b.amount}</Text>
                    <Text>
                        Spent: ${b.total_spent} |{' '}
                        {b.remaining >= 0 ? (
                            <Text>Remaining: ${b.remaining}</Text>
                        ) : (
                            <Text style={{ color: 'red' }}>Over Budget: ${Math.abs(b.remaining)}</Text>
                        )}
                    </Text>
                </View>
            ))}
        </ScrollView>
    );

}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        paddingTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '500',
    },
    picker: {
        height: 144,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
    },
    budgetItem: {
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        marginBottom: 10,
    },
});
