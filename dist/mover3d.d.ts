import { defaultPosition, Point3D } from "shutils/dist/points3d";
import { MoveMode, PhysicsConfig, PhysicsOptions } from "./types";
export declare type PositionAndVelocity = {
    position: Point3D;
    velocity: Point3D;
};
declare type MainValueType = ReturnType<typeof defaultPosition>;
export declare const mover3dState: <T_Name extends string, T_PhysicsNames extends string, T_InitialState extends {
    value?: MainValueType;
    valueGoal?: MainValueType;
    isMoving?: boolean;
    moveConfigName?: T_PhysicsNames;
    moveMode?: MoveMode;
    moveConfigs?: Record<T_PhysicsNames, PhysicsOptions>;
}>(newName: T_Name, initialState?: T_InitialState) => Record<T_Name, Point3D> & Record<`${T_Name}Goal`, Point3D> & Record<`${T_Name}IsMoving`, boolean> & Record<`${T_Name}MoveMode`, MoveMode> & (T_InitialState["moveConfigName"] extends undefined ? {} : Record<`${T_Name}MoveConfigName`, T_PhysicsNames>) & (T_InitialState["moveConfigs"] extends undefined ? {} : Record<`${T_Name}MoveConfigs`, Record<T_PhysicsNames, PhysicsOptions>>);
export declare function mover3dRefs<T_Name extends string>(newName: T_Name, config?: PhysicsConfig): Record<`${T_Name}MoverRefs`, {
    velocity: Point3D;
    recentSpeeds: number[];
    averageSpeed: number;
    canRunOnSlow: boolean;
    stateNames: {
        value: T_Name;
        valueGoal: `${T_Name}Goal`;
        isMoving: `${T_Name}IsMoving`;
        moveMode: `${T_Name}MoveMode`;
        physicsConfigName: `${T_Name}MoveConfigName`;
        physicsConfigs: `${T_Name}MoveConfigs`;
    };
    physicsConfigs: import("./types").DefinedPhysicsConfig;
}>;
export declare function makeMover3dUtils<T_GetState extends () => any, T_GetRefs extends () => any, T_SetState extends (newState: Record<any, any> | ((state: any) => any), callback?: (nextFrameDuration: number) => any) => any>(conceptoFuncs: {
    getState: T_GetState;
    getRefs: T_GetRefs;
    setState: T_SetState;
}): {
    mover3dState: <T_Name extends string, T_PhysicsNames extends string, T_InitialState extends {
        value?: Point3D;
        valueGoal?: Point3D;
        isMoving?: boolean;
        moveConfigName?: T_PhysicsNames;
        moveMode?: MoveMode;
        moveConfigs?: Record<T_PhysicsNames, PhysicsOptions>;
    }>(newName: T_Name, initialState?: T_InitialState) => Record<T_Name, Point3D> & Record<`${T_Name}Goal`, Point3D> & Record<`${T_Name}IsMoving`, boolean> & Record<`${T_Name}MoveMode`, MoveMode> & (T_InitialState["moveConfigName"] extends undefined ? {} : Record<`${T_Name}MoveConfigName`, T_PhysicsNames>) & (T_InitialState["moveConfigs"] extends undefined ? {} : Record<`${T_Name}MoveConfigs`, Record<T_PhysicsNames, PhysicsOptions>>);
    mover3dRefs: typeof mover3dRefs;
    runMover3d: <T_ItemType extends keyof ReturnType<T_GetState> & keyof ReturnType<T_GetRefs>>({ frameDuration, name: itemId, type: itemType, onSlow, mover: moverName, }: {
        onSlow?: () => any;
        name: string;
        type: T_ItemType;
        frameDuration?: number;
        mover: keyof ReturnType<T_GetState>[T_ItemType][keyof ReturnType<T_GetState>[T_ItemType]];
    }) => void;
};
export {};
