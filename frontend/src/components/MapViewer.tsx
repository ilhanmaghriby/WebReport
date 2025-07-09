import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
    (item) =>
      typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      (item.latitude !== 0 || item.longitude !== 0)
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
            {item.prasarana}
            <br />
            {item.latitude}, {item.longitude}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
