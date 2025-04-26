'use server';

export const getHourlyForecastData = async (): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_5_hours`);
        if (!response.ok) {
            throw new Error('Failed to fetch hourly forecast data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hourly forecast data:', error);
        throw error;
    }
};

export const getDailyForecastData = async (): Promise<any> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_7_days`);
        if (!response.ok) {
            throw new Error('Failed to fetch daily forecast data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching daily forecast data:', error);
        throw error;
    }
};

export const getTemperatureData = async (station: string): Promise<any> => {
    try {
        const queryParams = new URLSearchParams({
            type: 'temp',
            city: station,
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch temperature data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching temperature data:', error);
        throw error;
    }
};

export const getHumidityData = async (station: string): Promise<any> => {
    try {
        const queryParams = new URLSearchParams({
            type: 'hum',
            city: station,
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch humidity data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching humidity data:', error);
        throw error;
    }
};

export const getWindData = async (station: string): Promise<any> => {
    try {
        const queryParams = new URLSearchParams({
            type: 'wind',
            city: station,
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch wind data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching wind data:', error);
        throw error;
    }
};
