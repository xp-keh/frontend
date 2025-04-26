// "use server"

// export async function getHourlyForecastData() {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_5_hours`, {
//     method: "GET",
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch weather data: ${res.status}`);
//   }

//   const data = await res.json();
//   return data;
// }

// export async function getDailyForecastData() {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_7_days`, {
//     method: "GET",
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch weather data: ${res.status}`);
//   }

//   const data = await res.json();
//   return data;
// }

// export async function getTemperatureData(station: any) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=temp&city=${station}`,
//     { method: "GET", cache: "no-store" }
//   );

//   if (!res.ok) {
//     throw new Error(`Failed to fetch humidity data: ${res.status}`);
//   }

//   const data = await res.json();
//   return data;
// }

// export async function getHumidityData(station: any) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=hum&city=${station}`,
//     { method: "GET", cache: "no-store" }
//   );

//   if (!res.ok) {
//     throw new Error(`Failed to fetch humidity data: ${res.status}`);
//   }

//   const data = await res.json();
//   return data;
// }

// export async function getWindData(station: any) {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=wind&city=${station}`,
//     { method: "GET", cache: "no-store" }
//   );

//   if (!res.ok) {
//     throw new Error(`Failed to fetch humidity data: ${res.status}`);
//   }

//   const data = await res.json();
//   return data;
// }


'use server'; // Optional if you want to keep it as server function

// Fetch hourly forecast data
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

// Fetch daily forecast data
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

// Fetch temperature data for a station
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

// Fetch humidity data for a station
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

// Fetch wind data for a station
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
