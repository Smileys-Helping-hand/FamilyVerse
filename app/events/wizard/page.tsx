"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import LocationSearch from "../../../components/wizard/LocationSearch";
import { useTransition } from "react";
import { getForecast } from "../../../actions/weather";

// Step 1: Template selection
const TEMPLATES = [
  { emoji: "🏖️", name: "Beach Day" },
  { emoji: "🧺", name: "Picnic" },
  { emoji: "🥩", name: "Braai" },
  { emoji: "🎮", name: "Game Night" },
];

function Step1({ onSelect }: { onSelect: (template: string) => void }) {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h2 className="text-2xl font-bold mb-4">Choose the Vibe</h2>
      <div className="grid grid-cols-2 gap-6">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.name}
            className="rounded-xl shadow-lg p-8 text-3xl bg-white hover:bg-blue-100 border-2 border-transparent hover:border-blue-400 transition-all flex flex-col items-center"
            onClick={() => onSelect(tpl.name)}
          >
            <span className="text-5xl mb-2">{tpl.emoji}</span>
            <span className="font-semibold text-lg">{tpl.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OutingWizardPage() {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [venue, setVenue] = useState<{ place: string; lat: number; lng: number } | null>(null);
  const [date, setDate] = useState<string>("");
  const [weather, setWeather] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <main className="max-w-xl mx-auto py-10 px-4">
      {step === 1 && (
        <Step1
          onSelect={(tpl) => {
            setSelectedTemplate(tpl);
            setStep(2);
            // TODO: preload required items for tpl
          }}
        />
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-2">Venue Scout</h2>
          <LocationSearch
            onSelect={(loc) => {
              setVenue(loc);
              setWeather(null);
            }}
          />
          {venue && (
            <div className="mt-2">
              <div className="font-semibold">{venue.place}</div>
              <div className="text-xs text-gray-500">Lat: {venue.lat}, Lng: {venue.lng}</div>
            </div>
          )}
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => setStep(3)}
            disabled={!venue}
          >
            Next: Check Weather
          </button>
          <button
            className="mt-2 text-gray-500 underline"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
        </div>
      )}

      {step === 3 && venue && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold mb-2">The Meteorologist</h2>
          <div>
            <label className="block mb-1 font-semibold">Pick a date for your outing:</label>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={date}
              onChange={e => {
                setDate(e.target.value);
                if (venue && e.target.value) {
                  startTransition(async () => {
                    const forecast = await getForecast(venue.lat, venue.lng, e.target.value);
                    setWeather(forecast);
                  });
                }
              }}
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
          {weather && (
            <div className="mt-4 p-4 rounded-lg border bg-blue-50">
              <div className="font-semibold mb-1">Forecast for {venue.place} on {date}:</div>
              <div className="flex gap-4 items-center">
                <span>{weather.condition}</span>
                <span>🌡️ {weather.maxTemp}°C / {weather.minTemp}°C</span>
                <span>💧 {weather.rainChance}% rain</span>
              </div>
              {weather.rainChance >= 60 && (
                <div className="mt-2 text-yellow-900 bg-yellow-200 rounded p-2 font-bold flex items-center gap-2">
                  ⚠️ High chance of rain. Consider an indoor venue!
                </div>
              )}
            </div>
          )}
          <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => setStep(4)}
            disabled={!date || !weather}
          >
            Next: Review & Launch
          </button>
          <button
            className="mt-2 text-gray-500 underline"
            onClick={() => setStep(2)}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 4 will be added here */}
    </main>
  );
}
