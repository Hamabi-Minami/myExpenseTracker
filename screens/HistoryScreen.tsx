import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

interface Expense {
    id: number;
    description: string;
    amount: number;
    budget: {
        year: number;
        month: number;
    };
}

function ExpenseItem({ item, onDelete, onEdit }: { item: Expense; onDelete: (id: number) => void; onEdit: (item: Expense) => void }) {
    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <TouchableOpacity onLongPress={() => onEdit(item)}>
                <View style={styles.card}>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                    <Text style={styles.budgetText}>Budget: {item.budget.year}-{item.budget.month}</Text>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
}


export default function HistoryScreen() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [newDescription, setNewDescription] = useState('');
    const [newAmount, setNewAmount] = useState('');

    const fetchExpenses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch('http://10.0.0.56:8000/api/v1/expense/expenses/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            } else {
                Alert.alert('Failed to load expenses');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch expenses');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`http://10.0.0.56:8000/api/v1/expense/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                setExpenses(prev => prev.filter(item => item.id !== id));
            } else {
                Alert.alert('Failed to delete');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete expense');
        }
    };

    const handleEdit = (item: Expense) => {
        setSelectedExpense(item);
        setNewDescription(item.description);
        setNewAmount(item.amount.toString());
        setModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedExpense) return;
        try {
            const token = await AsyncStorage.getItem('token');
            const res = await fetch(`http://10.0.0.56:8000/api/v1/expense/expenses/${selectedExpense.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    description: newDescription,
                    amount: parseFloat(newAmount),
                }),
            });

            if (res.ok) {
                setModalVisible(false);
                fetchExpenses();
            } else {
                Alert.alert('Failed to update expense');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update expense');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExpenses();
        }, [])
    );

    return (
        <View style={{ flex: 1, paddingTop: 50 }}>
            <Text style={styles.title}>Expense History</Text>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <ExpenseItem item={item} onDelete={handleDelete} onEdit={handleEdit} />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Expense</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Description"
                            value={newDescription}
                            onChangeText={setNewDescription}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={newAmount}
                            onChangeText={setNewAmount}
                            keyboardType="numeric"
                        />
                        <Button title="Save Changes" onPress={handleSaveEdit} />
                        <View style={{ height: 10 }} />
                        <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    description: { fontSize: 16, color: '#333' },
    amount: { fontSize: 18, fontWeight: '600', marginTop: 6, color: '#4caf50' },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 12,
        marginVertical: 6,
    },
    deleteText: { color: '#fff', fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    budgetText: {
        marginTop: 4,
        fontSize: 14,
        color: '#555',
    },
});
