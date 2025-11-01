// GoogleMaps.d.ts
import { FC } from 'react';

declare const GoogleMaps: FC<{
  radius?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  setLatitude?: (v: number) => void;
  setLongitude?: (v: number) => void;
  setAddress?: (v: string) => void;
  style?: string;
}>;

export default GoogleMaps;
