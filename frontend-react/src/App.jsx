import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import worldLandUrl from "./assets/world-land.svg";
import continentsSvg from "./assets/continents.svg?raw";

const API_KEY = import.meta.env.VITE_API_KEY || "SEASENSE_SECURE_KEY";
const WAVE_ICON = "\u{1F30A}";

const oceanData = {
  Pacific: {
    fact: "Largest ocean basin, covering more than one-third of Earth.",
    stats: [
      { label: "Area", value: "165M sq km" },
      { label: "Avg Depth", value: "4,280 m" },
      { label: "Notable", value: "Ring of Fire" },
      { label: "Surface Temp", value: "2-30 C" },
    ],
  },
  Atlantic: {
    fact: "Home to the Mid-Atlantic Ridge, a massive underwater mountain chain.",
    stats: [
      { label: "Area", value: "106M sq km" },
      { label: "Avg Depth", value: "3,646 m" },
      { label: "Notable", value: "Gulf Stream" },
      { label: "Surface Temp", value: "-2-28 C" },
    ],
  },
  Indian: {
    fact: "Warmest ocean, influencing monsoon patterns across Asia.",
    stats: [
      { label: "Area", value: "70M sq km" },
      { label: "Avg Depth", value: "3,741 m" },
      { label: "Notable", value: "Monsoon currents" },
      { label: "Surface Temp", value: "10-28 C" },
    ],
  },
  Southern: {
    fact: "Encircles Antarctica and drives the global ocean conveyor belt.",
    stats: [
      { label: "Area", value: "20M sq km" },
      { label: "Avg Depth", value: "3,270 m" },
      { label: "Notable", value: "Antarctic Circumpolar Current" },
      { label: "Surface Temp", value: "-2-2 C" },
    ],
  },
  Arctic: {
    fact: "Smallest and shallowest ocean, with dramatic seasonal ice shifts.",
    stats: [
      { label: "Area", value: "14M sq km" },
      { label: "Avg Depth", value: "1,205 m" },
      { label: "Notable", value: "Multi-year sea ice" },
      { label: "Surface Temp", value: "-2-5 C" },
    ],
  },
};

const generateSummary = (species, ocean, pollution, confidence = 100) => {
  // 🛑 Proper guard clause (FIXED)
  if (!species || species === "--" || species === "undefined") {
    return "Upload an image to generate analysis.";
  }

  // 🎯 Pollution Level
  let level = pollution < 60 ? "low" : pollution < 80 ? "moderate" : "high";

  // 🌊 Ocean Traits
  const oceanTraits = {
    Pacific: "vast and biodiverse",
    Atlantic: "commercially active and impacted",
    Indian: "warming rapidly with ecological stress",
    Southern: "cold and relatively pristine",
    Arctic: "fragile and climate-sensitive",
  };

  // 🐟 Habitat Map
  const habitatMap = {
    Catfish: ["Freshwater"],
    "Gold Fish": ["Freshwater"],
    "Indian Carp": ["Freshwater"],
    "Silver Carp": ["Freshwater"],
    Knifefish: ["Freshwater"],
    Tuna: ["Pacific", "Atlantic", "Indian"],
  };

  // 🧠 Habitat Validation
  const valid = habitatMap[species]
    ? habitatMap[species].includes(ocean)
    : true;

  let summary = "";

  // ⚠️ If mismatch
  if (!valid) {
    summary += `⚠️ ${species} is not naturally found in the ${ocean} Ocean. `;
    summary += `This may indicate environmental changes or model misclassification. `;

    if (confidence < 60) {
      summary += `Low confidence (${confidence}%) suggests prediction uncertainty. `;
    }

    return summary;
  }

  // 🌍 Normal Flow
  const oceanDesc = oceanTraits[ocean] || "an unspecified marine region";

  summary += `The detected species is ${species}, observed in the ${ocean} Ocean (${oceanDesc}). `;

  if (level === "low") {
    summary +=
      "Pollution levels are low, supporting a healthy marine ecosystem. ";
  } else if (level === "moderate") {
    summary += "Pollution levels are moderate, which may stress marine life. ";
  } else {
    summary +=
      "Pollution levels are high, posing serious risks to marine biodiversity. ";
  }

  return summary;
};

const generateFreshwaterSummary = (species, state, pollution) => {
  if (!species || species === "--") {
    return "Upload an image to analyze freshwater species.";
  }

  const freshwaterSpecies = [
    "Catfish",
    "Gold Fish",
    "Indian Carp",
    "Silver Carp",
    "Knifefish",
  ];

  // ❌ Wrong habitat case
  if (!freshwaterSpecies.includes(species)) {
    return `${species} is not typically a freshwater species. This may indicate misclassification or unusual environmental conditions.`;
  }

  // 🌊 Pollution impact
  if (pollution < 50) {
    return `${species} is likely to thrive in ${state} due to favorable water quality. Environmental conditions are stable and support aquatic life.`;
  } else if (pollution < 100) {
    return `${species} can survive in ${state}, but may experience moderate environmental stress. Water quality is acceptable but requires monitoring.`;
  } else {
    return `${species} is unlikely to survive in ${state} due to high pollution levels. The ecosystem conditions are harmful for sustained aquatic life.`;
  }
};

const continentData = {
  "North America": {
    fact: "Home to diverse coastal ecosystems from the Arctic to the tropics.",
    stats: [
      { label: "Coastline", value: "151,000 km" },
      { label: "Oceans", value: "Pacific, Atlantic, Arctic" },
      { label: "Notable", value: "Gulf of Mexico" },
      { label: "Marine Zone", value: "California Current" },
    ],
  },
  "South America": {
    fact: "The Humboldt Current shapes one of the world's richest fisheries.",
    stats: [
      { label: "Coastline", value: "25,000 km" },
      { label: "Oceans", value: "Pacific, Atlantic" },
      { label: "Notable", value: "Amazon Plume" },
      { label: "Marine Zone", value: "Humboldt Current" },
    ],
  },
  Europe: {
    fact: "Dense maritime traffic and productive seas define its coasts.",
    stats: [
      { label: "Coastline", value: "38,000 km" },
      { label: "Seas", value: "Mediterranean, North, Baltic" },
      { label: "Notable", value: "North Sea" },
      { label: "Marine Zone", value: "Norwegian Sea" },
    ],
  },
  Africa: {
    fact: "Bordered by major upwelling zones and warm tropical waters.",
    stats: [
      { label: "Coastline", value: "30,000 km" },
      { label: "Oceans", value: "Atlantic, Indian" },
      { label: "Notable", value: "Benguela Current" },
      { label: "Marine Zone", value: "Agulhas Current" },
    ],
  },
  Asia: {
    fact: "The busiest shipping corridors span its coastal seas.",
    stats: [
      { label: "Coastline", value: "100,000 km" },
      { label: "Seas", value: "South China, Arabian, Bering" },
      { label: "Notable", value: "Coral Triangle" },
      { label: "Marine Zone", value: "Kuroshio Current" },
    ],
  },
  Oceania: {
    fact: "Encircled by coral reefs and vast continental shelf seas.",
    stats: [
      { label: "Coastline", value: "25,700 km" },
      { label: "Oceans", value: "Indian, Pacific" },
      { label: "Notable", value: "Great Barrier Reef" },
      { label: "Marine Zone", value: "Tasman Sea" },
    ],
  },
  Antarctica: {
    fact: "Seasonal sea ice drives global ocean circulation.",
    stats: [
      { label: "Coastline", value: "17,900 km" },
      { label: "Oceans", value: "Southern" },
      { label: "Notable", value: "Ice shelves" },
      { label: "Marine Zone", value: "Weddell Sea" },
    ],
  },
};

const oceanZones = [
  {
    name: "Pacific",
    d: "M40 70 C160 40, 280 40, 360 90 L360 250 C300 310, 200 330, 80 300 Z",
  },
  {
    name: "Atlantic",
    d: "M330 70 C420 50, 520 60, 560 110 L560 250 C520 300, 430 320, 340 300 Z",
  },
  {
    name: "Indian",
    d: "M520 120 C620 90, 720 110, 760 160 L740 280 C680 320, 600 320, 540 280 Z",
  },
  {
    name: "Southern",
    d: "M120 280 C260 260, 540 260, 700 280 L700 350 C520 360, 280 360, 100 350 Z",
  },
  {
    name: "Arctic",
    d: "M200 30 C320 20, 520 20, 620 30 L600 70 C480 80, 300 80, 220 70 Z",
  },
];

function useAnimatedNumber(value, decimals, duration) {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    const to = value;
    previous.current = value;
    let rafId = 0;
    const start = performance.now();
    const animate = (ts) => {
      const progress = Math.min((ts - start) / duration, 1);
      const current = from + (to - from) * progress;
      setDisplay(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  return display.toFixed(decimals);
}

export default function App() {
  const [graphData, setGraphData] = useState({
    labels: [],
    values: [],
  });

  const [pollutionValue, setPollutionValue] = useState(0);
  const [confidenceValue, setConfidenceValue] = useState(0);
  const [riskValue, setRiskValue] = useState("--");
  // const [lastUpdated, setLastUpdated] = useState("--");
  const [activeRegion, setActiveRegion] = useState("Pacific");
  const [speciesFile, setSpeciesFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("freshwater");
  const [speciesPreview, setSpeciesPreview] = useState(null);
  const [speciesResult, setSpeciesResult] = useState({
    species: "--",
    confidence: "--",
    habitat: "--",
    status: "--",
    summary: "Upload an image to begin analysis.",
  });

  const pollutionDisplay = useAnimatedNumber(pollutionValue, 2, 900);
  const confidenceDisplay = useAnimatedNumber(confidenceValue * 100, 1, 900);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const oceanSectionRef = useRef(null);
  const svgRef = useRef(null);

  const activeData = useMemo(() => {
    return oceanData[activeRegion] || continentData[activeRegion];
  }, [activeRegion]);

  const continentMarkup = useMemo(() => {
    return continentsSvg
      .replace(/^[\s\S]*?<svg[^>]*>/, "")
      .replace(/<\/svg>[\s\S]*$/, "");
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          features: [25, 7.2, 30, 6],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      setPollutionValue(data.pollution_index);
      setConfidenceValue(data.confidence);
      setRiskValue(data.risk);
      // setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const loadPollutionData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/pollution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          region: activeRegion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pollution API failed");
      }

      // Update UI
      setPollutionValue(data.pollution_index || 0);
      setRiskValue(data.risk || "--");
      setConfidenceValue(data.confidence || 0);

      // Store graph separately (we’ll use this next)
      setGraphData(data.graph || { labels: [], values: [] });
    } catch (err) {
      console.error("Pollution Fetch Error:", err);
    }
  };

  useEffect(() => {
    if (speciesResult.species) {
      let updatedSummary;

      // 💧 Freshwater → use new generator
      if (selectedCategory === "freshwater") {
        updatedSummary = generateFreshwaterSummary(
          speciesResult.species,
          activeRegion,
          pollutionValue,
        );
      }
      // 🌊 Seawater → use existing generator
      else {
        updatedSummary = generateSummary(
          speciesResult.species,
          activeRegion,
          pollutionValue,
        );
      }

      setSpeciesResult((prev) => ({
        ...prev,
        summary: updatedSummary,
      }));
    }
  }, [activeRegion, pollutionValue, selectedCategory]);

  useEffect(() => {
    loadPollutionData();
  }, [activeRegion]);

  useEffect(() => {
    loadPollutionData();
    const timer = setInterval(loadPollutionData, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const nodes = svgRef.current.querySelectorAll(".continent-overlay path");
    nodes.forEach((node) => {
      const rawId = node.getAttribute("id") || "";
      const name = rawId.replace(/_/g, " ").trim();
      if (!name) return;
      node.dataset.continent = name;
      node.classList.add("continent-path");
      node.classList.toggle("active", name === activeRegion);
    });
  }, [activeRegion]);

  useEffect(() => {
    if (!chartRef.current) return;

    const labels = graphData.labels;
    const values = graphData.values;

    // 🚫 STOP if no data
    if (!labels.length || !values.length) return;

    // ✅ UPDATE EXISTING CHART
    if (chartInstance.current) {
      chartInstance.current.data.labels = labels; // ⭐ IMPORTANT
      chartInstance.current.data.datasets[0].data = values;
      chartInstance.current.update();
      return;
    }

    // ✅ CREATE NEW CHART
    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pollution Trend",
            data: values,
            borderColor: "#7bd7ff",
            backgroundColor: "rgba(123, 215, 255, 0.15)",
            tension: 0.4,
            fill: true,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }, [graphData]);

  useEffect(() => {
    document.body.classList.add("use-reveal");
    const items = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".tilt-card");
    const handleMove = (event) => {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rx = (y / rect.height - 0.5) * -8;
      const ry = (x / rect.width - 0.5) * 8;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    };
    const handleLeave = (event) => {
      event.currentTarget.style.transform = "";
    };
    cards.forEach((card) => {
      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);
    });
    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  useEffect(() => {
    if (!speciesFile) return;
    const url = URL.createObjectURL(speciesFile);
    setSpeciesPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [speciesFile]);

  const handleRunAnalysis = () => loadData();

  const handleJumpMap = () => {
    if (oceanSectionRef.current) {
      oceanSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSpeciesAnalyze = async () => {
    if (!speciesFile) {
      setSpeciesResult((prev) => ({
        ...prev,
        summary: "Please choose an image to analyze.",
      }));
      return;
    }

    const form = new FormData();
    form.append("image", speciesFile);
    form.append("category", selectedCategory);
    setSpeciesResult((prev) => ({
      ...prev,
      summary: "Analyzing image...",
    }));

    try {
      const res = await fetch("/predict", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const detecedSpecies = data.species || "Unknown";

      const generatedSummary = generateSummary(
        detecedSpecies,
        activeRegion,
        pollutionValue,
      );

      setSpeciesResult({
        species: data.species || "Unknown",
        confidence: data.confidence
          ? `${Math.round(data.confidence * 100)}%`
          : "--",
        habitat: data.habitat || "--",
        status: data.status || "--",
        summary: generatedSummary, // Use generated summary instead of API summary
      });
    } catch (err) {
      setSpeciesResult((prev) => ({
        ...prev,
        summary: `Analysis error: ${err.message}`,
      }));
    }
  };

  const handleSvgClick = (event) => {
    const target = event.target;
    if (target?.dataset?.ocean) {
      return;
    }
    if (target?.dataset?.continent) {
      setActiveRegion(target.dataset.continent);
      return;
    }

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 800;
    const y = ((event.clientY - rect.top) / rect.height) * 400;

    let ocean = "Pacific";
    if (y < 75) {
      ocean = "Arctic";
    } else if (y > 270) {
      ocean = "Southern";
    } else if (x < 320) {
      ocean = "Pacific";
    } else if (x < 540) {
      ocean = "Atlantic";
    } else {
      ocean = "Indian";
    }
    setActiveRegion(ocean);
  };

  const handleSvgHover = (event) => {
    const target = event.target;
    if (target?.dataset?.continent) {
      setActiveRegion(target.dataset.continent);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="header-content">
          <span className="wave-icon">{WAVE_ICON}</span>
          <span className="seasense-title">SeaSense</span>
          <span className="subtitle">Marine Control Center</span>
        </div>
      </div>

      <section className="hero reveal">
        <div className="hero-text">
          <h1>Intelligent Ocean Monitoring</h1>
          <p>
            Real-time pollution intelligence and predictive risk analysis for a
            safer, cleaner marine environment.
          </p>
          <div className="hero-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={handleRunAnalysis}
            >
              Run Live Analysis
            </button>
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="ghost-btn ocean-dropdown"
            >
              {/* 🌊 Oceans */}
              <option value="Pacific">🌊 Pacific Ocean</option>
              <option value="Atlantic">🌊 Atlantic Ocean</option>
              <option value="Indian">🌊 Indian Ocean</option>
              <option value="Southern">🌊 Southern Ocean</option>
              <option value="Arctic">🌊 Arctic Ocean</option>

              {/* 💧 Freshwater States */}
              <option value="Maharashtra">💧 Maharashtra</option>
              <option value="Assam">💧 Assam</option>
              <option value="Gujarat">💧 Gujarat</option>
              <option value="Tamil Nadu">💧 Tamil Nadu</option>
              <option value="Rajasthan">💧 Rajasthan</option>
            </select>
          </div>
          <div className="status-bar">
            <span className="status-dot"></span>
            <span>Live Systems Online</span>
          </div>
          <div className="scroll-cue">Scroll to explore</div>
        </div>
        <div className="jellyfish-stage">
          <div className="jellyfish">
            <div className="bell"></div>
            <div className="tentacles">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div className="jellyfish jellyfish-small">
            <div className="bell"></div>
            <div className="tentacles">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid reveal">
        <div className="card glass-card tilt-card">
          <h2>Pollution Index ({activeRegion})</h2>
          <h1 id="pollutionValue" className="big-number">
            {pollutionDisplay}
          </h1>
        </div>
        <div className="card glass-card tilt-card">
          <h2>Confidence</h2>
          <h1 id="confidenceValue" className="big-number">
            {confidenceDisplay}%
          </h1>
        </div>
        <div
          className="card glass-card tilt-card"
          id="riskCard"
          data-risk={riskValue}
        >
          <h2>Risk Level</h2>
          <h1 id="riskValue" className="big-number">
            {riskValue}
          </h1>
        </div>
      </div>

      <div className="chart-card glass-card intelligence-zone reveal">
        <div className="zone-header">
          <span>Pollution Trend</span>
          <span className="zone-chip">Live Trend</span>
        </div>
        <canvas id="forecastChart" ref={chartRef}></canvas>
      </div>

      <section className="features reveal">
        <div className="feature-card glass-card">
          <h3>Adaptive Models</h3>
          <p>
            Ensemble predictions calibrated for coastal and deep-ocean data.
          </p>
        </div>
        <div className="feature-card glass-card">
          <h3>Smart Alerts</h3>
          <p>Risk-aware notifications with confidence-based thresholds.</p>
        </div>
        <div className="feature-card glass-card">
          <h3>Trend Intelligence</h3>
          <p>Interactive trend analysis and historical scenario playback.</p>
        </div>
      </section>

      <section className="species-section reveal">
        <div className="species-upload glass-card">
          <h3>Marine Species Analyzer</h3>
          <p>Upload a photo to identify a species and learn key facts.</p>

          <div className="upload-row">
            <select onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="freshwater">Freshwater</option>
              <option value="seawater">Seawater</option>
            </select>

            <input
              type="file"
              id="speciesFile"
              accept="image/*"
              onChange={(event) =>
                setSpeciesFile(event.target.files?.[0] || null)
              }
            />
            <button
              id="analyzeBtn"
              className="analyze-btn"
              type="button"
              onClick={handleSpeciesAnalyze}
            >
              Analyze Image
            </button>
          </div>
          <div className="upload-hint">Supported: JPG, PNG, WEBP. Max 5MB.</div>
          <div
            className={`upload-preview${speciesPreview ? " has-image" : ""}`}
            id="speciesPreview"
          >
            {speciesPreview ? (
              <img src={speciesPreview} alt="Species preview" />
            ) : (
              <span>Preview will appear here</span>
            )}
          </div>
        </div>
        <div className="species-results glass-card" id="speciesResults">
          <h3>Analysis Results</h3>
          <div className="result-line">
            <span>Species</span>
            <strong id="speciesName">{speciesResult.species}</strong>
          </div>
          <div className="result-line">
            <span>Confidence</span>
            <strong id="speciesConfidence">{speciesResult.confidence}</strong>
          </div>

          <p id="speciesSummary" className="result-summary">
            {speciesResult.summary}
          </p>
        </div>
      </section>

      <section
        className="ocean-section reveal"
        id="oceanSection"
        ref={oceanSectionRef}
      >
        <div className="ocean-map glass-card">
          <h3>World Map</h3>
          <svg
            id="oceanSvg"
            viewBox="0 0 800 400"
            aria-label="Ocean map"
            onClick={handleSvgClick}
            onMouseOver={handleSvgHover}
            ref={svgRef}
          >
            <defs>
              <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a4b74" />
                <stop offset="60%" stopColor="#0f3656" />
                <stop offset="100%" stopColor="#0b2c46" />
              </linearGradient>
              <radialGradient id="oceanGradient" cx="50%" cy="35%" r="80%">
                <stop offset="0%" stopColor="rgba(19, 99, 223, 0.25)" />
                <stop offset="60%" stopColor="rgba(6, 40, 61, 0.55)" />
                <stop offset="100%" stopColor="rgba(6, 25, 45, 0.85)" />
              </radialGradient>
              <filter
                id="landShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="6"
                  floodColor="rgba(3, 18, 32, 0.5)"
                />
              </filter>
            </defs>
            <rect
              x="20"
              y="20"
              width="760"
              height="360"
              rx="28"
              className="map-frame"
            />
            <g className="map-grid">
              <path d="M40 90 Q400 70 760 90" />
              <path d="M40 140 Q400 120 760 140" />
              <path d="M40 190 Q400 170 760 190" />
              <path d="M40 240 Q400 220 760 240" />
              <path d="M40 290 Q400 270 760 290" />
              <path d="M120 40 Q140 200 120 360" />
              <path d="M260 40 Q280 200 260 360" />
              <path d="M400 40 Q420 200 400 360" />
              <path d="M540 40 Q560 200 540 360" />
              <path d="M680 40 Q700 200 680 360" />
            </g>
            <image
              href={worldLandUrl}
              x="20"
              y="20"
              width="760"
              height="360"
              preserveAspectRatio="xMidYMid meet"
              className="world-land"
            />
            <g className="ocean-zones">
              {oceanZones.map((zone) => (
                <path
                  key={zone.name}
                  className={`ocean-zone ${activeRegion === zone.name ? "active" : ""}`}
                  data-ocean={zone.name}
                  d={zone.d}
                  onClick={() => setActiveRegion(zone.name)}
                  onMouseEnter={() => setActiveRegion(zone.name)}
                />
              ))}
            </g>
            <g
              className="continent-overlay"
              transform="translate(20 20) scale(0.95 0.93)"
              dangerouslySetInnerHTML={{ __html: continentMarkup }}
            />
            <g className="map-labels">
              <text x="170" y="200" className="map-label">
                Pacific
              </text>
              <text x="420" y="200" className="map-label">
                Atlantic
              </text>
              <text x="650" y="200" className="map-label">
                Indian
              </text>
              <text x="220" y="340" className="map-label">
                Southern
              </text>
              <text x="420" y="60" className="map-label">
                Arctic
              </text>
            </g>
          </svg>
        </div>
        <div className="ocean-facts glass-card">
          <h3 id="oceanTitle">
            {activeRegion}
            {oceanData[activeRegion] ? " Ocean" : ""}
          </h3>
          <p id="oceanFact">{activeData?.fact || "Region data unavailable."}</p>
          <ul className="ocean-stats" id="oceanStats">
            {(activeData?.stats || []).map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>
          <div className="ocean-hint">
            Click any ocean or continent on the map to learn a fact.
          </div>
        </div>
      </section>
    </>
  );
}
