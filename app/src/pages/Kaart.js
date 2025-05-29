import React, { useState, useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { ChevronDown, Layers, X, Eye, EyeOff } from 'lucide-react'; 

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

// uued legendid uutele kihtidele
const hinnaVahemikud = [
  { min: 500, tekst: '500 - 1000 €/m²', piirjoon: '#08306b' },
  { min: 1000, tekst: '1000 - 1500 €/m²', piirjoon: '#08306b' },
  { min: 1500, tekst: '1500 - 2000 €/m²', piirjoon: '#08306b' },
  { min: 2000, tekst: '2000 - 2500 €/m²', piirjoon: '#08306b' },
  { min: 2500, tekst: '2500 - 3000 €/m²', piirjoon: '#08306b' },
  { min: 3000, tekst: '3000 - 3500 €/m²', piirjoon: '#08306b' },
  { min: 3500, tekst: '3500 - 4000 €/m²', piirjoon: '#08306b' },
  { min: 4000, tekst: '4000 - 4500 €/m²', piirjoon: '#08306b' },
  { min: 4500, tekst: '4500+ €/m²', piirjoon: '#08306b' },
];

const vanusVahemikud = [
  { min: 0, tekst: '0 - 5 aastat', piirjoon: '#08306b' },
  { min: 5, tekst: '5 - 10 aastat', piirjoon: '#08306b' },
  { min: 10, tekst: '10 - 15 aastat', piirjoon: '#08306b' },
  { min: 15, tekst: '15 - 20 aastat', piirjoon: '#08306b' },
  { min: 20, tekst: '20 - 30 aastat', piirjoon: '#08306b' },
  { min: 30, tekst: '30 - 40 aastat', piirjoon: '#08306b' },
  { min: 40, tekst: '40 - 50 aastat', piirjoon: '#08306b' },
  { min: 50, tekst: '50 - 60 aastat', piirjoon: '#08306b' },
  { min: 60, tekst: '60+ aastat', piirjoon: '#08306b' },
];

const ehitusAastaVahemikud = [
  { min: 0, tekst: 'kuni 1940', piirjoon: '#08306b' },
  { min: 1940, tekst: '1940 - 1960', piirjoon: '#08306b' },
  { min: 1960, tekst: '1960 - 1975', piirjoon: '#08306b' },
  { min: 1975, tekst: '1975 - 1990', piirjoon: '#08306b' },
  { min: 1990, tekst: '1990 - 2000', piirjoon: '#08306b' },
  { min: 2000, tekst: '2000 - 2010', piirjoon: '#08306b' },
  { min: 2010, tekst: '2010 - 2018', piirjoon: '#08306b' },
  { min: 2018, tekst: '2018 - 2022', piirjoon: '#08306b' },
  { min: 2022, tekst: '2022+', piirjoon: '#08306b' },
];

const sinisedVärvid = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'];
const magmaVärvid = ['#fcfdbf', '#feda8b', '#fca65c', '#f8765c', '#ed4f6b', '#c92a81', '#9b179e', '#6a00a7', '#3b045e'];

const looTäiteVärviAvaldis = (värvid) => [
  'match',
  ['get', 'min_price'],
  500, värvid[0],
  1000, värvid[1],
  1500, värvid[2],
  2000, värvid[3],
  2500, värvid[4],
  3000, värvid[5],
  3500, värvid[6],
  4000, värvid[7],
  4500, värvid[8],
  'rgba(0,0,0,0)'
];

const looPiirjooneVärviAvaldis = (stiil) => {
  if (stiil === 'magma') {
    return magmaVärvid[8]; // peaks muutma vb, vahemalt mingil pohjusel dark modeis vaadates laks algul labipaistvaks
  } 
  return sinisedVärvid[8]; 
};

const looStatAvgPriceVärviAvaldis = (värvid) => [
  'step',
  ['get', 'avg_price'],
  värvid[0], 500,
  värvid[1], 1000,
  värvid[2], 1500,
  värvid[3], 2000,
  värvid[4], 2500,
  värvid[5], 3000,
  värvid[6], 3500,
  värvid[7], 4000,
  värvid[8]
];

const looStatMedianPriceVärviAvaldis = (värvid) => [
  'step',
  ['get', 'median_price'],
  värvid[0], 500,
  värvid[1], 1000,
  värvid[2], 1500,
  värvid[3], 2000,
  värvid[4], 2500,
  värvid[5], 3000,
  värvid[6], 3500,
  värvid[7], 4000,
  värvid[8]
];

const looStatAvgAgeVärviAvaldis = (värvid) => [
  'step',
  ['get', 'avg_age'],
  värvid[0], 5,
  värvid[1], 10,
  värvid[2], 15,
  värvid[3], 20,
  värvid[4], 30,
  värvid[5], 40,
  värvid[6], 50,
  värvid[7], 60,
  värvid[8]
];

const looStatMedianAgeVärviAvaldis = (värvid) => [
  'step',
  ['get', 'median_age'],
  värvid[0], 5,
  värvid[1], 10,
  värvid[2], 15,
  värvid[3], 20,
  värvid[4], 30,
  värvid[5], 40,
  värvid[6], 50,
  värvid[7], 60,
  värvid[8]
];

const looStatBuildYearVärviAvaldis = (värvid) => [
  'step',
  ['get', 'mode_build_year'],
  värvid[0], 1940,
  värvid[1], 1960,
  värvid[2], 1975,
  värvid[3], 1990,
  värvid[4], 2000,
  värvid[5], 2010,
  värvid[6], 2018,
  värvid[7], 2022,
  värvid[8]
];

const Kaart = () => {
  const kaardiKonteinerRef = useRef(null);
  const kaardiRef = useRef(null); 
  
  const [näitaKihidePaneeli, setNäitaKihidePaneeli] = useState(true); 
  const kihidePaneelRef = useRef(null);
  const kihiLülitiNuppRef = useRef(null);
  const [laiendatudKihiKategooriad, setLaiendatudKihiKategooriad] = useState({ 
    Tallinn: false,
    Tartu: false,
    Pärnu: false,
    Eesti: true 
  }); 
  const [aktiivseKihiDetailid, setAktiivseKihiDetailid] = useState({ linn: 'Eesti', kihiId: 'kriging', stiil: 'magma' }); 
  const [legendNähtav, setLegendNähtav] = useState(true); 
  const [mapLayersLoaded, setMapLayersLoaded] = useState(false);
  const [parkideKihidNähtav, setParkideKihidNähtav] = useState({
    Tallinn: false,
    Tartu: false,
    Pärnu: false
  });

  const linnad = useMemo(() => [
    { nimi: 'Eesti', koordinaadid: [25.0, 58.5], suum: 6.5 },
    { nimi: 'Tallinn', koordinaadid: [24.7536, 59.4370], suum: 10 },
    { nimi: 'Tartu', koordinaadid: [26.7290, 58.3780], suum: 11 },
    { nimi: 'Pärnu', koordinaadid: [24.4966, 58.3859], suum: 11 },
  ], []);

  const TALLINN_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/tallinn/tallinn.geojson`;
  const TALLINN_ALLIKA_ID = 'tallinn-hind-allikas';
  const TALLINN_ASTAT_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/tallinn/tallinn_astat.geojson`;
  const TALLINN_ASTAT_ALLIKA_ID = 'tallinn-astat-allikas';
  const TARTU_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/tartu/tartu.geojson`;
  const TARTU_ALLIKA_ID = 'tartu-hind-allikas';
  const TARTU_ASTAT_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/tartu/tartu_astat.geojson`;
  const TARTU_ASTAT_ALLIKA_ID = 'tartu-astat-allikas';
  const PARNU_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/parnu/parnu.geojson`;
  const PARNU_ALLIKA_ID = 'parnu-hind-allikas';
  const PARNU_ASTAT_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Linnad/mapbox/parnu/parnu_astat.geojson`;
  const PARNU_ASTAT_ALLIKA_ID = 'parnu-astat-allikas';
  const EESTI_GEOJSON_RADA = `${process.env.PUBLIC_URL}/geoinfo/QGIS/Eesti/eesti500_100_res2000.geojson`;
  const EESTI_ALLIKA_ID = 'eesti-hind-allikas';
  const TALLINN_PARGID_RADA = `${process.env.PUBLIC_URL}/geoinfo/tallinnpargid.geojson`;
  const TARTU_PARGID_RADA = `${process.env.PUBLIC_URL}/geoinfo/tartupargid.geojson`;
  const PARNU_PARGID_RADA = `${process.env.PUBLIC_URL}/geoinfo/parnupargid.geojson`;

  const hinnakategooriad = useMemo(() => [
    {
      nimi: 'Eesti',
      allikaId: EESTI_ALLIKA_ID,
      geoJsonRada: EESTI_GEOJSON_RADA,
      koordinaadid: linnad.find(l=>l.nimi === 'Eesti').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Eesti').suum,
      alamkihid: [
        { id: 'kriging-sinine', nimi: 'Hind €/rm (kriging)', stiil: 'sinine', tüüp: 'geojson', kihiIdEesliide: 'eesti-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } },
        { id: 'kriging-magma', nimi: 'Hind €/rm (kriging)', stiil: 'magma', tüüp: 'geojson', kihiIdEesliide: 'eesti-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } }
      ]
    },
    {
      nimi: 'Tallinn',
      koordinaadid: linnad.find(l=>l.nimi === 'Tallinn').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Tallinn').suum,
      alamkihid: [
        { 
          allikaId: TALLINN_ALLIKA_ID,
          geoJsonRada: TALLINN_GEOJSON_RADA,
          id: 'kriging-sinine', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } 
        },
        { 
          allikaId: TALLINN_ALLIKA_ID,
          geoJsonRada: TALLINN_GEOJSON_RADA,
          id: 'kriging-magma', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } 
        },
        
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'avg_price-sinine', 
          nimi: 'Keskmine hind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'avg_price-magma', 
          nimi: 'Keskmine hind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'median_price-sinine', 
          nimi: 'Mediaanhind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'median_price-magma', 
          nimi: 'Mediaanhind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'avg_age-sinine', 
          nimi: 'Keskmine vanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'avg_age-magma', 
          nimi: 'Keskmine vanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'median_age-sinine', 
          nimi: 'Mediaanvanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'median_age-magma', 
          nimi: 'Mediaanvanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-sinine', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        },
        { 
          allikaId: TALLINN_ASTAT_ALLIKA_ID,
          geoJsonRada: TALLINN_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-magma', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tallinn-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        }
      ]
    },
    {
      nimi: 'Tartu',
      koordinaadid: linnad.find(l=>l.nimi === 'Tartu').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Tartu').suum,
      alamkihid: [
        { 
          allikaId: TARTU_ALLIKA_ID,
          geoJsonRada: TARTU_GEOJSON_RADA,
          id: 'kriging-sinine', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } 
        },
        { 
          allikaId: TARTU_ALLIKA_ID,
          geoJsonRada: TARTU_GEOJSON_RADA,
          id: 'kriging-magma', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } 
        },
        
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'avg_price-sinine', 
          nimi: 'Keskmine hind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'avg_price-magma', 
          nimi: 'Keskmine hind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'median_price-sinine', 
          nimi: 'Mediaanhind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'median_price-magma', 
          nimi: 'Mediaanhind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'avg_age-sinine', 
          nimi: 'Keskmine vanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'avg_age-magma', 
          nimi: 'Keskmine vanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'median_age-sinine', 
          nimi: 'Mediaanvanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'median_age-magma', 
          nimi: 'Mediaanvanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-sinine', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        },
        { 
          allikaId: TARTU_ASTAT_ALLIKA_ID,
          geoJsonRada: TARTU_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-magma', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'tartu-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        }
      ]
    },
    {
      nimi: 'Pärnu',
      koordinaadid: linnad.find(l=>l.nimi === 'Pärnu').koordinaadid,
      suum: linnad.find(l=>l.nimi === 'Pärnu').suum,
      alamkihid: [
        { 
          allikaId: PARNU_ALLIKA_ID,
          geoJsonRada: PARNU_GEOJSON_RADA,
          id: 'kriging-sinine', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') } 
        },
        { 
          allikaId: PARNU_ALLIKA_ID,
          geoJsonRada: PARNU_GEOJSON_RADA,
          id: 'kriging-magma', 
          nimi: 'Hind €/rm (kriging)', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-hind',
          kujundus: { 'fill-color': looTäiteVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') } 
        },
        
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'avg_price-sinine', 
          nimi: 'Keskmine hind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'avg_price-magma', 
          nimi: 'Keskmine hind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatAvgPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine hind', väli: 'avg_price', ühik: '€/m²' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'median_price-sinine', 
          nimi: 'Mediaanhind', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'median_price-magma', 
          nimi: 'Mediaanhind', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatMedianPriceVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanhind', väli: 'median_price', ühik: '€/m²' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'avg_age-sinine', 
          nimi: 'Keskmine vanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'avg_age-magma', 
          nimi: 'Keskmine vanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatAvgAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Keskmine vanus', väli: 'avg_age', ühik: 'aastat' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'median_age-sinine', 
          nimi: 'Mediaanvanus', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'median_age-magma', 
          nimi: 'Mediaanvanus', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatMedianAgeVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Mediaanvanus', väli: 'median_age', ühik: 'aastat' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-sinine', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'sinine',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(sinisedVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('sinine') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        },
        { 
          allikaId: PARNU_ASTAT_ALLIKA_ID,
          geoJsonRada: PARNU_ASTAT_GEOJSON_RADA,
          id: 'mode_build_year-magma', 
          nimi: 'Ehitusaasta mood', 
          stiil: 'magma',
          tüüp: 'geojson', 
          kihiIdEesliide: 'parnu-stat',
          kujundus: { 'fill-color': looStatBuildYearVärviAvaldis(magmaVärvid), 'fill-opacity': 0.7, 'fill-outline-color': looPiirjooneVärviAvaldis('magma') },
          tooltip: { pealkiri: 'Ehitusaasta mood', väli: 'mode_build_year', ühik: '' } 
        }
      ]
    }
  ], [linnad]);

  const vahetaKihiKategooriaLaiendust = (kategooriaNimi) => {
    setLaiendatudKihiKategooriad(eelnev => ({ ...eelnev, [kategooriaNimi]: !eelnev[kategooriaNimi] }));
  };

  const haldaKihiValikut = (linnaNimi, kihiId, kihiStiil = null) => {
    const praeguneLinnDetailides = aktiivseKihiDetailid?.linn === linnaNimi;
    const praeguneKihiIdDetailides = aktiivseKihiDetailid?.kihiId === kihiId;
    
    let uuedDetailid;
    if (praeguneLinnDetailides && praeguneKihiIdDetailides) {
      uuedDetailid = null; // tühistab valiku
    } else {
      uuedDetailid = { linn: linnaNimi, kihiId: kihiId, stiil: kihiStiil || 'sinine' };
    }
    setAktiivseKihiDetailid(uuedDetailid);
  };

  const lülitaParkideKiht = (linnaNimi) => {
    setParkideKihidNähtav(prev => ({
      ...prev,
      [linnaNimi]: !prev[linnaNimi]
    }));
  };
  
  useEffect(() => {
    if (kaardiRef.current || !kaardiKonteinerRef.current) return; 
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN') {
      if (kaardiKonteinerRef.current) {
        kaardiKonteinerRef.current.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; font-size: 1.2em; color: red;">Mapboxi ligipääsutõend puudub. Kaarti ei saa kuvada.</div>';
      }
      return;
    }

    kaardiRef.current = new mapboxgl.Map({
      container: kaardiKonteinerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: linnad[0].koordinaadid,
      zoom: linnad[0].suum,
      attributionControl: false
    });

    kaardiRef.current.addControl(new mapboxgl.NavigationControl(), 'top-left');
    kaardiRef.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    const kohtspikriAken = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    kaardiRef.current.on('load', () => {
      const processedSources = new Set();
      
      hinnakategooriad.forEach(kategooria => {
        if (kategooria.alamkihid && kategooria.alamkihid.length > 0) {
          if (kategooria.allikaId && kategooria.geoJsonRada) {
            const allikaId = kategooria.allikaId;
            if (!processedSources.has(allikaId)) {
              processedSources.add(allikaId);
              kaardiRef.current.addSource(allikaId, {
                type: 'geojson',
                data: kategooria.geoJsonRada
              });
            }
          }
          
          // kui eraldi allikas
          kategooria.alamkihid.forEach(kiht => {
            // omal allikas
            if (kiht.allikaId && kiht.geoJsonRada) {
              const allikaId = kiht.allikaId;
              if (!processedSources.has(allikaId)) {
                processedSources.add(allikaId);
                kaardiRef.current.addSource(allikaId, {
                  type: 'geojson',
                  data: kiht.geoJsonRada
                });
              }
            }
            
            const mapKihiId = `${kiht.kihiIdEesliide}-${kiht.id}`;
            const sourceId = kiht.allikaId || kategooria.allikaId;
            
            if (!kaardiRef.current.getLayer(mapKihiId)) {
              kaardiRef.current.addLayer({
                id: mapKihiId,
                type: 'fill',
                source: sourceId,
                paint: kiht.kujundus, 
                layout: {
                  // kihi nähtavusega tegeleb alles kui koik kihid loaded
                  visibility: 'none' 
                }
              });
            }
          });
        }
      });

      const parkideAndmed = [
        { linn: 'Tallinn', rada: TALLINN_PARGID_RADA, allikaId: 'tallinn-pargid-allikas', kihiId: 'tallinn-pargid' },
        { linn: 'Tartu', rada: TARTU_PARGID_RADA, allikaId: 'tartu-pargid-allikas', kihiId: 'tartu-pargid' },
        { linn: 'Pärnu', rada: PARNU_PARGID_RADA, allikaId: 'parnu-pargid-allikas', kihiId: 'parnu-pargid' }
      ];

      parkideAndmed.forEach(park => {
        kaardiRef.current.addSource(park.allikaId, {
          type: 'geojson',
          data: park.rada
        });

        kaardiRef.current.addLayer({
          id: park.kihiId,
          type: 'fill',
          source: park.allikaId,
          paint: {
            'fill-color': '#2463eb',
            'fill-opacity': 0.6,
            'fill-outline-color': '#1d4ed8'
          },
          layout: {
            visibility: 'none'
          }
        });
      });

      // see tegeleb GeoJSON kihtidega tooltip poupupi jaoks - siin hetkel mingisugune jama 
      const geoJsonKihiIdd = [];
      hinnakategooriad.forEach(kategooria => {
          if (kategooria.alamkihid) { 
              kategooria.alamkihid.forEach(alamKiht => {
                  if (alamKiht.tüüp === 'geojson' && alamKiht.kihiIdEesliide && alamKiht.id) {
                      const mapKihiId = `${alamKiht.kihiIdEesliide}-${alamKiht.id}`;
                      geoJsonKihiIdd.push(mapKihiId);
                  }
              });
          }
      });


      // NB! see tegeleb hiire liikumisega & tooltip popupiga - siin jama kus tooltip tekib hiirest liiga kaugele yles
      geoJsonKihiIdd.forEach(kihiId => {
        kaardiRef.current.on('mousemove', kihiId, (sündmus) => {
          if (sündmus.features.length > 0) {
            const omadus = sündmus.features[0];
            
            // Leida kihi tooltip info
            let tooltipSisu = '';
            
            for (const kategooria of hinnakategooriad) {
              if (!kategooria.alamkihid) continue;
              
              const alamkiht = kategooria.alamkihid.find(k => `${k.kihiIdEesliide}-${k.id}` === kihiId);
              if (alamkiht) {
                if (alamkiht.tooltip) {
                  const väli = alamkiht.tooltip.väli;
                  const väärtus = omadus.properties[väli];
                  const asumi_nimi = omadus.properties.asumi_nimi || '';
                  const formattedValue = väärtus !== undefined && väärtus !== null ? parseFloat(väärtus).toFixed(0) : 'N/A';
                  tooltipSisu = `${asumi_nimi ? asumi_nimi + ': ' : ''}${alamkiht.tooltip.pealkiri}: ${formattedValue} ${alamkiht.tooltip.ühik}`;
                } 
                // selle peaks muutma vb hiljem aga prg ok - kui veel kihte kus erinevad ss muuta
                else if (kihiId.includes('hind')) {
                  const minPrice = omadus.properties.min_price;
                  const maxPrice = omadus.properties.max_price;
                  tooltipSisu = `Hind: ${minPrice !== undefined && minPrice !== null ? parseFloat(minPrice).toFixed(0) : 'N/A'} - ${maxPrice !== undefined && maxPrice !== null ? parseFloat(maxPrice).toFixed(0) : 'N/A'} €/rm`;
                }
                
                break;
              }
            }
            
            if (!tooltipSisu) {
              const props = omadus.properties;
              if (props.asumi_nimi) {
                tooltipSisu = `${props.asumi_nimi}`;
              } else {
                tooltipSisu = "Info pole saadaval";
              }
            }

            kohtspikriAken
              .setLngLat(sündmus.lngLat)
              .setHTML(tooltipSisu)
              .addTo(kaardiRef.current);
          }
        });

        kaardiRef.current.on('mouseleave', kihiId, () => {
          kohtspikriAken.remove();
        });
      });
      
      kaardiRef.current.once('idle', () => {
        setMapLayersLoaded(true);
      });
    });

    kaardiRef.current.on('error', () => {
    });

    return () => {
      kohtspikriAken.remove(); 
      if (kaardiRef.current) {
          kaardiRef.current.remove();
          kaardiRef.current = null; 
      }
    };
  }, []);

  // see uuendab aktiivset kihti
  useEffect(() => {
    if (!kaardiRef.current || !kaardiRef.current.isStyleLoaded() || !mapLayersLoaded) {
      return;
    }

    hinnakategooriad.forEach(kategooria => {
      if (kategooria.alamkihid) { 
        kategooria.alamkihid.forEach(kiht => {
          const täisKihiId = `${kiht.kihiIdEesliide}-${kiht.id}`;
          if (kaardiRef.current.getLayer(täisKihiId)) {
            let peaksOlemaNähtav = false;
            
            // Kontrolli kas kiht peaks olema nähtav valitud baaskihi ja stiili alusel
            if (aktiivseKihiDetailid && 
                kategooria.nimi === aktiivseKihiDetailid.linn &&
                kiht.id.split('-')[0] === aktiivseKihiDetailid.kihiId &&
                kiht.stiil === aktiivseKihiDetailid.stiil) {
              peaksOlemaNähtav = true;
            }
            
            const praeguneNähtavus = kaardiRef.current.getLayoutProperty(täisKihiId, 'visibility');
            if (peaksOlemaNähtav && praeguneNähtavus !== 'visible') {
              kaardiRef.current.setLayoutProperty(täisKihiId, 'visibility', 'visible');
            } else if (!peaksOlemaNähtav && praeguneNähtavus !== 'none') {
              kaardiRef.current.setLayoutProperty(täisKihiId, 'visibility', 'none');
            }
          } else {
          }
        });
      }
    });

    // see "lendab" valitud kihi linnani
    if (aktiivseKihiDetailid && aktiivseKihiDetailid.linn) {
      const aktiivneLinnObjekt = linnad.find(l => l.nimi === aktiivseKihiDetailid.linn);
      if (aktiivneLinnObjekt) {
        kaardiRef.current.flyTo({
          center: aktiivneLinnObjekt.koordinaadid,
          zoom: aktiivneLinnObjekt.suum,
          duration: 1000 
        });
      } else {
      }
    } else {
      const eestiVaade = linnad.find(l => l.nimi === 'Eesti');
      if (eestiVaade && kaardiRef.current && kaardiRef.current.isStyleLoaded()) {
         kaardiRef.current.flyTo({
           center: eestiVaade.koordinaadid,
           zoom: eestiVaade.suum,
           duration: 1000
         });
      }
    }

  }, [aktiivseKihiDetailid, mapLayersLoaded, hinnakategooriad, linnad]); 

  useEffect(() => {
    if (!kaardiRef.current || !kaardiRef.current.isStyleLoaded() || !mapLayersLoaded) {
      return;
    }

    const parkideKihid = [
      { linn: 'Tallinn', kihiId: 'tallinn-pargid' },
      { linn: 'Tartu', kihiId: 'tartu-pargid' },
      { linn: 'Pärnu', kihiId: 'parnu-pargid' }
    ];

    parkideKihid.forEach(park => {
      const peaksOlemaNähtav = parkideKihidNähtav[park.linn];
      
      if (kaardiRef.current.getLayer(park.kihiId)) {
        const praeguneNähtavus = kaardiRef.current.getLayoutProperty(park.kihiId, 'visibility');
        if (peaksOlemaNähtav && praeguneNähtavus !== 'visible') {
          kaardiRef.current.setLayoutProperty(park.kihiId, 'visibility', 'visible');
        } else if (!peaksOlemaNähtav && praeguneNähtavus !== 'none') {
          kaardiRef.current.setLayoutProperty(park.kihiId, 'visibility', 'none');
        }
      }
    });
  }, [parkideKihidNähtav, mapLayersLoaded]);

  // kui keegi seda loeb tunnen kaasa
  useEffect(() => {
    if (aktiivseKihiDetailid) {
      const currentCity = aktiivseKihiDetailid.linn;
      
      setParkideKihidNähtav(prev => {
        const shouldHideAll = Object.keys(prev).some(city => 
          city !== currentCity && prev[city] === true
        );
        
        if (shouldHideAll) {
          return {
            Tallinn: false,
            Tartu: false,
            Pärnu: false
          };
        }
        
        return prev;
      });
    }
  }, [aktiivseKihiDetailid]);

  // Kihimenüü sulgemine klikkides välja
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kihidePaneelRef.current && 
        !kihidePaneelRef.current.contains(event.target) &&
        kihiLülitiNuppRef.current && 
        !kihiLülitiNuppRef.current.contains(event.target)
      ) {
        setNäitaKihidePaneeli(false);
      }
    };

    if (näitaKihidePaneeli) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [näitaKihidePaneeli]);


  const legendiInfo = useMemo(() => {
    let result = {
      värvid: sinisedVärvid,
      vahemikud: hinnaVahemikud,
      ühik: '€/m²',
      kirjeldus: 'Keskmine m² hind piirkonniti'
    };
    
    if (!aktiivseKihiDetailid) return result;
    
    if (aktiivseKihiDetailid.stiil === 'magma') {
      result.värvid = magmaVärvid;
    } else {
      result.värvid = sinisedVärvid;
    }
    
    const baseId = aktiivseKihiDetailid.kihiId;
    if (baseId === 'kriging') {
      result.vahemikud = hinnaVahemikud;
      result.ühik = '€/m²';
      result.kirjeldus = 'Keskmine m² hind piirkonniti';
    } else if (baseId === 'avg_price') {
      result.vahemikud = hinnaVahemikud;
      result.ühik = '€/m²';
      result.kirjeldus = 'Keskmine m² hind asumites';
    } else if (baseId === 'median_price') {
      result.vahemikud = hinnaVahemikud;
      result.ühik = '€/m²';
      result.kirjeldus = 'Mediaanhind asumites';
    } else if (baseId === 'avg_age' || baseId === 'median_age') {
      result.vahemikud = vanusVahemikud;
      result.ühik = 'aastat';
      result.kirjeldus = baseId === 'avg_age' ? 'Keskmine kinnisvara vanus asumites' : 'Mediaanvanus asumites';
    } else if (baseId === 'mode_build_year') {
      result.vahemikud = ehitusAastaVahemikud;
      result.ühik = '';
      result.kirjeldus = 'Enim levinud ehitusaasta asumites';
    }
    
    return result;
  }, [aktiivseKihiDetailid]);

  const legendiPealkiri = useMemo(() => {
    if (!aktiivseKihiDetailid) return "Vali kiht";
    const kategooria = hinnakategooriad.find(k => k.nimi === aktiivseKihiDetailid.linn);
    if (!kategooria) return "Vali kiht";
    
    const baseId = aktiivseKihiDetailid.kihiId;
    const stiil = aktiivseKihiDetailid.stiil;
    const kiht = kategooria.alamkihid.find(k => 
      k.id.split('-')[0] === baseId && 
      k.stiil === stiil
    );
    
    if (!kiht) return "Vali kiht";
    return `${aktiivseKihiDetailid.linn}: ${kiht.nimi}`;
  }, [aktiivseKihiDetailid, hinnakategooriad]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 p-2 md:p-4 md:pl-6 md:pr-6 md:pt-2 md:pb-2 min-h-0">
        <div ref={kaardiKonteinerRef} className="w-full h-full rounded-lg shadow-md overflow-hidden relative">
          {!mapLayersLoaded && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="text-white text-lg font-semibold">Laen...</div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10">
            <button 
              ref={kihiLülitiNuppRef}
              onClick={() => setNäitaKihidePaneeli(!näitaKihidePaneeli)} 
              className="bg-white p-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ava/sulge kihtide paneel"
            >
              <Layers size={24} className="text-gray-700" />
            </button>
          </div>

          <div 
            ref={kihidePaneelRef} 
            className={`absolute bottom-16 left-2 md:left-4 z-20 bg-white rounded-lg shadow-xl w-[calc(100vw-1rem)] md:w-72 max-h-[60vh] md:max-h-[calc(100vh-10rem)] overflow-y-auto border border-gray-200 transition-opacity duration-300 ease-in-out flex flex-col ${näitaKihidePaneeli ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          >
          <div className="sticky top-0 bg-white z-10 px-4 pt-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Kihtide valik</h3>
              
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (aktiivseKihiDetailid) {
                        setAktiivseKihiDetailid({...aktiivseKihiDetailid, stiil: 'sinine'});
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      aktiivseKihiDetailid?.stiil === 'sinine' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Sinine
                  </button>
                  <button
                    onClick={() => {
                      if (aktiivseKihiDetailid) {
                        setAktiivseKihiDetailid({...aktiivseKihiDetailid, stiil: 'magma'});
                      }
                    }}
                    className={`px-3 py-1 rounded-md text-sm ${
                      aktiivseKihiDetailid?.stiil === 'magma' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    Magma
                  </button>
                </div>
                
                <button 
                  onClick={() => setNäitaKihidePaneeli(false)} 
                  className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Sulge kihtide paneel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 pt-2 overflow-y-auto flex-grow">
          
          {hinnakategooriad.map(kategooria => {
            return kategooria.alamkihid && (
              <div key={kategooria.nimi} className="mb-2 last:mb-0">
                <button 
                  onClick={() => vahetaKihiKategooriaLaiendust(kategooria.nimi)} 
                  className="w-full flex justify-between items-center py-2 px-2 text-left font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <span>{kategooria.nimi}</span>
                  <ChevronDown size={20} className={`transform transition-transform duration-200 ${laiendatudKihiKategooriad[kategooria.nimi] ? 'rotate-180' : ''}`} />
                </button>
                {laiendatudKihiKategooriad[kategooria.nimi] && (
                  <div className="pl-3 pt-1 border-l border-gray-200 ml-2">
                    {(() => {
                      const statisticLayers = [];
                      const krigingLayers = [];
                      
                      Array.from(new Set(kategooria.alamkihid.map(kiht => kiht.nimi)))
                        .forEach(uniqueNimi => {
                          const exampleKiht = kategooria.alamkihid.find(k => k.nimi === uniqueNimi);
                          const baseId = exampleKiht.id.split('-')[0]; 
                          const isKriging = baseId === 'kriging';
                          
                          const layer = {
                            baseId,
                            name: uniqueNimi,
                            isActive: aktiivseKihiDetailid && 
                                      aktiivseKihiDetailid.linn === kategooria.nimi && 
                                      aktiivseKihiDetailid.kihiId === baseId
                          };
                          
                          if (isKriging) {
                            krigingLayers.push(layer);
                          } else {
                            statisticLayers.push(layer);
                          }
                      });
                      
                      return (
                        <>
                          {/* esmalt kriging kihid */}
                          {krigingLayers.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kriging</div>
                              {krigingLayers.map(layer => (
                                <button 
                                  key={layer.baseId} 
                                  onClick={() => haldaKihiValikut(kategooria.nimi, layer.baseId, aktiivseKihiDetailid?.stiil || 'sinine')}
                                  className={`w-full text-left py-1.5 px-2 text-sm rounded-md transition-colors mb-1 last:mb-0 
                                            ${layer.isActive 
                                              ? 'bg-blue-500 text-white font-semibold' 
                                              : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {layer.name}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {statisticLayers.length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Statistika</div>
                              {statisticLayers.map(layer => (
                                <button 
                                  key={layer.baseId} 
                                  onClick={() => haldaKihiValikut(kategooria.nimi, layer.baseId, aktiivseKihiDetailid?.stiil || 'sinine')}
                                  className={`w-full text-left py-1.5 px-2 text-sm rounded-md transition-colors mb-1 last:mb-0 
                                            ${layer.isActive 
                                              ? 'bg-blue-500 text-white font-semibold' 
                                              : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {layer.name}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {kategooria.nimi !== 'Eesti' && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Muud kihid</div>
                              <div className="flex items-center justify-between py-1.5 px-2 text-sm rounded-md hover:bg-gray-50 transition-colors">
                                <span className="text-gray-600">Pargid</span>
                                <button
                                  onClick={() => lülitaParkideKiht(kategooria.nimi)}
                                  className={`p-1 rounded-md transition-colors ${
                                    parkideKihidNähtav[kategooria.nimi] 
                                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                  title={`${parkideKihidNähtav[kategooria.nimi] ? 'Peida' : 'Näita'} ${kategooria.nimi} pargid`}
                                >
                                  {parkideKihidNähtav[kategooria.nimi] ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )
          })}
          </div>
          </div>
          
          {/* Legend */}
          {aktiivseKihiDetailid && (
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10">
              {legendNähtav ? (
                <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg max-w-xs border border-gray-200">
                  <div className="flex justify-between items-center mb-2 border-b pb-1">
                    <h4 className="text-sm font-semibold text-gray-800">{legendiPealkiri}</h4>
                    <button
                      onClick={() => setLegendNähtav(false)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                      aria-label="Peida legend"
                    >
                      Peida
                    </button>
                  </div>
                  <div className="text-xs text-gray-700">
                    {legendiInfo.vahemikud.map((item, index) => (
                      <div key={index} className="flex items-center mb-1">
                        <span 
                          className="w-4 h-4 inline-block mr-2 border"
                          style={{ backgroundColor: legendiInfo.värvid[index], borderColor: item.piirjoon }}
                        ></span>
                        <span>{item.tekst}</span>
                      </div>
                    ))}
                    <p className="mt-2 text-gray-600 italic text-[11px]">{legendiInfo.kirjeldus}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setLegendNähtav(true)}
                  className="bg-white p-2 rounded-md shadow-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Näita legendi"
                >
                  Näita legendi
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Kaart;
