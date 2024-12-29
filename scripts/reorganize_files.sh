#!/bin/bash

# Create all necessary directories
mkdir -p /workspace/src/{core/{layers,network},components/{ui,windows},services/{communication,data,security},plugins,blockchain/integrations,vr/controls,game/{mechanics,ui},utils}

cd /workspace/CyberSpace/code_to_use

# Core Components
cp camera_sync.js /workspace/src/core/camera.js
cp graph_controller.js /workspace/src/core/graph.js
cp performance_tuning.js /workspace/src/core/performance.js
cp resource_manager.js /workspace/src/core/resources.js
cp scene_collaboration.js /workspace/src/core/collaboration.js
cp code/main_scene.js /workspace/src/core/scene.js

# Layers
mkdir -p /workspace/src/core/layers
cp character_layer.js /workspace/src/core/layers/character.js
cp character_layer_upgrade.js /workspace/src/core/layers/character_v2.js
cp digital_layer.js /workspace/src/core/layers/digital.js
cp effect_layer.js /workspace/src/core/layers/effect.js
cp heatmap_layer.js /workspace/src/core/layers/heatmap.js
cp hybrid_layer.js /workspace/src/core/layers/hybrid.js
cp item_layer.js /workspace/src/core/layers/item.js
cp item_layer_upgrade.js /workspace/src/core/layers/item_v2.js
cp node_layer.js /workspace/src/core/layers/node.js
cp space_layer.js /workspace/src/core/layers/space.js
cp space_layer_upgrade.js /workspace/src/core/layers/space_v2.js

# Network & Communication
mkdir -p /workspace/src/core/network
cp chat_communication.js /workspace/src/core/network/chat.js
cp cyberspace_communication_system.js /workspace/src/core/network/system.js
cp multi_user_sync.js /workspace/src/core/network/sync.js
cp realtime_data_communication.js /workspace/src/core/network/realtime.js

# UI Components
mkdir -p /workspace/src/components/ui
cp chat_ui.js /workspace/src/components/ui/chat.js
cp minimap.js /workspace/src/components/ui/minimap.js
cp notification_system.js /workspace/src/components/ui/notifications.js
cp plugin_manager_window.js /workspace/src/components/ui/plugin_manager.js
cp ui_customization.js /workspace/src/components/ui/customization.js
cp user_profile.js /workspace/src/components/ui/profile.js
cp pvp_dashboard.js /workspace/src/components/ui/pvp_dashboard.js
cp scoreboard.js /workspace/src/components/ui/scoreboard.js

# Services
mkdir -p /workspace/src/services/{data,security}
cp nmap_integration.js /workspace/src/services/data/nmap.js
cp prometheus_integration.js /workspace/src/services/data/prometheus.js
cp geo_data_integration.js /workspace/src/services/data/geodata.js
cp node_inspector.js /workspace/src/services/data/node_inspector.js
cp node_inspektor.js /workspace/src/services/data/node_inspector_legacy.js
cp security_user_managment.js /workspace/src/services/security/user_management.js

# Plugin System
mkdir -p /workspace/src/plugins
cp plugin_api.js /workspace/src/plugins/api.js
cp plugin_marcetplace.js /workspace/src/plugins/marketplace.js

# VR/AR
mkdir -p /workspace/src/vr
cp webxr_integration.js /workspace/src/vr/webxr.js

# Game Features
mkdir -p /workspace/src/game/{mechanics,ui}
cp conflict_avoidance.js /workspace/src/game/mechanics/conflict.js
cp heaatmap_visualisation.js /workspace/src/game/mechanics/heatmap.js

# Server
mkdir -p /workspace/src/server
cp server.js /workspace/src/server/index.js
cp app.js /workspace/src/server/app.js

# Create index files for each major directory
echo "export * from './layers';\nexport * from './network';\nexport * from './scene';\nexport * from './camera';\nexport * from './graph';\nexport * from './performance';\nexport * from './resources';\nexport * from './collaboration';" > /workspace/src/core/index.js

echo "export * from './ui';" > /workspace/src/components/index.js

echo "export * from './chat';\nexport * from './minimap';\nexport * from './notifications';\nexport * from './plugin_manager';\nexport * from './customization';\nexport * from './profile';\nexport * from './pvp_dashboard';\nexport * from './scoreboard';" > /workspace/src/components/ui/index.js

echo "export * from './data';\nexport * from './security';" > /workspace/src/services/index.js

echo "export * from './api';\nexport * from './marketplace';" > /workspace/src/plugins/index.js

echo "export * from './mechanics';\nexport * from './ui';" > /workspace/src/game/index.js