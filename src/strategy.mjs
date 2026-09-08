const DEFAULTS=Object.freeze({minLiquidityUsd:100000,maxTop10HolderShare:0.30,requireTokenProgram:true,requireMintAuthorityRevoked:true,requireFreezeAuthorityRevoked:true,requireAssetReview:false,livePositionPct:0.10});
let active={...DEFAULTS};
export function strategy(){return {...active}}
export function patchStrategy(patch){active={...active,...patch};return strategy()}
