export declare enum InteractionType {
    CLICK = "click",
    HOVER = "hover",
    SCROLL_PAUSE = "scroll_pause",
    FORM_INTERACTION = "form_interaction",
    SELECTION = "selection"
}
export declare class HeatmapData {
    id: string;
    userId: string;
    sessionId: string;
    pagePath: string;
    interactionType: InteractionType;
    xPosition: number;
    yPosition: number;
    elementSelector: string;
    elementId: string;
    elementText: string;
    dwellTimeMs: number;
    deviceType: string;
    platform: string;
    viewportDimensions: string;
    timestamp: Date;
}
