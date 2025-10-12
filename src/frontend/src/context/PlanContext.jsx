import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext.jsx';

export const PlanContext = createContext();

export const PlanProvider = ({ children }) => {
	const { user } = useContext(AuthContext);
	const [plan, setPlan] = useState(null);
	useEffect(() => {
		const fetchPlan = async () => {
			if (user?.teamId) {
				const res = await api.get(`/team/${user.teamId}/plan`);
				setPlan(res.data);
			}
		};
		fetchPlan();
	}, [user]);
	return (
		<PlanContext.Provider value={{ plan }}>
			{children}
		</PlanContext.Provider>
	);
};
