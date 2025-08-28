import React, { useState } from "react";
import { fetchWeather } from "./api/weather";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Calendar } from "./components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
import { Badge } from "./components/ui/badge";
import {
  CalendarIcon,
  MapPin,
  Thermometer,
  Wind,
  CloudRain,
  AlertTriangle,
  Sun,
} from "lucide-react";
// Remove date-fns for now and use simple date formatting
import { WeatherForm } from "./components/WeatherForm";
import { WeatherResults } from "./components/WeatherResults";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  heatIndex: number;
  windChill: number;
  uvIndex: number;
}

export interface RiskAssessment {
  category:
    | "very hot"
    | "very cold"
    | "very windy"
    | "very wet"
    | "very uncomfortable"
    | "ok";
  description: string;
  recommendation: string;
  color: string;
  icon: React.ReactNode;
  severity: number;
}

export default function App() {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [activity, setActivity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thay YOUR_API_KEY_HERE bằng API key thực tế của bạn
  const API_KEY = "YOUR_API_KEY_HERE";

  const handleLocationSearch = async (searchLocation: string) => {
    // Mock geocoding - in real app, would use geocoding service
    const mockCoordinates = { lat: 40.7128, lon: -74.006 }; // NYC as example
    setCoordinates(mockCoordinates);
    setLocation(searchLocation);
  };

  const assessWeatherRisk = (
    data: WeatherData,
    activityType: string
  ): RiskAssessment => {
    const risks: RiskAssessment[] = [];

    // Very hot assessment
    if (data.heatIndex >= 40) {
      risks.push({
        category: "very hot",
        description: `Heat index of ${data.heatIndex}°C poses serious heat stress risk`,
        recommendation: `Avoid outdoor activities. If necessary, take frequent breaks in shade and stay hydrated.`,
        color: "bg-red-500",
        icon: <Thermometer className="w-5 h-5" />,
        severity: 5,
      });
    }

    // Very cold assessment
    if (data.temperature <= -10 || data.windChill <= -10) {
      risks.push({
        category: "very cold",
        description: `Temperature ${data.temperature}°C with wind chill ${data.windChill}°C`,
        recommendation: `Dress in layers, cover exposed skin, limit time outdoors.`,
        color: "bg-blue-500",
        icon: <Wind className="w-5 h-5" />,
        severity: 4,
      });
    }

    // Very windy assessment
    if (data.windSpeed >= 15) {
      risks.push({
        category: "very windy",
        description: `Wind speed of ${data.windSpeed} m/s creates hazardous conditions`,
        recommendation: `Avoid activities near trees or water. Secure loose items.`,
        color: "bg-gray-500",
        icon: <Wind className="w-5 h-5" />,
        severity: 3,
      });
    }

    // Very wet assessment
    if (data.precipitation >= 10) {
      risks.push({
        category: "very wet",
        description: `${data.precipitation}mm of precipitation expected`,
        recommendation: `Bring waterproof gear or consider rescheduling outdoor activities.`,
        color: "bg-blue-600",
        icon: <CloudRain className="w-5 h-5" />,
        severity: 3,
      });
    }

    // Very uncomfortable assessment
    if (
      risks.length === 0 &&
      (data.heatIndex >= 32 || (data.temperature >= 25 && data.humidity >= 80))
    ) {
      risks.push({
        category: "very uncomfortable",
        description: `High humidity (${data.humidity}%) and temperature create uncomfortable conditions`,
        recommendation: `Plan for extra water breaks and consider lighter activities.`,
        color: "bg-orange-500",
        icon: <AlertTriangle className="w-5 h-5" />,
        severity: 2,
      });
    }

    // Return highest severity risk or "ok" if no risks
    if (risks.length > 0) {
      return risks.sort((a, b) => b.severity - a.severity)[0];
    }

    return {
      category: "ok",
      description: "Weather conditions are favorable for outdoor activities",
      recommendation:
        "Enjoy your outdoor adventure! Remember to stay hydrated and check conditions periodically.",
      color: "bg-green-500",
      icon: <Sun className="w-5 h-5" />,
      severity: 0,
    };
  };

  const generateMockWeatherData = (): WeatherData => {
    // Mock weather data - in real app, would fetch from weather API
    const temp = Math.random() * 40 - 10; // -10 to 30°C
    const humidity = Math.random() * 80 + 20; // 20-100%
    const windSpeed = Math.random() * 20; // 0-20 m/s
    const precipitation = Math.random() * 20; // 0-20mm

    // Calculate heat index (simplified)
    const heatIndex = temp + (humidity / 100) * 5;

    // Calculate wind chill (simplified)
    const windChill = windSpeed > 5 ? temp - windSpeed * 2 : temp;

    return {
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      precipitation: Math.round(precipitation * 10) / 10,
      heatIndex: Math.round(heatIndex * 10) / 10,
      windChill: Math.round(windChill * 10) / 10,
      uvIndex: Math.round(Math.random() * 11),
    };
  };

  const handleAnalyze = async () => {
    if (!location || !selectedDate) return;
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const data = await fetchWeather(location, dateStr, API_KEY);
      // Chuyển đổi dữ liệu API về WeatherData
      const current = data.forecast?.forecastday?.[0]?.day || {};
      const weather: WeatherData = {
        temperature: current.avgtemp_c ?? 0,
        humidity: current.avghumidity ?? 0,
        windSpeed: current.maxwind_kph ? current.maxwind_kph / 3.6 : 0, // kph -> m/s
        precipitation: current.totalprecip_mm ?? 0,
        heatIndex: current.avgtemp_c ?? 0, // WeatherAPI không có heatIndex, dùng avgtemp_c
        windChill: current.avgtemp_c ?? 0, // WeatherAPI không có windChill, dùng avgtemp_c
        uvIndex: current.uv ?? 0,
      };
      setWeatherData(weather);
      const assessment = assessWeatherRisk(weather, activity);
      setRiskAssessment(assessment);
    } catch (err: any) {
      setError("Không lấy được dữ liệu thời tiết!");
      setWeatherData(null);
      setRiskAssessment(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Weather Risk Assessment
          </h1>
          <p className="text-gray-600">
            Check weather conditions for your outdoor activities and get
            personalized risk assessments
          </p>
        </div>

        {/* Input Form */}
        <WeatherForm
          location={location}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          activity={activity}
          onLocationChange={setLocation}
          onLocationSearch={handleLocationSearch}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          onActivityChange={setActivity}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="text-red-600 text-center font-semibold">{error}</div>
        )}
        {/* Results */}
        {weatherData && riskAssessment && (
          <WeatherResults
            weatherData={weatherData}
            riskAssessment={riskAssessment}
            location={location}
            date={selectedDate}
            time={selectedTime}
            activity={activity}
          />
        )}
      </div>
    </div>
  );
}
