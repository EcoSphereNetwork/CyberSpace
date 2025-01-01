import { LayerConfig } from "@/core/layers/Layer";

export const LayerPresets = {
  DEFAULT: {
    visible: true,
    enabled: true,
    opacity: 1,
  } as LayerConfig,

  HIDDEN: {
    visible: false,
    enabled: false,
    opacity: 0,
  } as LayerConfig,

  DISABLED: {
    visible: true,
    enabled: false,
    opacity: 0.5,
  } as LayerConfig,

  TRANSPARENT: {
    visible: true,
    enabled: true,
    opacity: 0.5,
  } as LayerConfig,
};
