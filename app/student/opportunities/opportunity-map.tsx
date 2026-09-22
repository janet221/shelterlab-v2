"use client";
import { divIcon } from "leaflet";
import { MapContainer,Marker,Popup,TileLayer } from "react-leaflet";
import type { ActionOpportunity } from "@/lib/action-opportunities/types";

const icon=divIcon({className:"",html:'<span style="display:grid;place-items:center;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#247566;border:3px solid white;box-shadow:0 3px 10px #0006"></span>',iconSize:[34,42],iconAnchor:[17,38]});
export default function OpportunityMap({items,onSelect}:{items:ActionOpportunity[];onSelect:(id:string)=>void}){const mapped=items.filter(item=>item.latitude!==undefined&&item.longitude!==undefined);return <div style={{height:"520px",border:"2px solid #655d51",borderRadius:"22px",overflow:"hidden"}}><MapContainer center={[23.7,120.95]} zoom={7} style={{height:"100%",width:"100%"}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{mapped.map(item=><Marker key={item.id} position={[item.latitude!,item.longitude!]} icon={icon}><Popup><strong>{item.title}</strong><br/>{item.organizationName}<br/>{item.city}<br/><button type="button" onClick={()=>onSelect(item.id)}>查看詳情</button></Popup></Marker>)}</MapContainer></div>}
