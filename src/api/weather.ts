export async function fetchWeather(location: string, date: string, apiKey: string) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&dt=${date}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  return response.json();
}