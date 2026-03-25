import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CITY_COORDINATES,
  SOLAR_PROVIDERS,
  type ProviderService,
  type ProviderType,
  type SolarProvider,
  type ProviderReview,
} from "@/utils/providers";

const createServiceIcon = (type: ProviderType, selected: boolean) => {
  const icon = type === "Company" ? "☀" : "🛠";
  const bg = type === "Company" ? "#ea580c" : "#2563eb";
  const border = selected ? "3px solid #facc15" : "2px solid #ffffff";
  const size = selected ? 34 : 30;

  return L.divIcon({
    html: `<div style="background:${bg};color:white;border-radius:9999px;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.3);border:${border}">${icon}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return `${"★".repeat(rounded)}${"☆".repeat(Math.max(0, 5 - rounded))}`;
};

const approxDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const rough = Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
  return rough * 111;
};

const normalizePhoneForWhatsApp = (phone: string) => phone.replace(/[^\d]/g, "");

const normalizePhoneForTel = (phone: string) => phone.replace(/\s+/g, "");

interface FilterState {
  ratingAbove4: boolean;
  service: "All" | ProviderService;
  distance: "All" | 5 | 10;
  type: "All" | ProviderType;
}

interface EnrichedProvider extends SolarProvider {
  distanceKm: number;
  computedRating: number;
}

const ServiceFinderMap = () => {
  const [city, setCity] = useState("Pune");
  const [manualMode, setManualMode] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Using city location fallback");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    ratingAbove4: false,
    service: "All",
    distance: "All",
    type: "All",
  });
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [localReviews, setLocalReviews] = useState<Record<number, ProviderReview[]>>({});
  const [requestMessage, setRequestMessage] = useState("");
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRefs = useRef<Record<number, L.Marker>>({});

  const normalizedCity = city.trim().toLowerCase();
  const selectedCityCenter = CITY_COORDINATES[normalizedCity] ?? CITY_COORDINATES.pune;
  const center = userLocation ?? { lat: selectedCityCenter.lat, lng: selectedCityCenter.lng };
  const zoom = userLocation ? 12 : selectedCityCenter.zoom;

  useEffect(() => {
    if (!navigator.geolocation || manualMode) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus("Using current GPS location");
      },
      () => {
        setLocationStatus("GPS unavailable, using selected city");
      },
      { enableHighAccuracy: false, timeout: 7000 }
    );
  }, [manualMode]);

  const providersWithMetrics = useMemo<EnrichedProvider[]>(() => {
    return SOLAR_PROVIDERS.filter((provider) => provider.city.toLowerCase() === normalizedCity).map((provider) => {
      const mergedReviews = [...(localReviews[provider.id] ?? []), ...provider.reviews];
      const avgFromReviews = mergedReviews.length
        ? mergedReviews.reduce((sum, item) => sum + item.rating, 0) / mergedReviews.length
        : provider.rating;

      return {
        ...provider,
        distanceKm: approxDistanceKm(center.lat, center.lng, provider.lat, provider.lng),
        computedRating: Math.round(avgFromReviews * 10) / 10,
        reviews: mergedReviews.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
      };
    });
  }, [center.lat, center.lng, localReviews, normalizedCity]);

  const visibleServices = useMemo(() => {
    return providersWithMetrics.filter((provider) => {
      if (filters.ratingAbove4 && provider.computedRating < 4) {
        return false;
      }

      if (filters.service !== "All" && !provider.services.includes(filters.service)) {
        return false;
      }

      if (filters.distance !== "All" && provider.distanceKm > filters.distance) {
        return false;
      }

      if (filters.type !== "All" && provider.type !== filters.type) {
        return false;
      }

      return true;
    });
  }, [providersWithMetrics, filters]);

  const topRatedNearbyId = useMemo(() => {
    const candidates = visibleServices.filter((provider) => provider.computedRating >= 4.5);
    if (candidates.length === 0) {
      return null;
    }
    return candidates.sort((a, b) => a.distanceKm - b.distanceKm)[0].id;
  }, [visibleServices]);

  const selectedProvider = useMemo(
    () => visibleServices.find((provider) => provider.id === selectedProviderId) ?? null,
    [visibleServices, selectedProviderId]
  );

  useEffect(() => {
    if (selectedProviderId && !selectedProvider) {
      setSelectedProviderId(null);
    }
  }, [selectedProviderId, selectedProvider]);

  const requestService = (service: ProviderService) => {
    setRequestMessage(`Request Service (${service}) will be enabled in backend mode.`);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !reviewComment.trim()) {
      setReviewFeedback("Please add a rating and comment.");
      return;
    }

    const review: ProviderReview = {
      user: "You",
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
    };

    setLocalReviews((prev) => ({
      ...prev,
      [selectedProvider.id]: [review, ...(prev[selectedProvider.id] ?? [])],
    }));
    setReviewComment("");
    setReviewRating(5);
    setReviewFeedback("Review submitted (Demo mode)");
  };

  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current).setView([center.lat, center.lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) {
      return;
    }

    mapInstanceRef.current.setView([center.lat, center.lng], zoom);
    markersLayerRef.current.clearLayers();
    markerRefs.current = {};

    visibleServices.forEach((provider) => {
      const icon = createServiceIcon(provider.type, provider.id === selectedProviderId);
      const marker = L.marker([provider.lat, provider.lng], { icon });
      marker.bindPopup(`
        <div style="min-width:240px;font-family:Inter,system-ui,Segoe UI,sans-serif">
          <p style="font-weight:600;margin:0 0 6px 0;color:#0f172a">${provider.name}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 6px 0;">${provider.type} • ${provider.experience}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 6px 0;">📞 ${provider.phone}</p>
          <p style="font-size:12px;color:#475569;margin:0 0 6px 0;">⭐ ${renderStars(provider.computedRating)} (${provider.computedRating.toFixed(1)})</p>
          <p style="font-size:12px;color:#475569;margin:0;">📍 ~${provider.distanceKm.toFixed(1)} km away</p>
        </div>
      `);
      marker.on("click", () => {
        setSelectedProviderId(provider.id);
        setReviewFeedback("");
        setRequestMessage("");
      });
      markersLayerRef.current?.addLayer(marker);
      markerRefs.current[provider.id] = marker;
    });
  }, [center.lat, center.lng, zoom, visibleServices, selectedProviderId]);

  const focusProvider = (provider: EnrichedProvider) => {
    setSelectedProviderId(provider.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([provider.lat, provider.lng], 13, { animate: true });
    }
    const marker = markerRefs.current[provider.id];
    marker?.openPopup();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-lg">
      <h3 className="text-base font-semibold text-foreground">Find Solar Services Near You</h3>
      <p className="mt-1 text-xs text-muted-foreground">{locationStatus}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={() => {
            setManualMode((prev) => !prev);
            if (!manualMode) {
              setUserLocation(null);
              setLocationStatus("Manual city mode enabled");
            }
          }}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-all hover:-translate-y-0.5 hover:bg-muted"
        >
          {manualMode ? "Use GPS" : "Manual Mode"}
        </button>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-background p-1">
          {(["All", "Company", "Technician"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilters((prev) => ({ ...prev, type: option }))}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filters.type === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2 rounded-xl border border-border bg-secondary/15 p-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={filters.ratingAbove4}
            onChange={(event) => setFilters((prev) => ({ ...prev, ratingAbove4: event.target.checked }))}
          />
          4⭐ and above
        </label>

        <select
          aria-label="Filter by service type"
          value={filters.service}
          onChange={(event) => setFilters((prev) => ({ ...prev, service: event.target.value as FilterState["service"] }))}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
        >
          <option value="All">All Services</option>
          <option value="Installation">Installation</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Repair">Repair</option>
        </select>

        <select
          aria-label="Filter by distance"
          value={String(filters.distance)}
          onChange={(event) => {
            const raw = event.target.value;
            setFilters((prev) => ({
              ...prev,
              distance: raw === "All" ? "All" : (Number(raw) as 5 | 10),
            }));
          }}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
        >
          <option value="All">All Distances</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
        </select>

        <select
          aria-label="Filter by provider type"
          value={filters.type}
          onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as FilterState["type"] }))}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
        >
          <option value="All">All Types</option>
          <option value="Company">Company</option>
          <option value="Technician">Technician</option>
        </select>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <div ref={mapElementRef} className="h-[360px] w-full" aria-label="Solar service provider map" />
        </div>

        <aside className="rounded-xl border border-border bg-card p-3 transition-all duration-300 lg:static lg:block fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-auto lg:max-h-none lg:overflow-visible">
          <h4 className="text-sm font-semibold text-foreground">Provider Details</h4>
          {!selectedProvider ? (
            <p className="mt-2 text-sm text-muted-foreground">Select a marker to view full provider details.</p>
          ) : (
            <div className="mt-2 space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{selectedProvider.name}</p>
                  {selectedProvider.id === topRatedNearbyId && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      ⭐ Top Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedProvider.type} • {selectedProvider.experience}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">📍 {selectedProvider.address}</p>
                <p className="text-xs text-muted-foreground">~{selectedProvider.distanceKm.toFixed(1)} km away</p>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                <p className="mt-1 text-xs text-foreground">📞 {selectedProvider.phone}</p>
                <p className="text-xs text-foreground">✉ {selectedProvider.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={`tel:${normalizePhoneForTel(selectedProvider.phone)}`}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/${normalizePhoneForWhatsApp(selectedProvider.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800"
                  >
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => requestService("Installation")}
                    className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    Request Service
                  </button>
                </div>
                {requestMessage && <p className="mt-2 text-xs text-muted-foreground">{requestMessage}</p>}
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Services</p>
                <p className="mt-1 text-xs text-foreground">🛠 {selectedProvider.services.join(", ")}</p>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ratings & Reviews</p>
                <p className="mt-1 text-xs text-foreground">
                  ⭐ {selectedProvider.computedRating.toFixed(1)} ({selectedProvider.reviews.length} reviews)
                </p>

                <ul className="mt-2 space-y-1.5">
                  {selectedProvider.reviews.slice(0, 3).map((review, index) => (
                    <li key={`${review.user}-${review.createdAt}-${index}`} className="rounded-md border border-border bg-secondary/30 p-2">
                      <p className="text-xs font-medium text-foreground">{review.user} • {review.rating.toFixed(1)} ⭐</p>
                      <p className="text-xs text-muted-foreground">{review.comment}</p>
                    </li>
                  ))}
                </ul>

                <form onSubmit={submitReview} className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Rating</label>
                    <select
                      aria-label="Rate this provider"
                      value={reviewRating}
                      onChange={(event) => setReviewRating(Number(event.target.value))}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value={5}>5</option>
                      <option value={4}>4</option>
                      <option value={3}>3</option>
                      <option value={2}>2</option>
                      <option value={1}>1</option>
                    </select>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={2}
                    placeholder="Write a review"
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  >
                    Submit Review
                  </button>
                  {reviewFeedback && <p className="text-xs text-muted-foreground">{reviewFeedback}</p>}
                </form>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Service Providers</h4>
        {visibleServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No providers found for this city/filter yet.</p>
        ) : (
          <ul className="space-y-2">
            {visibleServices.map((provider) => (
              <li
                key={provider.id}
                onClick={() => focusProvider(provider)}
                className={`cursor-pointer rounded-lg border bg-secondary/20 px-3 py-2 transition-all duration-200 ${
                  selectedProviderId === provider.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{provider.name}</p>
                  {provider.id === topRatedNearbyId && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      ⭐ Top Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {provider.type} • {provider.computedRating.toFixed(1)} ⭐ • ~{provider.distanceKm.toFixed(1)} km away
                </p>
                <p className="text-xs text-muted-foreground">{provider.services.join(", ")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* This module is designed for future backend integration where provider data, real reviews, and booking requests will be stored and managed. */}
    </section>
  );
};

export default ServiceFinderMap;
