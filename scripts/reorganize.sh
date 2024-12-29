#!/bin/bash

# Create necessary directories
mkdir -p src/{core/{layers,network},components/{ui,windows},services/{communication,data},plugins,blockchain/integrations,vr/controls,game/{mechanics,ui}}

# Core files
cp code_to_use/code/main_scene.js src/core/Scene.js
cp code_to_use/camera_sync.js src/core/CameraController.js
cp code_to_use/graph_controller.js src/core/GraphController.js
cp code_to_use/performance_tuning.js src/core/PerformanceOptimizer.js
cp code_to_use/resource_manager.js src/core/ResourceManager.js

# Layer files
cp code_to_use/character_layer.js src/core/layers/CharacterLayer.js
cp code_to_use/digital_layer.js src/core/layers/DigitalLayer.js
cp code_to_use/effect_layer.js src/core/layers/EffectLayer.js
cp code_to_use/heatmap_layer.js src/core/layers/HeatmapLayer.js
cp code_to_use/hybrid_layer.js src/core/layers/HybridLayer.js
cp code_to_use/item_layer.js src/core/layers/ItemLayer.js
cp code_to_use/node_layer.js src/core/layers/NodeLayer.js
cp code_to_use/space_layer.js src/core/layers/SpaceLayer.js

# Network and Communication
cp code_to_use/chat_communication.js src/services/communication/ChatService.js
cp code_to_use/realtime_data_communication.js src/services/communication/RealtimeService.js
cp code_to_use/multi_user_sync.js src/services/communication/UserSyncService.js
cp code_to_use/scene_collaboration.js src/services/communication/CollaborationService.js
cp code_to_use/cyberspace_communication_system.js src/services/communication/CommunicationSystem.js

# UI Components
cp code_to_use/chat_ui.js src/components/ui/ChatWindow.js
cp code_to_use/notification_system.js src/components/ui/NotificationSystem.js
cp code_to_use/plugin_manager_window.js src/components/windows/PluginManager.js
cp code_to_use/user_profile.js src/components/ui/UserProfile.js
cp code_to_use/minimap.js src/components/ui/Minimap.js
cp code_to_use/ui_customization.js src/components/ui/Customization.js

# Plugin System
cp code_to_use/plugin_api.js src/plugins/PluginAPI.js
cp code_to_use/plugin_marcetplace.js src/plugins/PluginMarketplace.js

# Data Services
cp code_to_use/nmap_integration.js src/services/data/NmapIntegration.js
cp code_to_use/prometheus_integration.js src/services/data/PrometheusIntegration.js
cp code_to_use/geo_data_integration.js src/services/data/GeoDataIntegration.js
cp code_to_use/node_inspector.js src/services/data/NodeInspector.js

# Game Features
cp code_to_use/pvp_dashboard.js src/game/ui/PvPDashboard.js
cp code_to_use/scoreboard.js src/game/ui/Scoreboard.js

# VR Integration
cp code_to_use/webxr_integration.js src/vr/WebXRIntegration.js

# Server
cp code_to_use/server.js src/server/index.js
cp code_to_use/app.js src/server/app.js

# Security
cp code_to_use/security_user_managment.js src/services/security/UserManagement.js

# Copy upgraded versions
cp code_to_use/character_layer_upgrade.js src/core/layers/CharacterLayerV2.js
cp code_to_use/item_layer_upgrade.js src/core/layers/ItemLayerV2.js
cp code_to_use/space_layer_upgrade.js src/core/layers/SpaceLayerV2.js