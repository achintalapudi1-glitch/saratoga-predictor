import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchRaces, fetchRace, fetchWeather } from '../utils/api';

const RaceContext = createContext(null);

export function RaceProvider({ children }) {
  const [races,          setRaces]          = useState([]);
  const [selectedRace,   setSelectedRace]   = useState(null);
  const [raceData,       setRaceData]       = useState(null);
  const [weather,        setWeather]        = useState(null);
  const [trackCondition, setTrackCondition] = useState('fast');
  const [loading,        setLoading]        = useState(false);
  const [wakingUp,       setWakingUp]       = useState(false);
  const [error,          setError]          = useState(null);

  // Load race list + weather on mount
  useEffect(() => {
    // Show "waking up" banner if API takes > 4 seconds (Render free tier cold start)
    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);

    Promise.all([fetchRaces(), fetchWeather()])
      .then(([racesData, weatherData]) => {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setRaces(racesData.races || []);
        setWeather(weatherData);
        if (weatherData?.trackCondition) setTrackCondition(weatherData.trackCondition);
      })
      .catch(() => {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setError('Unable to reach server. Please refresh the page and try again.');
      });

    return () => clearTimeout(wakeTimer);
  }, []);

  // Load a specific race
  const loadRace = useCallback((raceNumber, condition) => {
    const cond = condition || trackCondition;
    setLoading(true);
    setError(null);

    const wakeTimer = setTimeout(() => setWakingUp(true), 4000);

    fetchRace(raceNumber, cond)
      .then((data) => {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setRaceData(data);
        setSelectedRace(raceNumber);
      })
      .catch(() => {
        clearTimeout(wakeTimer);
        setWakingUp(false);
        setError('Failed to load race. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [trackCondition]);

  const refreshWeather = useCallback(() => {
    fetchWeather()
      .then(setWeather)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <RaceContext.Provider value={{
      races, selectedRace, raceData, weather, trackCondition,
      loading, wakingUp, error, loadRace, setTrackCondition, refreshWeather,
    }}>
      {children}
    </RaceContext.Provider>
  );
}

export const useRace = () => {
  const ctx = useContext(RaceContext);
  if (!ctx) throw new Error('useRace must be used inside RaceProvider');
  return ctx;
};
