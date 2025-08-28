import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  Sun, 
  Eye,
  MapPin,
  Calendar,
  Clock,
  Activity
} from 'lucide-react';
// Use simple date formatting instead of date-fns
import { WeatherData, RiskAssessment } from '../App';

interface WeatherResultsProps {
  weatherData: WeatherData;
  riskAssessment: RiskAssessment;
  location: string;
  date: Date | undefined;
  time: string;
  activity: string;
}

export function WeatherResults({
  weatherData,
  riskAssessment,
  location,
  date,
  time,
  activity
}: WeatherResultsProps) {
  const getRiskColor = (category: string) => {
    switch (category) {
      case 'very hot': return 'bg-red-500 text-white';
      case 'very cold': return 'bg-blue-500 text-white';
      case 'very windy': return 'bg-gray-500 text-white';
      case 'very wet': return 'bg-blue-600 text-white';
      case 'very uncomfortable': return 'bg-orange-500 text-white';
      case 'ok': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'hiking': return '🥾 Hiking';
      case 'camping': return '🏕️ Camping';
      case 'fishing': return '🎣 Fishing';
      case 'cycling': return '🚴 Cycling';
      case 'running': return '🏃 Running';
      case 'photography': return '📸 Photography';
      case 'picnic': return '🧺 Picnic';
      case 'general': return '🌟 General Outdoor';
      default: return '🌟 Outdoor Activity';
    }
  };

  const getUVRiskLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'bg-green-500' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'bg-yellow-500' };
    if (uvIndex <= 7) return { level: 'High', color: 'bg-orange-500' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'bg-red-500' };
    return { level: 'Extreme', color: 'bg-purple-500' };
  };

  const uvRisk = getUVRiskLevel(weatherData.uvIndex);

  return (
    <div className="space-y-6">
      {/* Risk Assessment Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {riskAssessment.icon}
              Weather Risk Assessment
            </CardTitle>
            <Badge className={`${getRiskColor(riskAssessment.category)} px-3 py-1`}>
              {riskAssessment.category.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {date ? date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : "Date not set"}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {time}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {activity ? getActivityLabel(activity) : 'No activity selected'}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <p className="text-lg">{riskAssessment.description}</p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-blue-800">
                  <strong>Recommendation:</strong> {riskAssessment.recommendation}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Weather Data */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Weather Conditions</CardTitle>
          <CardDescription>
            Current conditions and calculated indices for your assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Temperature */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span>Temperature</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">{weatherData.temperature}°C</div>
                <div className="text-sm text-gray-600">
                  Heat Index: {weatherData.heatIndex}°C
                </div>
                <div className="text-sm text-gray-600">
                  Wind Chill: {weatherData.windChill}°C
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span>Humidity</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">{weatherData.humidity}%</div>
                <Progress value={weatherData.humidity} className="h-2" />
              </div>
            </div>

            {/* Wind */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-gray-500" />
                <span>Wind Speed</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">{weatherData.windSpeed} m/s</div>
                <div className="text-sm text-gray-600">
                  {(weatherData.windSpeed * 3.6).toFixed(1)} km/h
                </div>
              </div>
            </div>

            {/* Precipitation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-600" />
                <span>Precipitation</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">{weatherData.precipitation} mm</div>
                <div className="text-sm text-gray-600">
                  Expected in 6 hours
                </div>
              </div>
            </div>

            {/* UV Index */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span>UV Index</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{weatherData.uvIndex}</span>
                  <Badge className={`${uvRisk.color} text-white`}>
                    {uvRisk.level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <span>Comfort Level</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl">
                  {riskAssessment.severity === 0 ? 'High' : 
                   riskAssessment.severity <= 2 ? 'Medium' : 'Low'}
                </div>
                <Progress 
                  value={Math.max(0, 100 - (riskAssessment.severity * 20))} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4>General Outdoor Safety</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check weather updates regularly</li>
                <li>• Inform someone of your plans</li>
                <li>• Bring extra water and snacks</li>
                <li>• Wear appropriate clothing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4>Activity-Specific Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {activity === 'hiking' && (
                  <>
                    <li>• Wear sturdy hiking boots</li>
                    <li>• Bring a first aid kit</li>
                    <li>• Stay on marked trails</li>
                  </>
                )}
                {activity === 'camping' && (
                  <>
                    <li>• Check fire restrictions</li>
                    <li>• Secure your campsite</li>
                    <li>• Store food properly</li>
                  </>
                )}
                {activity === 'fishing' && (
                  <>
                    <li>• Check fishing regulations</li>
                    <li>• Wear a life jacket near water</li>
                    <li>• Monitor water conditions</li>
                  </>
                )}
                {!activity && (
                  <>
                    <li>• Plan for changing conditions</li>
                    <li>• Bring backup shelter</li>
                    <li>• Monitor local alerts</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}