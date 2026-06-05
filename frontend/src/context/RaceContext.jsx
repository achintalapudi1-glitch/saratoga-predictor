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
  const [error,          setError]          = useState(null);

  // Load race list + weather on mount
  useEffect(() => {
    Promise.all([fetchRaces(), fetchWeather()])
      .then(([racesData, weatherData]) => {
        setRaces(racesData.races || []);
        setWeather(weatherData);
        // If weather suggests off-track, default condition accordingly
        if (weatherData?.trackCondition) setTrackCondition(weatherData.trackCondition);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Load a specific race
  const loadRace = useCallback((raceNumber, condition) => {
    const cond = condition || trackCondition;
    setLoading(true);
    setError(null);
    fetchRace(raceNumber, cond)
      .then((data) => {
        setRaceData(data);
        setSelectedRace(raceNumber);
      })
      .catch((err) => setError(err.message))
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
      loading, error, loadRace, setTrackCondition, refreshWeather,
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
