import { app } from "scripts/app.js";
import { BaseFastGroupsModeChanger } from "./fast_groups_muter.js";
import { RgthreeBaseVirtualNode } from "./base_node.js";
import { NodeTypesString } from "./constants.js";
import {
  type LGraphNode,
  type LGraph as TLGraph,
  LGraphCanvas as TLGraphCanvas,
  Vector2,
  SerializedLGraphNode,
  IWidget,
} from "typings/litegraph.js";
import { SERVICE as FAST_GROUPS_SERVICE } from "./services/fast_groups_service.js";
import { drawNodeWidget, fitString } from "./utils_canvas.js";
import { RgthreeBaseVirtualNodeConstructor } from "typings/rgthree.js";

const PROPERTY_SORT = "sort";
const PROPERTY_SORT_CUSTOM_ALPHA = "customSortAlphabet";
const PROPERTY_MATCH_COLORS = "matchColors";
const PROPERTY_MATCH_TITLE = "matchTitle";
const PROPERTY_SHOW_NAV = "showNav";
const PROPERTY_RESTRICTION = "toggleRestriction";
const PROPERTY_PATTERN = "pattern";

/**
 * Fast Radio Bypasser implementation that looks for groups matching a pattern in the workflow
 * and adds radio button style toggles to bypass them.
 */
export class FastGroupsRadioBypasser extends BaseFastGroupsModeChanger {
  static override type = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;
  static override title = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;
  override comfyClass = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;

  static override exposedActions = ["Bypass all", "Enable all", "Toggle all"];

  protected override helpActions = "bypass and enable";

  override readonly modeOn = LiteGraph.ALWAYS;
  override readonly modeOff = 4; // Used by Comfy for "bypass"

  constructor(title = FastGroupsRadioBypasser.title) {
    super(title);
    // Set default property values
    this.properties[PROPERTY_MATCH_COLORS] = "";      // Keep color matching
    this.properties[PROPERTY_PATTERN] = "^Processor - "; // New pattern property instead of MATCH_TITLE
    this.properties[PROPERTY_SHOW_NAV] = true;
    this.properties[PROPERTY_SORT] = "position";
    this.properties[PROPERTY_SORT_CUSTOM_ALPHA] = "";
    this.properties[PROPERTY_RESTRICTION] = "always one"; // Default to radio button behavior
    this.onConstructed();
  }

  override refreshWidgets() {
    const groups = [...FAST_GROUPS_SERVICE.getGroups(this.properties?.[PROPERTY_SORT] || "position")];
    
    // Filter groups by pattern
    const pattern = this.properties?.[PROPERTY_PATTERN]?.trim();
    let filteredGroups = groups;
    if (pattern) {
      try {
        const regex = new RegExp(pattern, "i");
        filteredGroups = groups.filter(group => regex.test(group.title));
      } catch (e) {
        console.error('Invalid regex pattern:', e);
        filteredGroups = [];
      }
    }

    // Filter by colors if specified
    let filterColors = (
      (this.properties?.[PROPERTY_MATCH_COLORS] as string)?.split(",") || []
    ).filter((c) => c.trim());
    if (filterColors.length) {
      filterColors = filterColors.map((color) => {
        color = color.trim().toLocaleLowerCase();
        if (LGraphCanvas.node_colors[color]) {
          color = LGraphCanvas.node_colors[color]!.groupcolor;
        }
        color = color.replace("#", "").toLocaleLowerCase();
        if (color.length === 3) {
          color = color.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
        }
        return `#${color}`;
      });
      
      filteredGroups = filteredGroups.filter(group => {
        let groupColor = group.color?.replace("#", "").trim().toLocaleLowerCase();
        if (!groupColor) return false;
        if (groupColor.length === 3) {
          groupColor = groupColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
        }
        groupColor = `#${groupColor}`;
        return filterColors.includes(groupColor);
      });
    }

    // Rest of widget handling remains similar to parent class but works with filteredGroups
    // ... (rest of the widget handling code)
  }
}

// Register the extension
app.registerExtension({
  name: "rgthree.FastGroupsRadioBypasser",
  registerCustomNodes() {
    FastGroupsRadioBypasser.setUp();
  },
  loadedGraphNode(node: FastGroupsRadioBypasser) {
    if (node.type == FastGroupsRadioBypasser.title) {
      node.tempSize = [...node.size];
    }
  },
});