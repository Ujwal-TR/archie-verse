'use client';

import React from 'react';
import type { SceneObject as SceneObjectType } from '@/store/editorStore';
import { Wall } from './Wall';
import { Floor } from './Floor';
import { Door } from './Door';
import { Window } from './Window';
import { Roof } from './Roof';
import { Stairs } from './Stairs';
import { Furniture } from './Furniture';
import { Column } from './Column';
import { Beam } from './Beam';
import { Railing } from './Railing';
import { Bathroom } from './Bathroom';
import { Kitchen } from './Kitchen';
import { Lighting } from './Lighting';
import { Decor } from './Decor';

interface SceneObjectProps {
  obj: SceneObjectType;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
}

function SceneObjectComponent({ obj, isSelected, onSelect }: SceneObjectProps) {
  if (!obj.visible) return null;

  const commonProps = { obj, isSelected, onSelect };

  switch (obj.type) {
    case 'wall':       return <Wall {...commonProps} />;
    case 'floor':      return <Floor {...commonProps} />;
    case 'door':       return <Door {...commonProps} />;
    case 'window':     return <Window {...commonProps} />;
    case 'roof':       return <Roof {...commonProps} />;
    case 'stairs':     return <Stairs {...commonProps} />;
    case 'furniture':  return <Furniture {...commonProps} />;
    case 'column':     return <Column {...commonProps} />;
    case 'beam':       return <Beam {...commonProps} />;
    case 'railing':    return <Railing {...commonProps} />;
    case 'bathroom':   return <Bathroom {...commonProps} />;
    case 'kitchen':    return <Kitchen {...commonProps} />;
    case 'lighting':   return <Lighting {...commonProps} />;
    case 'decor':      return <Decor {...commonProps} />;
    default:
      console.warn(`SceneObject: unknown type "${(obj as SceneObjectType).type}"`);
      return null;
  }
}

export const SceneObject = React.memo(SceneObjectComponent);
export default SceneObject;
