import axios from "axios";
import { normalizeIp, isValidIp, isLoopbackIp } from "../middleware/ipBlocker";

export interface GeoLocationInfo {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  isp?: string;
  queryTime?: number;
}

// In-memory cache to prevent redundant API calls for recurring IPs (TTL: 24 hours)
const geoCache = new Map<string, { data: GeoLocationInfo; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const getIpGeoLocation = async (ip: string): Promise<GeoLocationInfo> => {
  const cleanIp = normalizeIp(ip);

  // Check local loopback / private IP ranges
  if (
    isLoopbackIp(cleanIp) ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.16.")
  ) {
    return {
      ip: cleanIp,
      country: "Local / Development",
      countryCode: "LOC",
      city: "Localhost",
      region: "Dev Environment",
      isp: "Internal Network",
    };
  }

  // Validate that IP address is structurally valid before dispatching external HTTP request
  if (!isValidIp(cleanIp)) {
    return {
      ip: cleanIp,
      country: "Unknown",
      city: "Unknown",
    };
  }

  // Check in-memory cache
  const cached = geoCache.get(cleanIp);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    // ip-api.com free tier (45 req/min, no API key required)
    const encodedIp = encodeURIComponent(cleanIp);
    const response = await axios.get(
      `http://ip-api.com/json/${encodedIp}?fields=status,message,country,countryCode,regionName,city,isp,query`,
      { timeout: 2500 }
    );

    if (response.data && response.data.status === "success") {
      const geoInfo: GeoLocationInfo = {
        ip: cleanIp,
        country: response.data.country,
        countryCode: response.data.countryCode,
        region: response.data.regionName,
        city: response.data.city,
        isp: response.data.isp,
      };

      geoCache.set(cleanIp, {
        data: geoInfo,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return geoInfo;
    }
  } catch (error) {
    // Fail silently and return fallback if external provider is offline or rate-limited
  }

  return {
    ip: cleanIp,
    country: "Unknown",
    city: "Unknown",
  };
};
