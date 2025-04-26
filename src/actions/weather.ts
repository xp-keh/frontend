"use server"

export async function getHourlyForecastData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_5_hours`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch weather data: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getDailyForecastData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/forecast_next_7_days`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch weather data: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getTemperatureData(station: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=temp&city=${station}`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch humidity data: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getHumidityData(station: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=hum&city=${station}`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch humidity data: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function getWindData(station: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/weather/fetch_weather?type=wind&city=${station}`,
    { method: "GET", cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch humidity data: ${res.status}`);
  }

  const data = await res.json();
  return data;
}
