import React from 'react';
import { MapPin, DollarSign, HelpCircle } from 'lucide-react';

export const NAV_ELEMENDID = [
  { nimi: 'Kaart', ikoon: <MapPin size={20} />, leht: 'kaart' },
  { nimi: 'Ennustusmudel', ikoon: <DollarSign size={20} />, leht: 'ennustus' },
];

export const MUUD_ELEMENDID = [
  { nimi: 'Info', ikoon: <HelpCircle size={20} />, leht: 'info' }, 
];

export const KINNISVARA_TÜÜBID = [
  { id: 'korter', name: 'Korter' },
  { id: 'maja', name: 'Maja' },
];

export const SEISUKORRAD = [
  { id: 'uus_renoveeritud', name: 'Uus/Renoveeritud' },
  { id: 'vajab_renoveerimist_keskmine', name: 'Vajab renoveerimist/Keskmine' },
  { id: 'vajab_kapitaalremonti_halb', name: 'Vajab kapitaalremonti/Halb' },
];
