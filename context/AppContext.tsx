import React, { createContext, useState, ReactNode } from 'react';

interface Expense {
    id: number;
    amount: number;
    description: string;
}

interface AppContextType {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
    budget: number;
    setBudget: React.Dispatch<React.SetStateAction<number>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budget, setBudget] = useState<number>(1000);

    return (
        <AppContext.Provider value={{ expenses, setExpenses, budget, setBudget }}>
            {children}
        </AppContext.Provider>
    );
};
