import { app } from "../../../../../../../scripts/app.js";
import { BaseFastGroupsModeChanger } from "./fast_groups_muter.js";
import { NodeTypesString } from "./constants.js";
import { SERVICE as FAST_GROUPS_SERVICE } from "./services/fast_groups_service.js";
const PROPERTY_SORT = "sort";
const PROPERTY_SORT_CUSTOM_ALPHA = "customSortAlphabet";
const PROPERTY_MATCH_COLORS = "matchColors";
const PROPERTY_MATCH_TITLE = "matchTitle";
const PROPERTY_SHOW_NAV = "showNav";
const PROPERTY_RESTRICTION = "toggleRestriction";
const PROPERTY_PATTERN = "pattern";
export class FastGroupsRadioBypasser extends BaseFastGroupsModeChanger {
    constructor(title = FastGroupsRadioBypasser.title) {
        super(title);
        this.comfyClass = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;
        this.helpActions = "bypass and enable";
        this.modeOn = LiteGraph.ALWAYS;
        this.modeOff = 4;
        this.properties[PROPERTY_MATCH_COLORS] = "";
        this.properties[PROPERTY_PATTERN] = "^Processor - ";
        this.properties[PROPERTY_SHOW_NAV] = true;
        this.properties[PROPERTY_SORT] = "position";
        this.properties[PROPERTY_SORT_CUSTOM_ALPHA] = "";
        this.properties[PROPERTY_RESTRICTION] = "always one";
        this.onConstructed();
    }
    refreshWidgets() {
        var _a, _b, _c, _d, _e;
        const groups = [...FAST_GROUPS_SERVICE.getGroups(((_a = this.properties) === null || _a === void 0 ? void 0 : _a[PROPERTY_SORT]) || "position")];
        const pattern = (_c = (_b = this.properties) === null || _b === void 0 ? void 0 : _b[PROPERTY_PATTERN]) === null || _c === void 0 ? void 0 : _c.trim();
        let filteredGroups = groups;
        if (pattern) {
            try {
                const regex = new RegExp(pattern, "i");
                filteredGroups = groups.filter(group => regex.test(group.title));
            }
            catch (e) {
                console.error('Invalid regex pattern:', e);
                filteredGroups = [];
            }
        }
        let filterColors = (((_e = (_d = this.properties) === null || _d === void 0 ? void 0 : _d[PROPERTY_MATCH_COLORS]) === null || _e === void 0 ? void 0 : _e.split(",")) || []).filter((c) => c.trim());
        if (filterColors.length) {
            filterColors = filterColors.map((color) => {
                color = color.trim().toLocaleLowerCase();
                if (LGraphCanvas.node_colors[color]) {
                    color = LGraphCanvas.node_colors[color].groupcolor;
                }
                color = color.replace("#", "").toLocaleLowerCase();
                if (color.length === 3) {
                    color = color.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                }
                return `#${color}`;
            });
            filteredGroups = filteredGroups.filter(group => {
                var _a;
                let groupColor = (_a = group.color) === null || _a === void 0 ? void 0 : _a.replace("#", "").trim().toLocaleLowerCase();
                if (!groupColor)
                    return false;
                if (groupColor.length === 3) {
                    groupColor = groupColor.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
                }
                groupColor = `#${groupColor}`;
                return filterColors.includes(groupColor);
            });
        }
    }
}
FastGroupsRadioBypasser.type = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;
FastGroupsRadioBypasser.title = NodeTypesString.FAST_GROUPS_RADIO_BYPASSER;
FastGroupsRadioBypasser.exposedActions = ["Bypass all", "Enable all", "Toggle all"];
app.registerExtension({
    name: "rgthree.FastGroupsRadioBypasser",
    registerCustomNodes() {
        FastGroupsRadioBypasser.setUp();
    },
    loadedGraphNode(node) {
        if (node.type == FastGroupsRadioBypasser.title) {
            node.tempSize = [...node.size];
        }
    },
});
