import { addToLimitedArray } from "chootils/dist/arrays";
import { getAverageSpeed } from "chootils/dist/speedAngleDistance";
import { getRefs, getState, setState } from "repond";
import { defaultOptions, defaultPhysics, 
// maximumFrameTime,
physicsTimestep, physicsTimestepInSeconds, recentSpeedsAmount, } from "./consts";
import { makeMoverStateMaker, makeStateNames, normalizeDefinedPhysicsConfig } from "./utils";
const DEFAULT_SPRING_STOP_SPEED = defaultPhysics("1d").stopSpeed;
// manually retyped because d.ts had some trouble with nested functions?
export const moverState = makeMoverStateMaker(() => 0);
export function moverRefs(newName, config) {
    const newRefs = {
        velocity: 0,
        recentSpeeds: [],
        stateNames: makeStateNames(newName),
        physicsConfigs: normalizeDefinedPhysicsConfig(config, "1d"),
    };
    return {
        [`${newName}MoverRefs`]: newRefs,
    };
}
const rerunOptions = {
    frameDuration: 16.6667,
    name: "",
    type: "",
    onSlow: undefined,
    mover: "",
    autoRerun: true,
};
export function runMover1d({ frameDuration = 16.6667, type: itemType, name: itemId, mover: moverName, autoRerun, }) {
    var _a, _b, _c, _d;
    // repeated for all movers Start
    const itemRefs = getRefs()[itemType][itemId];
    const itemState = getState()[itemType][itemId];
    const moverRefs = itemRefs[`${moverName}MoverRefs`];
    const keys = moverRefs.stateNames;
    const nowStepState = {
        position: itemState[keys.value],
        velocity: moverRefs.velocity,
    };
    const prevStepState = {
        position: nowStepState.position,
        velocity: nowStepState.velocity,
    };
    const moveMode = (_a = itemState[keys.moveMode]) !== null && _a !== void 0 ? _a : defaultOptions.moveMode;
    const physicsConfigs = (_b = itemState[keys.physicsConfigs]) !== null && _b !== void 0 ? _b : moverRefs.physicsConfigs;
    const physicsOptions = (_c = physicsConfigs[itemState === null || itemState === void 0 ? void 0 : itemState[keys === null || keys === void 0 ? void 0 : keys.physicsConfigName]]) !== null && _c !== void 0 ? _c : physicsConfigs[defaultOptions.physicsConfigName];
    const targetPosition = itemState[keys.valueGoal];
    let timeRemainingForPhysics = frameDuration;
    // repeated for all movers End
    prevStepState.position = nowStepState.position;
    prevStepState.velocity = nowStepState.velocity;
    const springStopSpeed = (_d = physicsOptions.stopSpeed) !== null && _d !== void 0 ? _d : DEFAULT_SPRING_STOP_SPEED;
    while (timeRemainingForPhysics >= physicsTimestep) {
        // prevStepState = currentStepState;
        // currentStepState = runPhysicsStep(
        run1dPhysicsStep(nowStepState, targetPosition, moveMode, physicsOptions);
        timeRemainingForPhysics -= physicsTimestep;
    }
    // TODO maybe set the new position based on the current position like mover 3d
    let interpolatedPosition = nowStepState.position;
    // caused it to stop working on iPad ?
    // const remainingTimestepPercent = timeRemainingForPhysics / physicsTimestep;
    // interpolatedPosition = interpolateValues(
    //   currentStepState.position,
    //   prevStepState.position,
    //   remainingTimestepPercent
    // );
    const currentSpeed = Math.abs(nowStepState.velocity);
    addToLimitedArray(moverRefs.recentSpeeds, currentSpeed, recentSpeedsAmount);
    moverRefs.velocity = nowStepState.velocity;
    const hasEnoughSpeeds = moverRefs.recentSpeeds.length >= recentSpeedsAmount - 1;
    const averageSpeed = hasEnoughSpeeds ? getAverageSpeed(moverRefs.recentSpeeds) : Infinity;
    const isNearTarget = Math.abs(itemState[keys.value] - targetPosition) < 0.01;
    let isStillMoving = Math.abs(averageSpeed) > 0.003;
    let shouldStopMoving = !isStillMoving;
    if (moveMode === "spring") {
        let isStillMoving = Math.abs(averageSpeed) > springStopSpeed;
        shouldStopMoving = !isStillMoving && isNearTarget;
    }
    if (shouldStopMoving) {
        // console.log("should stop moving");
        setState({
            [itemType]: { [itemId]: { [keys.isMoving]: false } },
        });
    }
    setState({ [itemType]: { [itemId]: { [keys.value]: interpolatedPosition } } }, autoRerun
        ? (nextFrameDuration) => {
            const newItemState = getState()[itemType][itemId];
            if (newItemState === null || newItemState === void 0 ? void 0 : newItemState[keys.isMoving]) {
                rerunOptions.frameDuration = nextFrameDuration;
                rerunOptions.name = itemId;
                rerunOptions.type = itemType;
                rerunOptions.mover = moverName;
                rerunOptions.autoRerun = autoRerun;
                runMover1d(rerunOptions);
            }
        }
        : undefined);
}
function run1dPhysicsStep(stepState, targetPosition, moveMode = "spring", physicsOptions) {
    const { stiffness, damping, mass, friction } = physicsOptions;
    let newVelocity = stepState.velocity;
    switch (moveMode) {
        case "spring":
            {
                const positionDifference = stepState.position - targetPosition;
                const springForce = positionDifference * -stiffness;
                const dampingForce = stepState.velocity * damping;
                const force = springForce - dampingForce;
                const acceleration = force / mass;
                const accelerationWithTime = acceleration * physicsTimestep;
                newVelocity = stepState.velocity + accelerationWithTime;
            }
            break;
        case "slide":
            newVelocity = stepState.velocity * Math.pow(1 - friction, physicsTimestepInSeconds * 10);
            break;
        case "drag":
            break;
        case "push":
            break;
        default:
    }
    const amountMoved = newVelocity * physicsTimestepInSeconds;
    let newAmount = stepState.position + amountMoved;
    stepState.position = newAmount;
    stepState.velocity = newVelocity;
}
// }
