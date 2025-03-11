'use server'; // Optional if you want to use as server action (App Router context)

export interface City {
    city: string;
    latitude: number;
    longitude: number;
}

export interface ApiResponse {
    cities: City[];
}

// Fetch cities list
export const getCities = async (): Promise<City[]> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/retrieve/cities`);
        if (!response.ok) {
            throw new Error('Failed to fetch cities');
        }
        const data: ApiResponse = await response.json();
        return data.cities;
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};

// Fetch preview data
export const getPreviewData = async (
    startTime: string,
    endTime: string,
    latitude: number,
    longitude: number
): Promise<any> => {
    try {
        const queryParams = new URLSearchParams({
            start_time: startTime,
            end_time: endTime,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/retrieve/preview?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to retrieve data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error retrieving data:', error);
        throw error;
    }
};

// Download data
export const downloadData = async (
    startTime: string,
    endTime: string,
    latitude: number,
    longitude: number
): Promise<Blob> => {
    try {
        const queryParams = new URLSearchParams({
            start_time: startTime,
            end_time: endTime,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        }).toString();

        const url = `${process.env.NEXT_PUBLIC_API_URL}/retrieve/download?${queryParams}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to download data');
        }
        return await response.blob(); // Get file blob
    } catch (error) {
        console.error('Error downloading data:', error);
        throw error;
    }
};
