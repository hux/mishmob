import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ViewStyle, TextStyle } from 'react-native';

export type IconLibrary = 'MaterialCommunityIcons' | 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'FontAwesome5';

interface IconProps {
  library?: IconLibrary;
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
}

const IconComponents = {
  MaterialCommunityIcons,
  Ionicons,
  MaterialIcons,
  FontAwesome,
  FontAwesome5,
};

export const Icon: React.FC<IconProps> = ({ 
  library = 'MaterialCommunityIcons', 
  name, 
  size = 24, 
  color = '#000', 
  style 
}) => {
  const IconComponent = IconComponents[library];
  
  return (
    <IconComponent 
      name={name} 
      size={size} 
      color={color} 
      style={style}
    />
  );
};

// Common icon mappings for consistent UI
export const CommonIcons = {
  calendar: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'calendar' },
  clock: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'clock-outline' },
  location: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'map-marker' },
  ticket: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'ticket-outline' },
  qrcode: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'qrcode' },
  user: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'account' },
  email: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'email' },
  phone: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'phone' },
  home: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'home' },
  search: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'magnify' },
  filter: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'filter' },
  heart: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'heart' },
  heartOutline: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'heart-outline' },
  share: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'share' },
  edit: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'pencil' },
  delete: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'delete' },
  settings: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'cog' },
  notification: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'bell' },
  camera: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'camera' },
  gallery: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'image' },
  download: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'download' },
  upload: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'upload' },
  close: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'close' },
  check: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'check' },
  plus: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'plus' },
  minus: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'minus' },
  refresh: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'refresh' },
  back: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'arrow-left' },
  forward: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'arrow-right' },
  up: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'arrow-up' },
  down: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'arrow-down' },
  star: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'star' },
  starOutline: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'star-outline' },
  lock: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'lock' },
  unlock: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'lock-open' },
  eye: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'eye' },
  eyeOff: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'eye-off' },
  warning: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'alert' },
  error: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'alert-circle' },
  success: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'check-circle' },
  info: { library: 'MaterialCommunityIcons' as IconLibrary, name: 'information' },
};

// Convenience component for common icons
interface CommonIconProps {
  type: keyof typeof CommonIcons;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
}

export const CommonIcon: React.FC<CommonIconProps> = ({ type, size, color, style }) => {
  const iconConfig = CommonIcons[type];
  return (
    <Icon 
      library={iconConfig.library}
      name={iconConfig.name}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default Icon;