import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ↓ import image PNG supaya Vite copy ke /dist/assets dan ekspornya jadi URL
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Override default icon supaya Leaflet tahu URL yang benar di build
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PrasaranaItem {
  prasarana: string;
  kodeBarang?: string;
  lokasi?: string;
  latitude?: number;
  longitude?: number;
}

interface MapViewerProps {
  prasaranaItems: PrasaranaItem[];
}

export default function MapViewer({ prasaranaItems }: MapViewerProps) {
  const validLocations = prasaranaItems.filter(
    (it) =>
      typeof it.latitude === "number" &&
      typeof it.longitude === "number" &&
      (it.latitude !== 0 || it.longitude !== 0)
  );

  const center: [number, number] = validLocations.length
    ? [validLocations[0].latitude!, validLocations[0].longitude!]
    : [0, 0];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validLocations.map((item, idx) => (
        <Marker key={idx} position={[item.latitude!, item.longitude!]}>
          <Popup>
            <strong>{item.prasarana}</strong>
            <br />
            {item.latitude}, {item.longitude}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
