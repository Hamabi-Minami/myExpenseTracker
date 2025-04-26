import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserScreen from './UserScreen';
import AddExpenseScreen from './AddExpenseScreen';
import HistoryScreen from './HistoryScreen';
import BudgetScreen from './BudgetScreen';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Add" component={AddExpenseScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Budget" component={BudgetScreen} />
            <Tab.Screen name="Account" component={UserScreen} />
        </Tab.Navigator>
    );
}
