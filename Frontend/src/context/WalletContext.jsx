import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState([
        { id: 'STAY10', code: 'STAY10', discount: 10, description: '10% off on your first booking' },
        { id: 'LUXE20', code: 'LUXE20', discount: 20, description: '20% off on suites' }
    ]);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (user?._id) {
                setLoading(true);
                try {
                    const { data: transData } = await api.get(`/transactions/my/${user._id}`);
                    setTransactions(transData);
                    // Balance is stored on the user object too, but we might want a dedicated field or sum
                    setBalance(user.walletBalance || 0);
                } catch (error) {
                    console.error('Error fetching wallet data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchWalletData();
    }, [user]);

    const addFunds = async (amount) => {
        if (!user?._id) return;
        try {
            const { data } = await api.post('/transactions/add-funds', { userId: user._id, amount });
            setBalance(data.balance);
            setTransactions(prev => [data.transaction, ...prev]);
            return true;
        } catch (error) {
            console.error('Error adding funds:', error);
            return false;
        }
    };

    const verifyAndAddFunds = async (paymentData, amount) => {
        if (!user?._id) return;
        try {
            const { data } = await api.post('/transactions/verify-and-add', {
                ...paymentData,
                userId: user._id,
                amount
            });
            setBalance(data.balance);
            setTransactions(prev => [data.transaction, ...prev]);
            return true;
        } catch (error) {
            console.error('Error verifying payment:', error);
            return false;
        }
    };

    const deductFunds = (amount, description) => {
        // This is handled on the backend during booking creation
        // We just toggle local state if needed or re-fetch
        return balance >= amount;
    };

    return (
        <WalletContext.Provider value={{ balance, transactions, coupons, addFunds, deductFunds, verifyAndAddFunds }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
