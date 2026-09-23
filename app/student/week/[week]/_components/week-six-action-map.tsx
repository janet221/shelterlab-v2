"use client";

import { divIcon, type Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Coordinates, OrganizationMatch } from "@/lib/week-six-action";

const markerClass = {
  public_shelter: "week6-marker-green",
  animal_home: "week6-marker-green",
  government_agency: "week6-marker-blue",
  animal_protection_office: "week6-marker-blue",
  education_park: "week6-marker-purple",
  animal_welfare_education_park: "week6-marker-purple",
  registered_nonprofit: "week6-marker-yellow",
  animal_welfare_association: "week6-marker-yellow",
  foundation: "week6-marker-yellow",
  rescue_group: "week6-marker-yellow",
  private_rescue_group: "week6-marker-yellow",
  other_verified_organization: "week6-marker-purple",
  other_partner: "week6-marker-purple"
} as const;

function Recenter({ location, countyMatch }: { location: Coordinates | null; countyMatch?: OrganizationMatch }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.latitude, location.longitude], 11);
    else if (countyMatch) map.flyTo([countyMatch.organization.latitude, countyMatch.organization.longitude], 9);
  }, [map, location, countyMatch]);
  return null;
}

export default function WeekSixActionMap({ matches, location, selectedId, onSelect }: { matches: OrganizationMatch[]; location: Coordinates | null; selectedId: string; onSelect: (id: string) => void }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const icons = useMemo(() => ({
    public_shelter: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-green">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    animal_home: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-green">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    government_agency: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-blue">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    animal_protection_office: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-blue">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    education_park: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-purple">◆</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    animal_welfare_education_park: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-purple">◆</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    registered_nonprofit: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-yellow">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    animal_welfare_association: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-yellow">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    foundation: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-yellow">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    rescue_group: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-yellow">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    private_rescue_group: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-yellow">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    other_verified_organization: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-purple">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    other_partner: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-purple">●</span>', iconSize: [34, 42], iconAnchor: [17, 38] }),
    user: divIcon({ className: "week6-marker-wrap", html: '<span class="week6-marker week6-marker-user">你</span>', iconSize: [34, 34], iconAnchor: [17, 17] })
  }), []);
  const first = matches.find((item) => item.exactMatch) || matches[0];
  const visibleTypes = [...new Set(matches.map((item) => item.organization.organizationType))];
  const legendNames = { public_shelter: "公立收容所", animal_home: "動物之家", government_agency: "動保處／防疫所", animal_protection_office:"動保處／防疫所", education_park: "教育園區", animal_welfare_education_park:"動保教育園區", registered_nonprofit: "已驗證民間團體", animal_welfare_association:"動保協會", foundation:"基金會", rescue_group: "救援／中途組織", private_rescue_group:"民間救援／中途", other_verified_organization:"其他已驗證單位", other_partner: "其他合作單位" } as const;
  return <div className="week6-map-shell">
    <MapContainer center={[23.7, 120.95]} zoom={7} scrollWheelZoom className="week6-map" ref={mapRef}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter location={location} countyMatch={first} />
      <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
        {matches.map(({ organization, distanceKm }) => <Marker key={organization.id} position={[organization.latitude, organization.longitude]} icon={icons[organization.organizationType]} eventHandlers={{ click: () => onSelect(organization.id) }}>
          <Popup><strong>{organization.name}</strong><br />{organization.address}<br />{distanceKm === null ? "" : `約 ${distanceKm.toFixed(1)} 公里`}<br /><button type="button" onClick={() => onSelect(organization.id)}>{selectedId === organization.id ? "已加入行動計畫" : "查看我可以怎麼幫"}</button></Popup>
        </Marker>)}
      </MarkerClusterGroup>
      {location && <Marker position={[location.latitude, location.longitude]} icon={icons.user}><Popup>你的約略位置（只在此裝置計算）</Popup></Marker>}
    </MapContainer>
    <div className="week6-map-legend">{visibleTypes.map((type) => <span key={type} className={markerClass[type]}>● {legendNames[type]}</span>)}{matches.some(item=>item.organization.hasOfficialVolunteerInfo)&&<span>◎ 官方曾公告志工資訊</span>}</div>
  </div>;
}
