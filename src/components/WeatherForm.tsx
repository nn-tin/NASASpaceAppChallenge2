import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, MapPin, Search, Loader2 } from "lucide-react";
// Use simple date formatting instead of date-fns

interface WeatherFormProps {
  location: string;
  selectedDate: Date | undefined;
  selectedTime: string;
  activity: string;
  onLocationChange: (location: string) => void;
  onLocationSearch: (location: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onActivityChange: (activity: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export function WeatherForm({
  location,
  selectedDate,
  selectedTime,
  activity,
  onLocationChange,
  onLocationSearch,
  onDateChange,
  onTimeChange,
  onActivityChange,
  onAnalyze,
  isLoading,
}: WeatherFormProps) {
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSearch(location.trim());
    }
  };

  const isFormValid = location && selectedDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Plan Your Outdoor Activity
        </CardTitle>
        <CardDescription>
          Enter your location, date, and activity type to get a weather risk
          assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <form onSubmit={handleLocationSubmit} className="flex gap-2">
            <Input
              id="location"
              placeholder="Enter city, address, or coordinates"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="date"
                value={
                  selectedDate ? selectedDate.toISOString().split("T")[0] : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const d = new Date(val);
                    if (!isNaN(d.getTime())) onDateChange(d);
                  }
                }}
                className="w-40"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateChange}
                    // Cho phép chọn cả ngày trong quá khứ
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select value={selectedTime} onValueChange={onTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, "0");
                  return (
                    <SelectItem key={hour} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Selection */}
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={activity} onValueChange={onActivityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hiking">🥾 Hiking</SelectItem>
                <SelectItem value="camping">🏕️ Camping</SelectItem>
                <SelectItem value="fishing">🎣 Fishing</SelectItem>
                <SelectItem value="cycling">🚴 Cycling</SelectItem>
                <SelectItem value="running">🏃 Running</SelectItem>
                <SelectItem value="photography">📸 Photography</SelectItem>
                <SelectItem value="picnic">🧺 Picnic</SelectItem>
                <SelectItem value="general">🌟 General Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onAnalyze}
            disabled={!isFormValid || isLoading}
            className="px-8"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Weather...
              </>
            ) : (
              "Analyze Weather Risk"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
