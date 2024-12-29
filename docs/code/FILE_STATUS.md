# File Status Documentation

## Already Integrated Files

These files have been integrated into the new structure:

1. Components:
   - RotatingGlobe.js -> src/components/RotatingGlobe.js

2. Layers:
   - physical_layer.js -> src/layers/physical_layer.js

3. Scenes:
   - main_scene.js -> src/scenes/main_scene.js

4. Utils:
   - api.js -> src/utils/api.js

## Files to be Integrated

These files need to be converted to TypeScript and integrated:

### Core Systems
```
code_to_use/app.js -> src/core/App.ts
code_to_use/plugin_api.js -> src/plugins/PluginAPI.ts
code_to_use/plugin_manager_window.js -> src/components/windows/PluginManager.tsx
code_to_use/resource_manager.js -> src/core/ResourceManager.ts
code_to_use/security_user_managment.js -> src/services/auth/SecurityManager.ts
```

### Layers
```
code_to_use/character_layer.js -> src/layers/CharacterLayer.ts
code_to_use/digital_layer.js -> src/layers/DigitalLayer.ts
code_to_use/effect_layer.js -> src/layers/EffectLayer.ts
code_to_use/heatmap_layer.js -> src/layers/HeatmapLayer.ts
code_to_use/hybrid_layer.js -> src/layers/HybridLayer.ts
code_to_use/item_layer.js -> src/layers/ItemLayer.ts
code_to_use/space_layer.js -> src/layers/SpaceLayer.ts
```

### Communication
```
code_to_use/chat_communication.js -> src/services/communication/ChatService.ts
code_to_use/chat_ui.js -> src/components/ui/Chat.tsx
code_to_use/realtime_data_communication.js -> src/services/communication/RealtimeService.ts
code_to_use/scene_collaboration.js -> src/services/collaboration/SceneCollaboration.ts
```

### VR/AR
```
code_to_use/webxr_integration.js -> src/vr/WebXRManager.ts
code_to_use/camera_sync.js -> src/vr/controls/CameraSync.ts
```

### Game Features
```
code_to_use/scoreboard.js -> src/game/ui/Scoreboard.tsx
code_to_use/pvp_dashboard.js -> src/game/ui/PvPDashboard.tsx
code_to_use/user_profile.js -> src/components/ui/UserProfile.tsx
```

### Monitoring
```
code_to_use/performance_tuning.js -> src/utils/PerformanceMonitor.ts
code_to_use/prometheus_integration.js -> src/services/monitoring/PrometheusIntegration.ts
code_to_use/notification_system.js -> src/services/notifications/NotificationSystem.ts
```

## Files Moved to Trash

These files have been moved to the trash directory as they are no longer needed:

1. Empty/Test Files:
   - file.py (empty file)
   - main.py (test file)
   - node_layer.js (empty file)

2. Duplicate Files:
   - node_inspektor.js (duplicate of node_inspector.js)

3. Outdated Documentation:
   - implementierungplan.md
   - main_scene_entwicklungsplan.md
   - cyberspace_communication_plan.md
   - roadmap.md

## Integration Process

For each file to be integrated:

1. Convert to TypeScript
   - Add type definitions
   - Use interfaces
   - Add proper exports

2. Update Dependencies
   - Use modern imports
   - Remove legacy code
   - Update API calls

3. Add Documentation
   - JSDoc comments
   - Usage examples
   - Type information

4. Add Tests
   - Unit tests
   - Integration tests
   - Type tests

## Next Steps

1. Start with Core Systems
   - App.ts
   - PluginAPI.ts
   - ResourceManager.ts

2. Move to Layers
   - Convert layer files
   - Add type definitions
   - Update dependencies

3. Implement Services
   - Communication
   - Authentication
   - Monitoring

4. Add UI Components
   - Convert to React
   - Add TypeScript
   - Implement styling