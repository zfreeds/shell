// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import * as ipc_service from 'ipc_service'

import type { IpcService } from 'ipc_service'

export enum Direction {
    Left,
    Up,
    Right,
    Down
}

export class Tiler {
    service: IpcService = new ipc_service.IpcService(
        ["pop-tiler"],
        (resp) => this.on_response(resp)
    )

    /** Callbacks that pop-shell will connect to */

    focus: (window: WindowID) => void = () => {}

    focus_workspace: (workspace: number) => void = () => {}
    
    fork_update: (ptr: Ptr, update: ForkUpdate) => void = () => {}
    
    fork_destroy: (ptr: Ptr) => void = () => {}
    
    stack_assign: (ptr: Ptr, window: WindowID) => void = () => {}

    stack_detach: (ptr: Ptr, window: WindowID) => void = () => {}

    stack_destroy: (ptr: Ptr) => void = () => {}

    stack_place: (ptr: Ptr, placement: Placement) => void = () => {}

    stack_move_left: (ptr: Ptr, window: WindowID) => void = () => {}

    stack_move_right: (ptr: Ptr, window: WindowID) => void = () => {}

    stack_visibility: (ptr: Ptr, visible: boolean) => void = () => {}

    window_place: (ptr: WindowID, placement: Placement) => void = () => {}

    window_visibility: (window: WindowID, visible: boolean) => void = () => {}

    workspace_assign: (workspace: number, display: number) => void = () => {}

    /** Instructions to send to the pop-tiler */

    on_response(response: Response) {
        if ("Focus" in response) {
            this.focus(response.Focus)
        } else if ("FocusWorkspace" in response) {
            this.focus_workspace(response.FocusWorkspace)
        } else if ("Fork" in response) {
            const [ptr, update] = response.Fork
            this.fork_update(ptr, update)
        } else if ("ForkDestroy" in response) {
            this.fork_destroy(response.ForkDestroy)
        } else if ("StackAssign" in response) {
            const [ptr, window] = response.StackAssign;
            this.stack_assign(ptr, window)
        } else if ("StackDetach" in response) {
            const [ptr, window] = response.StackDetach
            this.stack_detach(ptr, window)
        } else if ("StackPlace" in response) {
            const [ptr, placement] = response.StackPlace
            this.stack_place(ptr, placement)
        } else if ("StackMovement" in response) {
            const [ptr, movement] = response.StackMovement
            if ("Left" in movement) {
                this.stack_move_left(ptr, movement.Left)
            } else {
                this.stack_move_right(ptr, movement.Right)
            }
        } else if ("StackVisibility" in response) {
            const [ptr, visible] = response.StackVisibility
            this.stack_visibility(ptr, visible)
        } else if ("WindowPlace" in response) {
            const [window, placement] = response.WindowPlace
            this.window_place(window, placement)
        } else if ("WindowVisibility" in response) {
            const [window, visible] = response.WindowVisibility
            this.window_visibility(window, visible)
        } else if ("WorkspaceAssign" in response) {
            const { workspace, display } = response.WorkspaceAssign
            this.workspace_assign(workspace, display)
        }
    }
}

type Response = Focus | FocusWorkspace | Fork | ForkDestroy | StackAssign | StackDetach 
    | StackDestroy | StackPlace | StackMovementResponse | StackVisibility | WindowPlace
    | WindowVisibility | WorkspaceAssign

type WindowID = [number, number]

type Ptr = number

interface Focus {
    "Focus": WindowID
}

interface FocusWorkspace {
    "FocusWorkspace": number
}

interface Fork {
    "Fork": [Ptr, ForkUpdate]
}

interface ForkDestroy {
    "ForkDestroy": Ptr
}

interface StackAssign {
    "StackAssign": [Ptr, WindowID]
}

interface StackDetach {
    "StackDetach": [Ptr, WindowID]
}

interface StackDestroy {
    "StackDestroy": Ptr
}

interface StackPlace {
    "StackPlace": [Ptr, Placement]
}

interface StackMovementResponse {
    "StackMovement": [Ptr, StackMovement]
}

interface StackVisibility {
    "StackVisibility": [Ptr, boolean]
}

interface WindowPlace {
    "WindowPlace": [WindowID, Placement]
}

interface WindowVisibility {
    "WindowVisibility": [WindowID, boolean]
}

interface WorkspaceAssign {
    "WorkspaceAssign": WorkspaceAssignValue
}

interface WorkspaceAssignValue {
    workspace: number
    display: number
}

interface ForkUpdate {
    workspace: number
    orientation: Orientation
    rect: Rect
    handle: number
}

enum Orientation {
    Horizontal,
    Vertical
}

interface Placement {
    area: Rect
    workspace: number
}

interface Rect {
    x: number
    y: number
    width: number
    height: number
}

type StackMovement = StackMoveLeft | StackMoveRight

interface StackMoveLeft {
    "Left": WindowID
}

interface StackMoveRight {
    "Right": WindowID
}