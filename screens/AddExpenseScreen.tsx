import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardWrapper from '../components/KeyboardWrapper';

export default function AddExpenseScreen() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [budgetId, setBudgetId] = useState<string>('');

    interface BudgetItem {
        id: number;
        year: number;
        month: number;
        amount: number;
        total_spent: number;
        remaining: number;
    }
    const [budgets, setBudgets] = useState<BudgetItem[]>([]);

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://10.0.0.56:8000/api/v1/budget/budget/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBudgets(data);
        if (data.length > 0) setBudgetId(data[0].id);
    };

    const handleAddExpense = async () => {
        const token = await AsyncStorage.getItem('token');
        const value = parseFloat(amount);
        if (!description || isNaN(value) || value <= 0 || !budgetId) {
            Alert.alert('Invalid input', 'Please fill all fields correctly.');
            return;
        }
        const res = await fetch('http://10.0.0.56:8000/api/v1/expense/expenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, amount: value, budget_id: budgetId })
        });
        if (res.ok) {
            Alert.alert('Success', 'Expense added successfully.');
            setDescription('');
            setAmount('');
        }
    };

    return (
        <KeyboardWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Add New Expense</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Amount"
                    value={amount}
                    keyboardType="numeric"
                    onChangeText={setAmount}
                />
                <Picker
                    selectedValue={budgetId}
                    onValueChange={(itemValue) => setBudgetId(itemValue)} // already string
                    style={styles.picker}
                >
                    {budgets.map(b => (
                        <Picker.Item
                            key={b.id}
                            label={`${b.year}-${b.month}`}
                            value={b.id.toString()} // 👈 ensure it's string
                        />
                    ))}
                </Picker>


                <View style={{paddingTop: 50}}>
                    <Button title="Add Expense" onPress={handleAddExpense} />
                </View>
            </View>
        </KeyboardWrapper>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', paddingTop:20 },
    input: { borderBottomWidth: 1, marginBottom: 20, padding: 8 },
    picker: {
        height: 144,
        marginBottom: 15,
    },
});
